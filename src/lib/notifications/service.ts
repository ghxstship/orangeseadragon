/**
 * Notification Service
 * Handles sending notifications across multiple channels
 */

import type {
  Notification,
  NotificationChannel,
  NotificationCategory,
  NotificationRecipient,
  NotificationServiceConfig,
  NotificationStats,
  NotificationStatus,
  NotificationTemplate,
  SendNotificationRequest,
  SendNotificationResponse,
} from "./types";

type NotificationEventType =
  | "notification.created"
  | "notification.sent"
  | "notification.delivered"
  | "notification.failed"
  | "notification.read";

type NotificationEventHandler = (
  event: NotificationEventType,
  data: Record<string, unknown>
) => void | Promise<void>;

export class NotificationService {
  private config: NotificationServiceConfig;
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private preferences: Map<string, NotificationRecipient["preferences"]> = new Map();
  private eventHandlers: NotificationEventHandler[] = [];
  private queue: Notification[] = [];
  private processing = false;

  constructor(config: Partial<NotificationServiceConfig> = {}) {
    this.config = {
      defaultChannel: "in_app",
      retryPolicy: {
        maxRetries: 3,
        backoffMs: [1000, 5000, 15000],
      },
      rateLimits: {
        email: { maxPerMinute: 60, maxPerHour: 500, maxPerDay: 5000 },
        sms: { maxPerMinute: 30, maxPerHour: 200, maxPerDay: 1000 },
        push: { maxPerMinute: 100, maxPerHour: 1000, maxPerDay: 10000 },
        in_app: { maxPerMinute: 200, maxPerHour: 2000, maxPerDay: 20000 },
      },
      ...config,
    };
  }

  // ==================== Configuration ====================

  configure(config: Partial<NotificationServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): NotificationServiceConfig {
    return { ...this.config };
  }

  // ==================== Event Handling ====================

