/**
 * Workflow Integration Adapters
 * Adapters for external services (email, SMS, push, calendar)
 */

export interface EmailProvider {
  send(options: EmailOptions): Promise<EmailResult>;
}

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMSProvider {
  send(options: SMSOptions): Promise<SMSResult>;
}

export interface SMSOptions {
  to: string | string[];
  from?: string;
  body: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface PushProvider {
  send(options: PushOptions): Promise<PushResult>;
}

export interface PushOptions {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: string;
}

export interface PushResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

export interface CalendarProvider {
  createEvent(options: CalendarEventOptions): Promise<CalendarEventResult>;
  updateEvent(eventId: string, options: Partial<CalendarEventOptions>): Promise<CalendarEventResult>;
  deleteEvent(eventId: string): Promise<{ success: boolean }>;
}

export interface CalendarEventOptions {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  reminders?: CalendarReminder[];
}

export interface CalendarReminder {
  method: "email" | "popup";
  minutes: number;
}

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  link?: string;
  error?: string;
}

// ==================== Mock Implementations ====================
// These are placeholder implementations. In production, replace with actual provider SDKs.

class MockEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<EmailResult> {
    console.log("[MockEmail] Sending email:", {
      to: options.to,
      subject: options.subject,
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `mock_email_${Date.now()}`,
    };
  }
}

class MockSMSProvider implements SMSProvider {
  async send(options: SMSOptions): Promise<SMSResult> {
    console.log("[MockSMS] Sending SMS:", {
      to: options.to,
      body: options.body.substring(0, 50) + "...",
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `mock_sms_${Date.now()}`,
    };
  }
}

class MockPushProvider implements PushProvider {
  async send(options: PushOptions): Promise<PushResult> {
    console.log("[MockPush] Sending push notification:", {
      tokens: options.tokens.length,
      title: options.title,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      successCount: options.tokens.length,
      failureCount: 0,
    };
  }
}

class MockCalendarProvider implements CalendarProvider {
  async createEvent(options: CalendarEventOptions): Promise<CalendarEventResult> {
    console.log("[MockCalendar] Creating event:", {
      title: options.title,
      start: options.start,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const eventId = `mock_event_${Date.now()}`;
    return {
      success: true,
      eventId,
      link: `https://calendar.example.com/event/${eventId}`,
    };
  }

  async updateEvent(eventId: string, options: Partial<CalendarEventOptions>): Promise<CalendarEventResult> {
    console.log("[MockCalendar] Updating event:", eventId, options);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      eventId,
      link: `https://calendar.example.com/event/${eventId}`,
    };
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean }> {
    console.log("[MockCalendar] Deleting event:", eventId);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true };
  }
}

// ==================== SendGrid Email Provider ====================

export class SendGridEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: recipients.map((email) => ({ email })) }],
          from: { email: options.from || "noreply@company.com" },
          subject: options.subject,
          content: [
            { type: "text/plain", value: options.text || "" },
            { type: "text/html", value: options.html || options.text || "" },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      return {
        success: true,
        messageId: response.headers.get("x-message-id") || `sg_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// ==================== Twilio SMS Provider ====================

export class TwilioSMSProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async send(options: SMSOptions): Promise<SMSResult> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    try {
      const results = await Promise.all(
        recipients.map(async (to) => {
          const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                To: to,
                From: options.from || this.fromNumber,
                Body: options.body,
              }),
            }
          );

          return response.ok;
        })
      );

      const allSuccess = results.every((r) => r);
      return {
        success: allSuccess,
        messageId: `twilio_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// ==================== Firebase Push Provider ====================

export class FirebasePushProvider implements PushProvider {
  private serverKey: string;

  constructor(serverKey: string) {
    this.serverKey = serverKey;
  }

  async send(options: PushOptions): Promise<PushResult> {
    try {
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          Authorization: `key=${this.serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration_ids: options.tokens,
          notification: {
            title: options.title,
            body: options.body,
            sound: options.sound || "default",
            badge: options.badge,
          },
          data: options.data,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          successCount: 0,
          failureCount: options.tokens.length,
          errors: ["FCM request failed"],
        };
      }

      const result = await response.json();
      return {
        success: result.success > 0,
        successCount: result.success || 0,
        failureCount: result.failure || 0,
      };
    } catch (error) {
      return {
        success: false,
        successCount: 0,
        failureCount: options.tokens.length,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }
}

// ==================== Integration Manager ====================

export interface IntegrationConfig {
  email?: {
    provider: "sendgrid" | "mock";
    apiKey?: string;
  };
  sms?: {
    provider: "twilio" | "mock";
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
  };
  push?: {
    provider: "firebase" | "mock";
    serverKey?: string;
  };
  calendar?: {
    provider: "google" | "mock";
    credentials?: Record<string, unknown>;
  };
}

export class IntegrationManager {
  private emailProvider: EmailProvider;
  private smsProvider: SMSProvider;
  private pushProvider: PushProvider;
  private calendarProvider: CalendarProvider;

  constructor(config: IntegrationConfig = {}) {
    // Initialize email provider
    if (config.email?.provider === "sendgrid" && config.email.apiKey) {
      this.emailProvider = new SendGridEmailProvider(config.email.apiKey);
    } else {
      this.emailProvider = new MockEmailProvider();
    }

    // Initialize SMS provider
    if (
      config.sms?.provider === "twilio" &&
      config.sms.accountSid &&
      config.sms.authToken &&
      config.sms.fromNumber
    ) {
      this.smsProvider = new TwilioSMSProvider(
        config.sms.accountSid,
        config.sms.authToken,
        config.sms.fromNumber
      );
    } else {
      this.smsProvider = new MockSMSProvider();
    }

    // Initialize push provider
    if (config.push?.provider === "firebase" && config.push.serverKey) {
      this.pushProvider = new FirebasePushProvider(config.push.serverKey);
    } else {
      this.pushProvider = new MockPushProvider();
    }

    // Initialize calendar provider
    this.calendarProvider = new MockCalendarProvider();
  }

  getEmailProvider(): EmailProvider {
    return this.emailProvider;
  }

  getSMSProvider(): SMSProvider {
    return this.smsProvider;
  }

  getPushProvider(): PushProvider {
    return this.pushProvider;
  }

  getCalendarProvider(): CalendarProvider {
    return this.calendarProvider;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    return this.emailProvider.send(options);
  }

  async sendSMS(options: SMSOptions): Promise<SMSResult> {
    return this.smsProvider.send(options);
  }

  async sendPush(options: PushOptions): Promise<PushResult> {
    return this.pushProvider.send(options);
  }

  async createCalendarEvent(options: CalendarEventOptions): Promise<CalendarEventResult> {
    return this.calendarProvider.createEvent(options);
  }
}

// Default integration manager instance
export const integrations = new IntegrationManager({
  email: {
    provider: process.env.SENDGRID_API_KEY ? "sendgrid" : "mock",
    apiKey: process.env.SENDGRID_API_KEY,
  },
  sms: {
    provider: process.env.TWILIO_ACCOUNT_SID ? "twilio" : "mock",
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },
  push: {
    provider: process.env.FIREBASE_SERVER_KEY ? "firebase" : "mock",
    serverKey: process.env.FIREBASE_SERVER_KEY,
  },
});
