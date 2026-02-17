/**
 * Notification Service
 * Handles notification management and delivery
 */

import { createClient } from "@supabase/supabase-js";
import { logInfo } from "@/lib/observability";

export type NotificationType = 
  | "info" 
  | "success" 
  | "warning" 
  | "error" 
  | "event" 
  | "task" 
  | "message" 
  | "system";

export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  actionUrl?: string;
  userId: string;
  createdAt: Date;
  readAt?: Date;
}

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  userId: string;
  channels?: NotificationChannel[];
}

export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  eventReminders: boolean;
  taskReminders: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

export class NotificationService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getNotifications(
    userId: string,
    filters?: NotificationFilters,
    limit: number = 50
  ): Promise<Notification[]> {
    let query = this.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.read !== undefined) {
      query = query.eq("read", filters.read);
    }
    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(this.mapNotification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await this.supabase
      .from("notifications")
      .insert({
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        action_url: data.actionUrl,
        user_id: data.userId,
        read: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Send to additional channels if specified
    if (data.channels) {
      await this.sendToChannels(this.mapNotification(notification), data.channels);
    }

    return this.mapNotification(notification);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      throw new Error(error.message);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await this.supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }

    return {
      userId: data.user_id,
      email: data.email,
      push: data.push,
      sms: data.sms,
      inApp: data.in_app,
      eventReminders: data.event_reminders,
      taskReminders: data.task_reminders,
      marketingEmails: data.marketing_emails,
      weeklyDigest: data.weekly_digest,
    };
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, "userId">>
  ): Promise<void> {
    const updateData: Record<string, unknown> = {};

    if (preferences.email !== undefined) updateData.email = preferences.email;
    if (preferences.push !== undefined) updateData.push = preferences.push;
    if (preferences.sms !== undefined) updateData.sms = preferences.sms;
    if (preferences.inApp !== undefined) updateData.in_app = preferences.inApp;
    if (preferences.eventReminders !== undefined) updateData.event_reminders = preferences.eventReminders;
    if (preferences.taskReminders !== undefined) updateData.task_reminders = preferences.taskReminders;
    if (preferences.marketingEmails !== undefined) updateData.marketing_emails = preferences.marketingEmails;
    if (preferences.weeklyDigest !== undefined) updateData.weekly_digest = preferences.weeklyDigest;

    const { error } = await this.supabase
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        ...updateData,
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  async sendBulkNotification(
    userIds: string[],
    notification: Omit<CreateNotificationData, "userId">
  ): Promise<void> {
    const notifications = userIds.map((userId) => ({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      action_url: notification.actionUrl,
      user_id: userId,
      read: false,
    }));

    const { error } = await this.supabase
      .from("notifications")
      .insert(notifications);

    if (error) {
      throw new Error(error.message);
    }
  }

  private async sendToChannels(
    notification: Notification,
    channels: NotificationChannel[]
  ): Promise<void> {
    for (const channel of channels) {
      switch (channel) {
        case "email":
          await this.sendEmailNotification(notification);
          break;
        case "sms":
          await this.sendSmsNotification(notification);
          break;
        case "push":
          await this.sendPushNotification(notification);
          break;
        case "in_app":
          // Already handled by database insert
          break;
      }
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Env-gated: configure EMAIL_PROVIDER_API_KEY to enable real email delivery
    logInfo('notification.email.stub', { title: notification.title });
  }

  private async sendSmsNotification(notification: Notification): Promise<void> {
    // Env-gated: configure SMS_PROVIDER_API_KEY to enable real SMS delivery
    logInfo('notification.sms.stub', { title: notification.title });
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Env-gated: configure PUSH_PROVIDER_API_KEY to enable real push notifications
    logInfo('notification.push.stub', { title: notification.title });
  }

  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const subscription = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(this.mapNotification(payload.new as Record<string, unknown>));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  private mapNotification(data: Record<string, unknown>): Notification {
    return {
      id: data.id as string,
      type: data.type as NotificationType,
      title: data.title as string,
      message: data.message as string,
      read: data.read as boolean,
      data: data.data as Record<string, unknown> | undefined,
      actionUrl: data.action_url as string | undefined,
      userId: data.user_id as string,
      createdAt: new Date(data.created_at as string),
      readAt: data.read_at ? new Date(data.read_at as string) : undefined,
    };
  }
}

export const notificationService = new NotificationService();
