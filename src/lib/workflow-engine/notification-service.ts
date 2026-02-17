/**
 * Notification Service
 * Handles sending notifications across multiple channels
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/api/error-message";

// Helper to access tables dynamically
function getTable(tableName: string) {
  const supabase = createClient();
  return (supabase.from as any)(tableName);
}

export interface NotificationPayload {
  channel: "email" | "sms" | "push" | "slack" | "webhook";
  recipients: string[];
  template: string;
  data?: Record<string, unknown>;
  subject?: string;
  from?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: string;
  recipients: number;
  messageId?: string;
  error?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
  variables: string[];
}

// ==================== Template Registry ====================

const notificationTemplates: Record<string, NotificationTemplate> = {
  // Lead/CRM Templates
  "lead-score-updated": {
    id: "lead-score-updated",
    name: "Lead Score Updated",
    channel: "email",
    subject: "Lead Score Updated: {{leadName}}",
    body: `Hi {{assigneeName}},

The lead score for {{leadName}} has been updated.

New Score: {{score}} (Grade: {{grade}})

Score Breakdown:
{{#each breakdown}}
- {{@key}}: {{this}}
{{/each}}

View Lead: {{leadUrl}}

Best regards,
Your CRM System`,
    variables: ["leadName", "assigneeName", "score", "grade", "breakdown", "leadUrl"],
  },

  "lead-assigned": {
    id: "lead-assigned",
    name: "Lead Assigned",
    channel: "email",
    subject: "New Lead Assigned: {{companyName}}",
    body: `Hi {{assigneeName}},

A new lead has been assigned to you.

Company: {{companyName}}
Contact: {{contactName}}
Email: {{contactEmail}}
Source: {{source}}
Score: {{score}}

View Lead: {{leadUrl}}

Best regards,
Your CRM System`,
    variables: ["assigneeName", "companyName", "contactName", "contactEmail", "source", "score", "leadUrl"],
  },

  "deal-stage-changed": {
    id: "deal-stage-changed",
    name: "Deal Stage Changed",
    channel: "email",
    subject: "Deal Moved: {{dealName}} → {{newStage}}",
    body: `Hi {{ownerName}},

Your deal "{{dealName}}" has moved to a new stage.

Previous Stage: {{previousStage}}
New Stage: {{newStage}}
Deal Value: {{dealValue}}

{{#if requiresAction}}
Action Required: {{actionDescription}}
{{/if}}

View Deal: {{dealUrl}}

Best regards,
Your CRM System`,
    variables: ["ownerName", "dealName", "previousStage", "newStage", "dealValue", "requiresAction", "actionDescription", "dealUrl"],
  },

  // Support Templates
  "ticket-received": {
    id: "ticket-received",
    name: "Ticket Received",
    channel: "email",
    subject: "We received your request [#{{ticketNumber}}]",
    body: `Hi {{customerName}},

Thank you for contacting us. We've received your support request.

Ticket Number: #{{ticketNumber}}
Subject: {{subject}}
Priority: {{priority}}

Expected Response Time: Within {{estimatedResponse}} hours

You can track your ticket status here: {{ticketUrl}}

Best regards,
Support Team`,
    variables: ["customerName", "ticketNumber", "subject", "priority", "estimatedResponse", "ticketUrl"],
  },

  "ticket-assigned": {
    id: "ticket-assigned",
    name: "Ticket Assigned",
    channel: "push",
    subject: "New Ticket Assigned",
    body: `New {{priority}} priority ticket assigned: {{subject}}`,
    variables: ["priority", "subject", "ticketId"],
  },

  "sla-warning": {
    id: "sla-warning",
    name: "SLA Warning",
    channel: "push",
    subject: "⚠️ SLA Warning",
    body: `Ticket #{{ticketNumber}} is approaching SLA deadline. {{timeRemaining}} remaining.`,
    variables: ["ticketNumber", "timeRemaining"],
  },

  "sla-breach-escalation": {
    id: "sla-breach-escalation",
    name: "SLA Breach Escalation",
    channel: "email",
    subject: "🚨 SLA Breach: Ticket #{{ticketNumber}}",
    body: `URGENT: SLA Breach Alert

Ticket #{{ticketNumber}} has breached its SLA deadline.

Subject: {{subject}}
Customer: {{customerName}}
Priority: {{priority}}
Assigned To: {{assigneeName}}
Time Overdue: {{timeOverdue}}

Please take immediate action.

View Ticket: {{ticketUrl}}`,
    variables: ["ticketNumber", "subject", "customerName", "priority", "assigneeName", "timeOverdue", "ticketUrl"],
  },

  "ticket-escalated-to-you": {
    id: "ticket-escalated-to-you",
    name: "Ticket Escalated To You",
    channel: "email",
    subject: "Escalated Ticket: #{{ticketNumber}}",
    body: `Hi {{assigneeName}},

A ticket has been escalated to you for handling.

Ticket Number: #{{ticketNumber}}
Subject: {{subject}}
Escalation Reason: {{reason}}
Previous Handler: {{previousHandler}}

View Ticket: {{ticketUrl}}

Best regards,
Support System`,
    variables: ["assigneeName", "ticketNumber", "subject", "reason", "previousHandler", "ticketUrl"],
  },

  "csat-survey": {
    id: "csat-survey",
    name: "Customer Satisfaction Survey",
    channel: "email",
    subject: "How did we do? [Ticket #{{ticketNumber}}]",
    body: `Hi {{customerName}},

Your recent support request has been resolved. We'd love to hear your feedback!

Ticket: #{{ticketNumber}}
Subject: {{subject}}

How would you rate your experience?

⭐⭐⭐⭐⭐ Excellent: {{surveyUrl}}?rating=5
⭐⭐⭐⭐ Good: {{surveyUrl}}?rating=4
⭐⭐⭐ Average: {{surveyUrl}}?rating=3
⭐⭐ Poor: {{surveyUrl}}?rating=2
⭐ Very Poor: {{surveyUrl}}?rating=1

Thank you for your feedback!

Best regards,
Support Team`,
    variables: ["customerName", "ticketNumber", "subject", "surveyUrl"],
  },

  "kb-suggestions": {
    id: "kb-suggestions",
    name: "Knowledge Base Suggestions",
    channel: "email",
    subject: "Helpful articles for your request [#{{ticketNumber}}]",
    body: `Hi {{customerName}},

While our team reviews your request, these articles might help:

{{#each articles}}
📄 {{this.title}}
   {{this.url}}

{{/each}}

If these don't solve your issue, we'll get back to you shortly.

Best regards,
Support Team`,
    variables: ["customerName", "ticketNumber", "articles"],
  },

  // Workflow/Task Templates
  "task-due-reminder": {
    id: "task-due-reminder",
    name: "Task Due Reminder",
    channel: "email",
    subject: "Reminder: Task due soon - {{taskName}}",
    body: `Hi {{assigneeName}},

This is a reminder that the following task is due soon:

Task: {{taskName}}
Due Date: {{dueDate}}
Project: {{projectName}}

View Task: {{taskUrl}}

Best regards,
Project Management System`,
    variables: ["assigneeName", "taskName", "dueDate", "projectName", "taskUrl"],
  },

  "approval-required": {
    id: "approval-required",
    name: "Approval Required",
    channel: "email",
    subject: "Approval Required: {{requestType}}",
    body: `Hi {{approverName}},

A new {{requestType}} requires your approval.

Requested By: {{requesterName}}
Amount: {{amount}}
Description: {{description}}

Approve: {{approveUrl}}
Reject: {{rejectUrl}}

Best regards,
Approval System`,
    variables: ["approverName", "requestType", "requesterName", "amount", "description", "approveUrl", "rejectUrl"],
  },

  "approval-completed": {
    id: "approval-completed",
    name: "Approval Completed",
    channel: "email",
    subject: "{{decision}}: Your {{requestType}} request",
    body: `Hi {{requesterName}},

Your {{requestType}} request has been {{decision}}.

{{#if comments}}
Comments: {{comments}}
{{/if}}

View Details: {{requestUrl}}

Best regards,
Approval System`,
    variables: ["requesterName", "requestType", "decision", "comments", "requestUrl"],
  },

  // Event/Production Templates
  "event-confirmed": {
    id: "event-confirmed",
    name: "Event Confirmed",
    channel: "email",
    subject: "Event Confirmed: {{eventName}}",
    body: `Hi {{recipientName}},

The following event has been confirmed:

Event: {{eventName}}
Date: {{eventDate}}
Venue: {{venueName}}
Call Time: {{callTime}}

Please review the attached call sheet and confirm your availability.

View Event: {{eventUrl}}

Best regards,
Production Team`,
    variables: ["recipientName", "eventName", "eventDate", "venueName", "callTime", "eventUrl"],
  },

  "show-call-published": {
    id: "show-call-published",
    name: "Show Call Published",
    channel: "email",
    subject: "📋 Show Call Published: {{eventName}}",
    body: `Hi {{crewName}},

The show call for {{eventName}} has been published.

Date: {{eventDate}}
Your Call Time: {{callTime}}
Location: {{location}}

Please review and confirm your attendance.

View Show Call: {{showCallUrl}}

Best regards,
Production Team`,
    variables: ["crewName", "eventName", "eventDate", "callTime", "location", "showCallUrl"],
  },

  // Finance Templates
  "invoice-reminder-first": {
    id: "invoice-reminder-first",
    name: "Invoice Reminder - First",
    channel: "email",
    subject: "Payment Reminder: Invoice #{{invoiceNumber}}",
    body: `Hi {{contactName}},

This is a friendly reminder that the following invoice is now overdue:

Invoice Number: #{{invoiceNumber}}
Amount Due: {{amountDue}}
Due Date: {{dueDate}}
Days Overdue: {{daysOverdue}}

Please arrange payment at your earliest convenience.

Pay Now: {{paymentUrl}}

Best regards,
Accounts Team`,
    variables: ["contactName", "invoiceNumber", "amountDue", "dueDate", "daysOverdue", "paymentUrl"],
  },

  "budget-threshold-alert": {
    id: "budget-threshold-alert",
    name: "Budget Threshold Alert",
    channel: "email",
    subject: "⚠️ Budget Alert: {{budgetName}} at {{utilization}}%",
    body: `Hi {{ownerName}},

Your budget "{{budgetName}}" has reached {{utilization}}% utilization.

Budget Amount: {{budgetAmount}}
Spent: {{spent}}
Remaining: {{remaining}}

Please review your spending or request a budget increase.

View Budget: {{budgetUrl}}

Best regards,
Finance System`,
    variables: ["ownerName", "budgetName", "utilization", "budgetAmount", "spent", "remaining", "budgetUrl"],
  },

  // HR/Workforce Templates
  "shift-confirmation-request": {
    id: "shift-confirmation-request",
    name: "Shift Confirmation Request",
    channel: "push",
    subject: "Confirm Your Shift",
    body: `New shift scheduled: {{shiftDate}} {{startTime}}-{{endTime}} at {{venue}}. Please confirm.`,
    variables: ["shiftDate", "startTime", "endTime", "venue"],
  },

  "timesheet-reminder": {
    id: "timesheet-reminder",
    name: "Timesheet Reminder",
    channel: "email",
    subject: "Reminder: Submit Your Timesheet",
    body: `Hi {{employeeName}},

Please submit your timesheet for the period {{periodStart}} to {{periodEnd}}.

Submit Timesheet: {{timesheetUrl}}

Best regards,
HR Team`,
    variables: ["employeeName", "periodStart", "periodEnd", "timesheetUrl"],
  },

  "certification-expiry": {
    id: "certification-expiry",
    name: "Certification Expiry",
    channel: "email",
    subject: "Certification Expiring: {{certName}}",
    body: `Hi {{employeeName}},

Your certification "{{certName}}" is expiring on {{expiryDate}}.

Please arrange for renewal before the expiry date.

Renew Certification: {{renewalUrl}}

Best regards,
HR Team`,
    variables: ["employeeName", "certName", "expiryDate", "renewalUrl"],
  },

  // Compliance Templates
  "policy-acknowledgment-required": {
    id: "policy-acknowledgment-required",
    name: "Policy Acknowledgment Required",
    channel: "email",
    subject: "Action Required: Acknowledge {{policyName}}",
    body: `Hi {{employeeName}},

A new policy requires your acknowledgment:

Policy: {{policyName}}
Effective Date: {{effectiveDate}}
Deadline: {{deadline}}

Please review and acknowledge the policy.

View Policy: {{policyUrl}}

Best regards,
Compliance Team`,
    variables: ["employeeName", "policyName", "effectiveDate", "deadline", "policyUrl"],
  },

  "gdpr-request-received": {
    id: "gdpr-request-received",
    name: "GDPR Request Received",
    channel: "email",
    subject: "Data Subject Request Received: {{requestType}}",
    body: `A new data subject request has been received.

Request Type: {{requestType}}
Request ID: {{requestId}}
Data Subject: {{dataSubjectEmail}}
Submitted: {{submittedAt}}
Deadline: {{deadline}}

Please process this request within the required timeframe.

View Request: {{requestUrl}}`,
    variables: ["requestType", "requestId", "dataSubjectEmail", "submittedAt", "deadline", "requestUrl"],
  },

  // Marketing Templates
  "campaign-launched": {
    id: "campaign-launched",
    name: "Campaign Launched",
    channel: "email",
    subject: "Campaign Launched: {{campaignName}}",
    body: `Hi {{ownerName}},

Your campaign "{{campaignName}}" has been launched.

Recipients: {{recipientCount}}
Scheduled: {{scheduledTime}}

View Campaign: {{campaignUrl}}

Best regards,
Marketing System`,
    variables: ["ownerName", "campaignName", "recipientCount", "scheduledTime", "campaignUrl"],
  },

  "ab-test-winner": {
    id: "ab-test-winner",
    name: "A/B Test Winner",
    channel: "email",
    subject: "A/B Test Complete: {{testName}}",
    body: `Hi {{ownerName}},

Your A/B test "{{testName}}" has completed.

Winner: Variant {{winningVariant}}
Improvement: {{improvement}}%

View Results: {{resultsUrl}}

Best regards,
Marketing System`,
    variables: ["ownerName", "testName", "winningVariant", "improvement", "resultsUrl"],
  },
};

// ==================== Template Rendering ====================

function renderTemplate(template: NotificationTemplate, data: Record<string, unknown>): { subject: string; body: string } {
  let subject = template.subject || "";
  let body = template.body;

  // Simple variable interpolation
  const interpolate = (text: string): string => {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const trimmedPath = path.trim();

      // Handle #each blocks (simplified)
      if (trimmedPath.startsWith("#each")) {
        return match; // Skip for now, handle separately
      }
      if (trimmedPath.startsWith("/each") || trimmedPath.startsWith("#if") || trimmedPath.startsWith("/if")) {
        return "";
      }
      if (trimmedPath === "@key" || trimmedPath === "this") {
        return match;
      }

      const value = getNestedValue(data, trimmedPath);
      return value !== undefined ? String(value) : "";
    });
  };

  subject = interpolate(subject);
  body = interpolate(body);

  // Handle #each blocks
  body = body.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, arrayName, content) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return "";

    return array.map((item, index) => {
      let itemContent = content;
      if (typeof item === "object" && item !== null) {
        for (const [key, value] of Object.entries(item)) {
          itemContent = itemContent.replace(new RegExp(`\\{\\{this\\.${key}\\}\\}`, "g"), String(value));
        }
      } else {
        itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
      }
      itemContent = itemContent.replace(/\{\{@key\}\}/g, String(index));
      return itemContent;
    }).join("");
  });

  // Handle #if blocks
  body = body.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, condition, content) => {
    return data[condition] ? content : "";
  });

  return { subject, body };
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

// ==================== Channel Handlers ====================

async function sendEmailNotification(
  recipients: string[],
  subject: string,
  body: string,
  from?: string
): Promise<NotificationResult> {
  // Log email to database (in production, integrate with email provider)
  await getTable("email_logs").insert({
    recipients,
    subject,
    body,
    from: from || "noreply@company.com",
    sent_at: new Date().toISOString(),
    status: "sent",
  });

  return {
    success: true,
    channel: "email",
    recipients: recipients.length,
    messageId: `email_${Date.now()}`,
  };
}

async function sendPushNotification(
  recipients: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<NotificationResult> {
  // Log push notification (in production, integrate with FCM, OneSignal, etc.)
  await getTable("push_notifications").insert({
    recipients,
    title,
    body,
    data,
    sent_at: new Date().toISOString(),
    status: "sent",
  });

  return {
    success: true,
    channel: "push",
    recipients: recipients.length,
    messageId: `push_${Date.now()}`,
  };
}

async function sendSMSNotification(
  recipients: string[],
  body: string
): Promise<NotificationResult> {
  // Log SMS (in production, integrate with Twilio, etc.)
  await getTable("sms_logs").insert({
    recipients,
    message: body,
    sent_at: new Date().toISOString(),
    status: "sent",
  });

  return {
    success: true,
    channel: "sms",
    recipients: recipients.length,
    messageId: `sms_${Date.now()}`,
  };
}

async function sendSlackNotification(
  channel: string,
  text: string,
  blocks?: unknown[]
): Promise<NotificationResult> {
  // In production, integrate with Slack API
  await getTable("slack_messages").insert({
    channel,
    text,
    blocks,
    sent_at: new Date().toISOString(),
    status: "sent",
  });

  return {
    success: true,
    channel: "slack",
    recipients: 1,
    messageId: `slack_${Date.now()}`,
  };
}

async function sendWebhookNotification(
  url: string,
  payload: Record<string, unknown>
): Promise<NotificationResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return {
      success: response.ok,
      channel: "webhook",
      recipients: 1,
      messageId: `webhook_${Date.now()}`,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      channel: "webhook",
      recipients: 0,
      error: getErrorMessage(error, "Unknown error"),
    };
  }
}

// ==================== Main Send Function ====================

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const template = notificationTemplates[payload.template];

  if (!template) {
    // If no template found, use raw data
    const subject = payload.subject || "Notification";
    const body = JSON.stringify(payload.data || {});

    switch (payload.channel) {
      case "email":
        return sendEmailNotification(payload.recipients, subject, body, payload.from);
      case "push":
        return sendPushNotification(payload.recipients, subject, body, payload.data);
      case "sms":
        return sendSMSNotification(payload.recipients, body);
      case "slack":
        return sendSlackNotification(payload.recipients[0] ?? '', body);
      case "webhook":
        return sendWebhookNotification(payload.recipients[0] ?? '', payload.data || {});
      default:
        return { success: false, channel: payload.channel, recipients: 0, error: "Unknown channel" };
    }
  }

  const { subject, body } = renderTemplate(template, payload.data || {});

  switch (payload.channel) {
    case "email":
      return sendEmailNotification(payload.recipients, subject, body, payload.from);
    case "push":
      return sendPushNotification(payload.recipients, subject, body, payload.data);
    case "sms":
      return sendSMSNotification(payload.recipients, body);
    case "slack":
      return sendSlackNotification(payload.recipients[0] ?? '', body);
    case "webhook":
      return sendWebhookNotification(payload.recipients[0] ?? '', { subject, body, ...payload.data });
    default:
      return { success: false, channel: payload.channel, recipients: 0, error: "Unknown channel" };
  }
}

// ==================== Template Management ====================

export function getNotificationTemplate(templateId: string): NotificationTemplate | undefined {
  return notificationTemplates[templateId];
}

export function getAllNotificationTemplates(): NotificationTemplate[] {
  return Object.values(notificationTemplates);
}

export function registerNotificationTemplate(template: NotificationTemplate): void {
  notificationTemplates[template.id] = template;
}
