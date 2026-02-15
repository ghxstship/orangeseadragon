/**
 * Push Notification Service
 * 
 * Handles push notification registration, permissions, and delivery
 * for operations alerts including incidents, schedule changes, and cue reminders.
 */

export type NotificationType = 
  | 'incident_critical'
  | 'incident_assigned'
  | 'incident_update'
  | 'schedule_change'
  | 'cue_reminder'
  | 'assignment'
  | 'message'
  | 'system';

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationPreferences {
  enabled: boolean;
  incidents: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
    assigned_only: boolean;
  };
  schedules: {
    changes: boolean;
    reminders: boolean;
    reminder_minutes: number;
  };
  cues: {
    reminders: boolean;
    reminder_seconds: number;
  };
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  incidents: {
    critical: true,
    high: true,
    medium: true,
    low: false,
    assigned_only: false,
  },
  schedules: {
    changes: true,
    reminders: true,
    reminder_minutes: 15,
  },
  cues: {
    reminders: true,
    reminder_seconds: 300,
  },
  quiet_hours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
};

class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private permissionStatus: NotificationPermission = 'default';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    this.permissionStatus = Notification.permission;
    
    // Load saved preferences
    const savedPrefs = localStorage.getItem('notification_preferences');
    if (savedPrefs) {
      this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) };
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    return true;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    this.permissionStatus = await Notification.requestPermission();
    return this.permissionStatus;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permissionStatus;
  }

  isPermissionGranted(): boolean {
    return this.permissionStatus === 'granted';
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
  }

  private isInQuietHours(): boolean {
    if (!this.preferences.quiet_hours.enabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quiet_hours.start.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quiet_hours.end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes < endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  private shouldShowNotification(payload: NotificationPayload): boolean {
    if (!this.preferences.enabled) return false;
    if (!this.isPermissionGranted()) return false;

    // Critical incidents always show (except in quiet hours if not critical)
    if (payload.type === 'incident_critical') {
      return true;
    }

    if (this.isInQuietHours()) return false;

    switch (payload.type) {
      case 'incident_assigned':
      case 'incident_update':
        return this.preferences.incidents.high || this.preferences.incidents.medium;
      case 'schedule_change':
        return this.preferences.schedules.changes;
      case 'cue_reminder':
        return this.preferences.cues.reminders;
      case 'assignment':
        return true;
      default:
        return true;
    }
  }

  async show(payload: NotificationPayload): Promise<void> {
    if (!this.shouldShowNotification(payload)) return;

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/notification-icon.png',
      badge: payload.badge || '/icons/badge-icon.png',
      tag: payload.tag || payload.id,
      data: payload.data,
      requireInteraction: payload.requireInteraction ?? payload.type === 'incident_critical',
      silent: payload.silent ?? false,
    };

    if (payload.actions && this.swRegistration) {
      // Use service worker for action buttons (supports actions)
      await this.swRegistration.showNotification(payload.title, {
        ...options,
        actions: payload.actions,
      } as NotificationOptions & { actions: unknown[] });
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      // Fallback to basic notification
      const notification = new Notification(payload.title, options);
      
      notification.onclick = () => {
        window.focus();
        if (payload.data?.url) {
          const url = payload.data.url as string;
          const handled = !window.dispatchEvent(
            new CustomEvent('app:navigate', {
              detail: { href: url },
              cancelable: true,
            })
          );
          if (!handled) {
            window.location.assign(url);
          }
        }
        notification.close();
      };
    }
  }

  async showIncidentAlert(incident: {
    id: string;
    title: string;
    severity: string;
    location: string;
    type: string;
  }): Promise<void> {
    const isCritical = incident.severity === 'critical';
    
    await this.show({
      id: `incident-${incident.id}`,
      type: isCritical ? 'incident_critical' : 'incident_update',
      title: isCritical ? '🚨 CRITICAL INCIDENT' : `⚠️ ${incident.severity.toUpperCase()} Incident`,
      body: `${incident.title}\n📍 ${incident.location}`,
      tag: `incident-${incident.id}`,
      requireInteraction: isCritical,
      data: {
        url: `/operations/incidents/${incident.id}`,
        incidentId: incident.id,
      },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dispatch', title: 'Dispatch' },
      ],
    });
  }

  async showCueReminder(cue: {
    id: string;
    name: string;
    runsheetId: string;
    secondsUntil: number;
  }): Promise<void> {
    const minutes = Math.floor(cue.secondsUntil / 60);
    const timeText = minutes > 0 ? `${minutes} min` : `${cue.secondsUntil} sec`;

    await this.show({
      id: `cue-${cue.id}`,
      type: 'cue_reminder',
      title: `⏱️ Cue Coming Up`,
      body: `"${cue.name}" in ${timeText}`,
      tag: `cue-${cue.id}`,
      data: {
        url: `/operations/runsheets/${cue.runsheetId}/show-mode`,
        cueId: cue.id,
      },
    });
  }

  async showScheduleChange(change: {
    id: string;
    type: 'added' | 'modified' | 'cancelled';
    eventName: string;
    details: string;
  }): Promise<void> {
    const icons = {
      added: '➕',
      modified: '📝',
      cancelled: '❌',
    };

    await this.show({
      id: `schedule-${change.id}`,
      type: 'schedule_change',
      title: `${icons[change.type]} Schedule ${change.type.charAt(0).toUpperCase() + change.type.slice(1)}`,
      body: `${change.eventName}\n${change.details}`,
      tag: `schedule-${change.id}`,
      data: {
        url: `/operations/runsheets`,
        changeId: change.id,
      },
    });
  }

  async showAssignment(assignment: {
    id: string;
    type: string;
    title: string;
    dueDate?: string;
  }): Promise<void> {
    await this.show({
      id: `assignment-${assignment.id}`,
      type: 'assignment',
      title: `📋 New Assignment`,
      body: `${assignment.title}${assignment.dueDate ? `\nDue: ${assignment.dueDate}` : ''}`,
      tag: `assignment-${assignment.id}`,
      data: {
        url: `/operations/work-orders/${assignment.id}`,
        assignmentId: assignment.id,
      },
    });
  }

  // Subscribe to push notifications via server
  async subscribeToPush(serverUrl: string): Promise<PushSubscription | null> {
    if (!this.swRegistration) return null;

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      await fetch(`${serverUrl}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      return true;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
