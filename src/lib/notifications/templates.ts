/**
 * Notification Templates
 * Pre-built templates for common notification scenarios
 */

import type { NotificationTemplate } from "./types";

export const systemTemplates: NotificationTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Sent when a new user joins the organization",
    category: "system",
    channels: ["email", "in_app"],
    subject: "Welcome to {{organizationName}}!",
    title: "Welcome to {{organizationName}}!",
    body: "Hi {{userName}}, welcome to {{organizationName}}! We're excited to have you on board. Get started by exploring your dashboard.",
    htmlBody: `
      <h1>Welcome to {{organizationName}}!</h1>
      <p>Hi {{userName}},</p>
      <p>Welcome to {{organizationName}}! We're excited to have you on board.</p>
      <p>Get started by exploring your dashboard.</p>
      <a href="{{dashboardUrl}}" style="background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
    `,
    variables: [
      { name: "userName", type: "string", required: true, description: "User's display name" },
      { name: "organizationName", type: "string", required: true, description: "Organization name" },
      { name: "dashboardUrl", type: "string", required: true, description: "Dashboard URL" },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "password_reset",
    name: "Password Reset",
    description: "Sent when user requests password reset",
    category: "system",
    channels: ["email"],
    subject: "Reset your password",
    title: "Password Reset Request",
    body: "Click the link below to reset your password. This link expires in 1 hour.",
    htmlBody: `
      <h1>Password Reset Request</h1>
      <p>Hi {{userName}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password.</p>
      <a href="{{resetUrl}}" style="background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
      <p style="color: #666; font-size: 12px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
    variables: [
      { name: "userName", type: "string", required: true },
      { name: "resetUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "email_verification",
    name: "Email Verification",
    description: "Sent to verify user email address",
    category: "system",
    channels: ["email"],
    subject: "Verify your email address",
    title: "Email Verification",
    body: "Please verify your email address by clicking the link below.",
    htmlBody: `
      <h1>Verify Your Email</h1>
      <p>Hi {{userName}},</p>
      <p>Please verify your email address to complete your account setup.</p>
      <a href="{{verifyUrl}}" style="background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
    `,
    variables: [
      { name: "userName", type: "string", required: true },
      { name: "verifyUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const taskTemplates: NotificationTemplate[] = [
  {
    id: "task_assigned",
    name: "Task Assigned",
    description: "Sent when a task is assigned to a user",
    category: "task",
    channels: ["email", "in_app", "push"],
    subject: "New task assigned: {{taskName}}",
    title: "New Task Assigned",
    body: "{{assignerName}} assigned you a task: {{taskName}}. Due: {{dueDate}}",
    variables: [
      { name: "taskName", type: "string", required: true },
      { name: "assignerName", type: "string", required: true },
      { name: "dueDate", type: "date", required: false },
      { name: "taskUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task_due_reminder",
    name: "Task Due Reminder",
    description: "Reminder for upcoming task deadline",
    category: "reminder",
    channels: ["email", "in_app", "push"],
    subject: "Reminder: {{taskName}} is due {{dueIn}}",
    title: "Task Due Soon",
    body: "Your task '{{taskName}}' is due {{dueIn}}. Don't forget to complete it!",
    variables: [
      { name: "taskName", type: "string", required: true },
      { name: "dueIn", type: "string", required: true },
      { name: "taskUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task_overdue",
    name: "Task Overdue",
    description: "Alert when a task is past due",
    category: "alert",
    channels: ["email", "in_app", "push"],
    subject: "Overdue: {{taskName}}",
    title: "Task Overdue",
    body: "Your task '{{taskName}}' was due {{overdueBy}}. Please complete it as soon as possible.",
    variables: [
      { name: "taskName", type: "string", required: true },
      { name: "overdueBy", type: "string", required: true },
      { name: "taskUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task_completed",
    name: "Task Completed",
    description: "Notification when a task is marked complete",
    category: "task",
    channels: ["in_app"],
    title: "Task Completed",
    body: "{{completedBy}} completed the task '{{taskName}}'",
    variables: [
      { name: "taskName", type: "string", required: true },
      { name: "completedBy", type: "string", required: true },
      { name: "taskUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const approvalTemplates: NotificationTemplate[] = [
  {
    id: "approval_requested",
    name: "Approval Requested",
    description: "Sent when approval is needed",
    category: "approval",
    channels: ["email", "in_app", "push"],
    subject: "Approval needed: {{itemName}}",
    title: "Approval Requested",
    body: "{{requesterName}} is requesting your approval for '{{itemName}}'. {{description}}",
    variables: [
      { name: "itemName", type: "string", required: true },
      { name: "requesterName", type: "string", required: true },
      { name: "description", type: "string", required: false },
      { name: "approvalUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "approval_approved",
    name: "Approval Approved",
    description: "Sent when request is approved",
    category: "approval",
    channels: ["email", "in_app"],
    subject: "Approved: {{itemName}}",
    title: "Request Approved",
    body: "Your request '{{itemName}}' has been approved by {{approverName}}.",
    variables: [
      { name: "itemName", type: "string", required: true },
      { name: "approverName", type: "string", required: true },
      { name: "comments", type: "string", required: false },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "approval_rejected",
    name: "Approval Rejected",
    description: "Sent when request is rejected",
    category: "approval",
    channels: ["email", "in_app"],
    subject: "Rejected: {{itemName}}",
    title: "Request Rejected",
    body: "Your request '{{itemName}}' has been rejected by {{approverName}}. Reason: {{reason}}",
    variables: [
      { name: "itemName", type: "string", required: true },
      { name: "approverName", type: "string", required: true },
      { name: "reason", type: "string", required: false },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const eventTemplates: NotificationTemplate[] = [
  {
    id: "event_reminder",
    name: "Event Reminder",
    description: "Reminder for upcoming event",
    category: "reminder",
    channels: ["email", "in_app", "push", "sms"],
    subject: "Reminder: {{eventName}} starts {{startsIn}}",
    title: "Event Reminder",
    body: "{{eventName}} starts {{startsIn}} at {{location}}. Don't forget to attend!",
    variables: [
      { name: "eventName", type: "string", required: true },
      { name: "startsIn", type: "string", required: true },
      { name: "location", type: "string", required: false },
      { name: "eventUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "event_invitation",
    name: "Event Invitation",
    description: "Invitation to an event",
    category: "event",
    channels: ["email", "in_app"],
    subject: "You're invited: {{eventName}}",
    title: "Event Invitation",
    body: "{{inviterName}} has invited you to {{eventName}} on {{eventDate}}.",
    htmlBody: `
      <h1>You're Invited!</h1>
      <p>{{inviterName}} has invited you to:</p>
      <h2>{{eventName}}</h2>
      <p><strong>Date:</strong> {{eventDate}}</p>
      <p><strong>Location:</strong> {{location}}</p>
      <p>{{description}}</p>
      <div style="margin-top: 20px;">
        <a href="{{acceptUrl}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">Accept</a>
        <a href="{{declineUrl}}" style="background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Decline</a>
      </div>
    `,
    variables: [
      { name: "eventName", type: "string", required: true },
      { name: "inviterName", type: "string", required: true },
      { name: "eventDate", type: "date", required: true },
      { name: "location", type: "string", required: false },
      { name: "description", type: "string", required: false },
      { name: "acceptUrl", type: "string", required: true },
      { name: "declineUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "event_updated",
    name: "Event Updated",
    description: "Notification when event details change",
    category: "event",
    channels: ["email", "in_app"],
    subject: "Event updated: {{eventName}}",
    title: "Event Updated",
    body: "The event '{{eventName}}' has been updated. {{changes}}",
    variables: [
      { name: "eventName", type: "string", required: true },
      { name: "changes", type: "string", required: true },
      { name: "eventUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "event_cancelled",
    name: "Event Cancelled",
    description: "Notification when event is cancelled",
    category: "event",
    channels: ["email", "in_app", "push", "sms"],
    subject: "Event cancelled: {{eventName}}",
    title: "Event Cancelled",
    body: "The event '{{eventName}}' scheduled for {{eventDate}} has been cancelled. {{reason}}",
    variables: [
      { name: "eventName", type: "string", required: true },
      { name: "eventDate", type: "date", required: true },
      { name: "reason", type: "string", required: false },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mentionTemplates: NotificationTemplate[] = [
  {
    id: "mentioned_in_comment",
    name: "Mentioned in Comment",
    description: "When user is mentioned in a comment",
    category: "mention",
    channels: ["email", "in_app", "push"],
    subject: "{{mentionerName}} mentioned you",
    title: "You were mentioned",
    body: "{{mentionerName}} mentioned you in a comment on '{{itemName}}': \"{{commentPreview}}\"",
    variables: [
      { name: "mentionerName", type: "string", required: true },
      { name: "itemName", type: "string", required: true },
      { name: "commentPreview", type: "string", required: true },
      { name: "commentUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const workflowTemplates: NotificationTemplate[] = [
  {
    id: "workflow_completed",
    name: "Workflow Completed",
    description: "When a workflow execution completes",
    category: "workflow",
    channels: ["in_app"],
    title: "Workflow Completed",
    body: "The workflow '{{workflowName}}' has completed successfully.",
    variables: [
      { name: "workflowName", type: "string", required: true },
      { name: "executionId", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "workflow_failed",
    name: "Workflow Failed",
    description: "When a workflow execution fails",
    category: "workflow",
    channels: ["email", "in_app"],
    subject: "Workflow failed: {{workflowName}}",
    title: "Workflow Failed",
    body: "The workflow '{{workflowName}}' failed at step '{{failedStep}}'. Error: {{errorMessage}}",
    variables: [
      { name: "workflowName", type: "string", required: true },
      { name: "failedStep", type: "string", required: true },
      { name: "errorMessage", type: "string", required: true },
      { name: "executionUrl", type: "string", required: true },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const allNotificationTemplates: NotificationTemplate[] = [
  ...systemTemplates,
  ...taskTemplates,
  ...approvalTemplates,
  ...eventTemplates,
  ...mentionTemplates,
  ...workflowTemplates,
];

export function getTemplateById(id: string): NotificationTemplate | undefined {
  return allNotificationTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): NotificationTemplate[] {
  return allNotificationTemplates.filter((t) => t.category === category);
}