  onEvent(handler: NotificationEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) this.eventHandlers.splice(index, 1);
    };
  }

  private async emitEvent(
    event: NotificationEventType,
    data: Record<string, unknown>
  ): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(event, data);
      } catch (error) {
        console.error(`Notification event handler error:`, error);
      }
    }
  }

  // ==================== Send Notifications ====================

  async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
    const channels = request.channels || [request.channel || this.config.defaultChannel];
    const notificationIds: string[] = [];
    const errors: Array<{ channel: NotificationChannel; error: string }> = [];

    for (const channel of channels) {
      try {
        const notification = await this.createNotification(request, channel);
        notificationIds.push(notification.id);

        if (request.scheduledFor && request.scheduledFor > new Date()) {
          // Schedule for later
          this.scheduleNotification(notification);
        } else {
          // Send immediately
          this.queue.push(notification);
          this.processQueue();
        }

        await this.emitEvent("notification.created", {
          notificationId: notification.id,
          channel,
        });
      } catch (error) {
        errors.push({
          channel,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: errors.length === 0,
      notificationIds,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async sendBulk(
    requests: SendNotificationRequest[]
  ): Promise<SendNotificationResponse[]> {
    return Promise.all(requests.map((req) => this.send(req)));
  }

  async sendToUsers(
    userIds: string[],
    request: Omit<SendNotificationRequest, "recipientId" | "recipient">
  ): Promise<SendNotificationResponse[]> {
    return Promise.all(
      userIds.map((userId) => this.send({ ...request, recipientId: userId }))
    );
  }

  // ==================== Notification Management ====================

  private async createNotification(
    request: SendNotificationRequest,
    channel: NotificationChannel
  ): Promise<Notification> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let title = request.title;
    let body = request.body;
    let htmlBody = request.htmlBody;
    let subject = request.subject;

    // Apply template if specified
    if (request.templateId) {
      const template = this.templates.get(request.templateId);
      if (template) {
        const vars = request.templateVariables || {};
        title = this.interpolate(template.title, vars);
        body = this.interpolate(template.body, vars);
        if (template.htmlBody) {
          htmlBody = this.interpolate(template.htmlBody, vars);
        }
        if (template.subject) {
          subject = this.interpolate(template.subject, vars);
        }
      }
    }

    const notification: Notification = {
      id,
      organizationId: "",
      recipient: request.recipient as NotificationRecipient || { userId: request.recipientId || "" },
      channel,
      category: request.category,
      priority: request.priority || "normal",
      subject,
      title,
      body,
      htmlBody,
      data: request.data,
      actions: request.actions,
      status: "pending",
      retryCount: 0,
      maxRetries: this.config.retryPolicy.maxRetries,
      scheduledFor: request.scheduledFor,
      expiresAt: request.expiresAt,
      templateId: request.templateId,
      templateVariables: request.templateVariables,
      metadata: request.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notifications.set(id, notification);
    return notification;
  }

  private interpolate(
    template: string,
    variables: Record<string, unknown>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(variables[key] ?? `{{${key}}}`);
    });
  }

  async getNotification(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async getUserNotifications(
    userId: string,
    options: {
      status?: NotificationStatus[];
      category?: NotificationCategory[];
      channel?: NotificationChannel[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values()).filter(
      (n) => n.recipient.userId === userId
    );

    if (options.status?.length) {
      notifications = notifications.filter((n) => options.status!.includes(n.status));
    }
    if (options.category?.length) {
      notifications = notifications.filter((n) => options.category!.includes(n.category));
    }
    if (options.channel?.length) {
      notifications = notifications.filter((n) => options.channel!.includes(n.channel));
    }

    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return notifications.slice(offset, offset + limit);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.status = "read";
    notification.readAt = new Date();
    notification.updatedAt = new Date();

    await this.emitEvent("notification.read", { notificationId });
    return true;
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const notification of Array.from(this.notifications.values())) {
      if (
        notification.recipient.userId === userId &&
        notification.status !== "read"
      ) {
        notification.status = "read";
        notification.readAt = new Date();
        notification.updatedAt = new Date();
        count++;
      }
    }
    return count;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // ==================== Queue Processing ====================

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const notification = this.queue.shift();
      if (!notification) continue;

      try {
        await this.sendNotification(notification);
      } catch (error) {
        console.error(`Failed to send notification ${notification.id}:`, error);
        await this.handleSendFailure(notification, error);
      }
    }

    this.processing = false;
  }

  private async sendNotification(notification: Notification): Promise<void> {
    notification.status = "queued";
    notification.updatedAt = new Date();

    try {
      switch (notification.channel) {
        case "email":
          await this.sendEmail(notification);
          break;
        case "push":
          await this.sendPush(notification);
          break;
        case "sms":
          await this.sendSMS(notification);
          break;
        case "in_app":
          await this.sendInApp(notification);
          break;
        case "slack":
          await this.sendSlack(notification);
          break;
        case "webhook":
          await this.sendWebhook(notification);
          break;
      }

      notification.status = "sent";
      notification.sentAt = new Date();
      notification.updatedAt = new Date();

      await this.emitEvent("notification.sent", {
        notificationId: notification.id,
        channel: notification.channel,
      });
    } catch (error) {
      throw error;
    }
  }

  private async handleSendFailure(
    notification: Notification,
    error: unknown
  ): Promise<void> {
    notification.retryCount++;
    notification.updatedAt = new Date();

    if (notification.retryCount >= notification.maxRetries) {
      notification.status = "failed";
      notification.failedAt = new Date();
      notification.failureReason =
        error instanceof Error ? error.message : "Unknown error";

      await this.emitEvent("notification.failed", {
        notificationId: notification.id,
        error: notification.failureReason,
      });
    } else {
      // Retry with backoff
      const backoffMs =
        this.config.retryPolicy.backoffMs[notification.retryCount - 1] || 15000;
      setTimeout(() => {
        this.queue.push(notification);
        this.processQueue();
      }, backoffMs);
    }
  }

  private scheduleNotification(notification: Notification): void {
    if (!notification.scheduledFor) return;

    const delay = notification.scheduledFor.getTime() - Date.now();
    if (delay <= 0) {
      this.queue.push(notification);
      this.processQueue();
    } else {
      setTimeout(() => {
        this.queue.push(notification);
        this.processQueue();
      }, delay);
    }
  }

  // ==================== Channel Implementations ====================

  private async sendEmail(notification: Notification): Promise<void> {
    if (!this.config.email) {
      throw new Error("Email not configured");
    }

    const response = await fetch("/api/notifications/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: notification.recipient.email,
        subject: notification.subject || notification.title,
        body: notification.body,
        html: notification.htmlBody,
        notification_id: notification.id,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Email send failed: ${response.status}`);
    }
  }

  private async sendPush(notification: Notification): Promise<void> {
    if (!this.config.push) {
      throw new Error("Push notifications not configured");
    }

    console.log(`[PUSH] To: ${notification.recipient.pushToken}`);
    console.log(`[PUSH] Title: ${notification.title}`);
    console.log(`[PUSH] Body: ${notification.body}`);

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  private async sendSMS(notification: Notification): Promise<void> {
    if (!this.config.sms) {
      throw new Error("SMS not configured");
    }

    console.log(`[SMS] To: ${notification.recipient.phone}`);
    console.log(`[SMS] Body: ${notification.body}`);

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async sendInApp(notification: Notification): Promise<void> {
    // In-app notifications are stored and delivered via real-time subscriptions
    notification.status = "delivered";
    notification.deliveredAt = new Date();

    await this.emitEvent("notification.delivered", {
      notificationId: notification.id,
      userId: notification.recipient.userId,
    });
  }

  private async sendSlack(notification: Notification): Promise<void> {
    if (!this.config.slack) {
      throw new Error("Slack not configured");
    }

    console.log(`[SLACK] To: ${notification.recipient.slackUserId}`);
    console.log(`[SLACK] Message: ${notification.body}`);

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async sendWebhook(notification: Notification): Promise<void> {
    if (!this.config.webhook) {
      throw new Error("Webhook not configured");
    }

    console.log(`[WEBHOOK] URL: ${this.config.webhook.url}`);
    console.log(`[WEBHOOK] Payload:`, notification);

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // ==================== Templates ====================

  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): NotificationTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // ==================== User Preferences ====================

  setUserPreferences(
    userId: string,
    preferences: NotificationRecipient["preferences"]
  ): void {
    this.preferences.set(userId, preferences);
  }

  getUserPreferences(
    userId: string
  ): NotificationRecipient["preferences"] | null {
    return this.preferences.get(userId) || null;
  }

  // ==================== Statistics ====================

  async getStats(organizationId?: string): Promise<NotificationStats> {
    let notifications = Array.from(this.notifications.values());

    if (organizationId) {
      notifications = notifications.filter(
        (n) => n.organizationId === organizationId
      );
    }

    const stats: NotificationStats = {
      total: notifications.length,
      sent: 0,
      delivered: 0,
      failed: 0,
      read: 0,
      pending: 0,
      byChannel: {},
      byCategory: {},
    };

    for (const n of notifications) {
      switch (n.status) {
        case "sent":
          stats.sent++;
          break;
        case "delivered":
          stats.delivered++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "read":
          stats.read++;
          break;
        case "pending":
        case "queued":
          stats.pending++;
          break;
      }

      // By channel
      if (!stats.byChannel[n.channel]) {
        stats.byChannel[n.channel] = { sent: 0, delivered: 0, failed: 0 };
      }
      if (n.status === "sent" || n.status === "delivered" || n.status === "read") {
        stats.byChannel[n.channel]!.sent++;
      }
      if (n.status === "delivered" || n.status === "read") {
        stats.byChannel[n.channel]!.delivered++;
      }
      if (n.status === "failed") {
        stats.byChannel[n.channel]!.failed++;
      }

      // By category
      if (!stats.byCategory[n.category]) {
        stats.byCategory[n.category] = { sent: 0, read: 0 };
      }
      if (n.status === "sent" || n.status === "delivered" || n.status === "read") {
        stats.byCategory[n.category]!.sent++;
      }
      if (n.status === "read") {
        stats.byCategory[n.category]!.read++;
      }
    }

    return stats;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (n) =>
        n.recipient.userId === userId &&
        n.channel === "in_app" &&
        n.status !== "read"
    ).length;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
