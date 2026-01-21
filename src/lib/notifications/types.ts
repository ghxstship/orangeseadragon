/**
 * Notification Service Types
 * Supports email, push, SMS, and in-app notifications
 */

export type NotificationChannel = "email" | "push" | "sms" | "in_app" | "slack" | "webhook";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type NotificationStatus = "pending" | "queued" | "sent" | "delivered" | "failed" | "read";

export type NotificationCategory =
  | "system"
  | "workflow"
  | "task"
  | "event"
  | "approval"
  | "mention"
  | "reminder"
  | "alert"
  | "marketing";

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  pushToken?: string;
  slackUserId?: string;
  preferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  channels: {
    [K in NotificationChannel]?: boolean;
  };
  categories: {
    [K in NotificationCategory]?: {
      enabled: boolean;
      channels?: NotificationChannel[];
    };
  };
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  digest?: {
    enabled: boolean;
    frequency: "hourly" | "daily" | "weekly";
    time?: string;
  };
}

export interface Notification {
  id: string;
  organizationId: string;
  
  recipient: NotificationRecipient;
  channel: NotificationChannel;
  category: NotificationCategory;
  priority: NotificationPriority;
  
  subject?: string;
  title: string;
  body: string;
  htmlBody?: string;
  
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  
  retryCount: number;
  maxRetries: number;
  
  expiresAt?: Date;
  scheduledFor?: Date;
  
  templateId?: string;
  templateVariables?: Record<string, unknown>;
  
  metadata?: Record<string, unknown>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  url?: string;
  action?: string;
  primary?: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  
  subject?: string;
  title: string;
  body: string;
  htmlBody?: string;
  
  variables: TemplateVariable[];
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: "string" | "number" | "date" | "boolean" | "object";
  required: boolean;
  default?: unknown;
  description?: string;
}

export interface EmailConfig {
  provider: "sendgrid" | "ses" | "postmark" | "resend" | "smtp";
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface PushConfig {
  provider: "firebase" | "onesignal" | "expo";
  apiKey?: string;
  appId?: string;
  
  firebase?: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
}

export interface SMSConfig {
  provider: "twilio" | "vonage" | "messagebird" | "plivo";
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
}

export interface SlackConfig {
  botToken: string;
  signingSecret?: string;
  defaultChannel?: string;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  headers?: Record<string, string>;
}

export interface NotificationServiceConfig {
  email?: EmailConfig;
  push?: PushConfig;
  sms?: SMSConfig;
  slack?: SlackConfig;
  webhook?: WebhookConfig;
  
  defaultChannel: NotificationChannel;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number[];
  };
  
  rateLimits: {
    [K in NotificationChannel]?: {
      maxPerMinute: number;
      maxPerHour: number;
      maxPerDay: number;
    };
  };
}

export interface SendNotificationRequest {
  recipientId?: string;
  recipient?: Partial<NotificationRecipient>;
  
  channel?: NotificationChannel;
  channels?: NotificationChannel[];
  
  category: NotificationCategory;
  priority?: NotificationPriority;
  
  subject?: string;
  title: string;
  body: string;
  htmlBody?: string;
  
  templateId?: string;
  templateVariables?: Record<string, unknown>;
  
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  
  scheduledFor?: Date;
  expiresAt?: Date;
  
  metadata?: Record<string, unknown>;
}

export interface SendNotificationResponse {
  success: boolean;
  notificationIds: string[];
  errors?: Array<{
    channel: NotificationChannel;
    error: string;
  }>;
}

export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  pending: number;
  
  byChannel: {
    [K in NotificationChannel]?: {
      sent: number;
      delivered: number;
      failed: number;
    };
  };
  
  byCategory: {
    [K in NotificationCategory]?: {
      sent: number;
      read: number;
    };
  };
}
