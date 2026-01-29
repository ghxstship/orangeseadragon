/**
 * Workflow Templates
 * Pre-built workflow templates for each domain as per ENTERPRISE_EXTENSION_PLAN.md
 */

import type { WorkflowTemplate } from "./types";
import { salesCrmTemplates } from "./templates-sales-crm";
import { marketingTemplates } from "./templates-marketing";
import { financeExtendedTemplates } from "./templates-finance";
import { procurementTemplates } from "./templates-procurement";
import { workforceExtendedTemplates } from "./templates-workforce";
import { projectManagementExtendedTemplates } from "./templates-projects";
import { productionExtendedTemplates } from "./templates-production";
import { supportTemplates } from "./templates-support";
import { complianceTemplates } from "./templates-compliance";

// Project Management Templates
export const projectManagementTemplates: WorkflowTemplate[] = [
  {
    id: "task-due-reminder",
    name: "Task Due Reminder",
    description: "Send reminders when tasks are approaching their due date",
    category: "project_management",
    tags: ["tasks", "reminders", "notifications"],
    workflow: {
      name: "Task Due Reminder",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-due-tasks",
          name: "Find Tasks Due Soon",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "tasks",
              filters: {
                dueDate: { $lte: "{{now + 24h}}", $gte: "{{now}}" },
                status: { $nin: ["completed", "cancelled"] },
              },
            },
          },
        },
        {
          id: "send-reminders",
          name: "Send Reminder Notifications",
          type: "loop",
          config: {
            collection: "{{steps.find-due-tasks.output}}",
            itemVariable: "task",
            steps: ["notify-assignee"],
          },
        },
        {
          id: "notify-assignee",
          name: "Notify Task Assignee",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{task.assigneeId}}"],
            template: "task-due-reminder",
            data: { taskName: "{{task.name}}", dueDate: "{{task.dueDate}}" },
          },
        },
      ],
    },
    variables: [
      { name: "reminderHours", type: "number", description: "Hours before due date to send reminder", required: false, default: 24 },
    ],
  },
  {
    id: "task-overdue-escalation",
    name: "Task Overdue Escalation",
    description: "Escalate overdue tasks to project managers",
    category: "project_management",
    tags: ["tasks", "escalation", "overdue"],
    workflow: {
      name: "Task Overdue Escalation",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 10 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-overdue",
          name: "Find Overdue Tasks",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "tasks",
              filters: {
                dueDate: { $lt: "{{now}}" },
                status: { $nin: ["completed", "cancelled"] },
              },
            },
          },
        },
        {
          id: "group-by-project",
          name: "Group by Project",
          type: "transform",
          config: {
            input: "{{steps.find-overdue.output}}",
            output: "groupedTasks",
            transformation: "groupBy(projectId)",
          },
        },
        {
          id: "notify-managers",
          name: "Notify Project Managers",
          type: "loop",
          config: {
            collection: "{{groupedTasks}}",
            itemVariable: "projectGroup",
            steps: ["send-escalation"],
          },
        },
        {
          id: "send-escalation",
          name: "Send Escalation Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{projectGroup.project.managerId}}"],
            template: "overdue-tasks-escalation",
            data: { tasks: "{{projectGroup.tasks}}", projectName: "{{projectGroup.project.name}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "milestone-approaching",
    name: "Milestone Approaching",
    description: "Alert team when project milestones are approaching",
    category: "project_management",
    tags: ["milestones", "alerts", "projects"],
    workflow: {
      name: "Milestone Approaching",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-milestones",
          name: "Find Upcoming Milestones",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "milestones",
              filters: {
                dueDate: { $lte: "{{now + 7d}}", $gte: "{{now}}" },
                status: { $ne: "completed" },
              },
            },
          },
        },
        {
          id: "notify-team",
          name: "Notify Project Team",
          type: "loop",
          config: {
            collection: "{{steps.find-milestones.output}}",
            itemVariable: "milestone",
            steps: ["send-milestone-alert"],
          },
        },
        {
          id: "send-milestone-alert",
          name: "Send Milestone Alert",
          type: "notification",
          config: {
            channel: "slack",
            recipients: ["{{milestone.project.slackChannel}}"],
            template: "milestone-approaching",
            data: { milestoneName: "{{milestone.name}}", dueDate: "{{milestone.dueDate}}" },
          },
        },
      ],
    },
    variables: [
      { name: "daysAhead", type: "number", description: "Days ahead to check for milestones", required: false, default: 7 },
    ],
  },
];

// Live Production Templates
export const liveProductionTemplates: WorkflowTemplate[] = [
  {
    id: "event-phase-transition",
    name: "Event Phase Transition",
    description: "Automate actions when event moves to a new phase",
    category: "live_production",
    tags: ["events", "phases", "automation"],
    workflow: {
      name: "Event Phase Transition",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "event.status_changed" },
      },
      steps: [
        {
          id: "check-phase",
          name: "Check New Phase",
          type: "condition",
          config: {
            expression: "{{trigger.data.newStatus}}",
            trueBranch: ["handle-confirmed"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.newStatus", operator: "eq", value: "confirmed" }],
        },
        {
          id: "handle-confirmed",
          name: "Handle Confirmed Status",
          type: "parallel",
          config: {
            branches: [["generate-call-sheet"], ["notify-crew"], ["create-tasks"]],
            waitForAll: true,
          },
        },
        {
          id: "generate-call-sheet",
          name: "Generate Call Sheet",
          type: "action",
          config: {
            actionType: "generateDocument",
            parameters: { template: "call-sheet", eventId: "{{trigger.data.eventId}}" },
          },
        },
        {
          id: "notify-crew",
          name: "Notify Assigned Crew",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.event.crewIds}}"],
            template: "event-confirmed",
            data: { eventName: "{{trigger.data.event.name}}", date: "{{trigger.data.event.startDate}}" },
          },
        },
        {
          id: "create-tasks",
          name: "Create Production Tasks",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: { template: "production-checklist", eventId: "{{trigger.data.eventId}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "show-call-published",
    name: "Show Call Published",
    description: "Notify all crew when show call is published",
    category: "live_production",
    tags: ["show-call", "notifications", "crew"],
    workflow: {
      name: "Show Call Published",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "show_call.published" },
      },
      steps: [
        {
          id: "get-crew",
          name: "Get Assigned Crew",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "crew_assignments",
              filters: { eventId: "{{trigger.data.eventId}}" },
              include: ["user"],
            },
          },
        },
        {
          id: "send-notifications",
          name: "Send Show Call Notifications",
          type: "parallel",
          config: {
            branches: [["send-email"], ["send-push"], ["send-sms"]],
            waitForAll: false,
          },
        },
        {
          id: "send-email",
          name: "Send Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.get-crew.output.*.user.email}}"],
            template: "show-call-published",
            data: { showCall: "{{trigger.data.showCall}}" },
          },
        },
        {
          id: "send-push",
          name: "Send Push Notification",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{steps.get-crew.output.*.user.id}}"],
            template: "show-call-published-push",
            data: { eventName: "{{trigger.data.event.name}}" },
          },
        },
        {
          id: "send-sms",
          name: "Send SMS",
          type: "notification",
          config: {
            channel: "sms",
            recipients: ["{{steps.get-crew.output.*.user.phone}}"],
            template: "show-call-published-sms",
            data: { eventName: "{{trigger.data.event.name}}", callTime: "{{trigger.data.showCall.callTime}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "runsheet-delay-adjustment",
    name: "Runsheet Delay Adjustment",
    description: "Automatically adjust runsheet times when delays occur",
    category: "live_production",
    tags: ["runsheet", "delays", "automation"],
    workflow: {
      name: "Runsheet Delay Adjustment",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "runsheet.delay_reported" },
      },
      steps: [
        {
          id: "calculate-impact",
          name: "Calculate Delay Impact",
          type: "action",
          config: {
            actionType: "calculateDelayImpact",
            parameters: {
              runsheetId: "{{trigger.data.runsheetId}}",
              cueId: "{{trigger.data.cueId}}",
              delayMinutes: "{{trigger.data.delayMinutes}}",
            },
          },
        },
        {
          id: "update-times",
          name: "Update Subsequent Cue Times",
          type: "action",
          config: {
            actionType: "bulkUpdate",
            parameters: {
              entity: "runsheet_cues",
              updates: "{{steps.calculate-impact.output.updates}}",
            },
          },
        },
        {
          id: "notify-stakeholders",
          name: "Notify Stakeholders",
          type: "notification",
          config: {
            channel: "slack",
            recipients: ["{{trigger.data.event.productionChannel}}"],
            template: "runsheet-delay-notification",
            data: {
              delayMinutes: "{{trigger.data.delayMinutes}}",
              affectedCues: "{{steps.calculate-impact.output.affectedCount}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
];

// Workforce Templates
export const workforceTemplates: WorkflowTemplate[] = [
  {
    id: "shift-confirmation",
    name: "Shift Confirmation Request",
    description: "Request crew to confirm their shifts",
    category: "workforce",
    tags: ["shifts", "confirmation", "scheduling"],
    workflow: {
      name: "Shift Confirmation Request",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "shift.created" },
      },
      steps: [
        {
          id: "send-confirmation-request",
          name: "Send Confirmation Request",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{trigger.data.assigneeId}}"],
            template: "shift-confirmation-request",
            data: {
              shiftDate: "{{trigger.data.date}}",
              startTime: "{{trigger.data.startTime}}",
              endTime: "{{trigger.data.endTime}}",
              venue: "{{trigger.data.venue.name}}",
            },
          },
        },
        {
          id: "wait-for-response",
          name: "Wait for Response",
          type: "delay",
          config: { duration: 48, unit: "hours" },
        },
        {
          id: "check-confirmation",
          name: "Check if Confirmed",
          type: "condition",
          config: {
            expression: "{{trigger.data.shift.status}}",
            trueBranch: [],
            falseBranch: ["escalate-unconfirmed"],
          },
          conditions: [{ field: "trigger.data.shift.status", operator: "eq", value: "confirmed" }],
        },
        {
          id: "escalate-unconfirmed",
          name: "Escalate Unconfirmed Shift",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.event.coordinatorId}}"],
            template: "shift-unconfirmed-escalation",
            data: { shift: "{{trigger.data}}", assignee: "{{trigger.data.assignee}}" },
          },
        },
      ],
    },
    variables: [
      { name: "confirmationDeadlineHours", type: "number", description: "Hours to wait for confirmation", required: false, default: 48 },
    ],
  },
  {
    id: "timesheet-reminder",
    name: "Timesheet Submission Reminder",
    description: "Remind crew to submit timesheets",
    category: "workforce",
    tags: ["timesheets", "reminders", "payroll"],
    workflow: {
      name: "Timesheet Submission Reminder",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * 5", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-pending-timesheets",
          name: "Find Pending Timesheets",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "timesheets",
              filters: {
                periodEnd: { $lte: "{{now}}" },
                status: "draft",
              },
              include: ["user"],
            },
          },
        },
        {
          id: "send-reminders",
          name: "Send Reminders",
          type: "loop",
          config: {
            collection: "{{steps.find-pending-timesheets.output}}",
            itemVariable: "timesheet",
            steps: ["notify-user"],
          },
        },
        {
          id: "notify-user",
          name: "Notify User",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{timesheet.user.email}}"],
            template: "timesheet-reminder",
            data: { periodStart: "{{timesheet.periodStart}}", periodEnd: "{{timesheet.periodEnd}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "certification-expiry",
    name: "Certification Expiry Alert",
    description: "Alert when crew certifications are expiring",
    category: "workforce",
    tags: ["certifications", "compliance", "alerts"],
    workflow: {
      name: "Certification Expiry Alert",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 1 * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-expiring",
          name: "Find Expiring Certifications",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "certifications",
              filters: {
                expiryDate: { $lte: "{{now + 30d}}", $gte: "{{now}}" },
              },
              include: ["user"],
            },
          },
        },
        {
          id: "notify-users",
          name: "Notify Certificate Holders",
          type: "loop",
          config: {
            collection: "{{steps.find-expiring.output}}",
            itemVariable: "cert",
            steps: ["send-expiry-alert"],
          },
        },
        {
          id: "send-expiry-alert",
          name: "Send Expiry Alert",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{cert.user.email}}"],
            template: "certification-expiry",
            data: { certName: "{{cert.name}}", expiryDate: "{{cert.expiryDate}}" },
          },
        },
        {
          id: "notify-hr",
          name: "Notify HR Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["hr@organization.com"],
            template: "certifications-expiring-summary",
            data: { certifications: "{{steps.find-expiring.output}}" },
          },
        },
      ],
    },
    variables: [
      { name: "daysBeforeExpiry", type: "number", description: "Days before expiry to send alert", required: false, default: 30 },
    ],
  },
];

// Asset Management Templates
export const assetTemplates: WorkflowTemplate[] = [
  {
    id: "checkout-approval",
    name: "Asset Checkout Approval",
    description: "Require approval for high-value asset checkouts",
    category: "assets",
    tags: ["checkout", "approval", "assets"],
    workflow: {
      name: "Asset Checkout Approval",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "asset.checkout_requested" },
      },
      steps: [
        {
          id: "check-value",
          name: "Check Asset Value",
          type: "condition",
          config: {
            expression: "{{trigger.data.asset.value}}",
            trueBranch: ["request-approval"],
            falseBranch: ["auto-approve"],
          },
          conditions: [{ field: "trigger.data.asset.value", operator: "gte", value: 5000 }],
        },
        {
          id: "request-approval",
          name: "Request Manager Approval",
          type: "approval",
          config: {
            approvers: ["{{trigger.data.asset.managerId}}"],
            requiredApprovals: 1,
            timeout: 86400,
            escalationPolicy: {
              timeout: 86400,
              escalateTo: ["{{trigger.data.organization.assetManagerId}}"],
              notifyOnEscalation: true,
            },
          },
          onSuccess: ["approve-checkout"],
          onFailure: ["reject-checkout"],
        },
        {
          id: "auto-approve",
          name: "Auto Approve",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "asset_checkouts",
              id: "{{trigger.data.checkoutId}}",
              data: { status: "approved" },
            },
          },
        },
        {
          id: "approve-checkout",
          name: "Approve Checkout",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "asset_checkouts",
              id: "{{trigger.data.checkoutId}}",
              data: { status: "approved", approvedBy: "{{steps.request-approval.output.approvedBy}}" },
            },
          },
        },
        {
          id: "reject-checkout",
          name: "Reject Checkout",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "asset_checkouts",
              id: "{{trigger.data.checkoutId}}",
              data: { status: "rejected", rejectedBy: "{{steps.request-approval.output.rejectedBy}}" },
            },
          },
        },
      ],
    },
    variables: [
      { name: "approvalThreshold", type: "number", description: "Value threshold requiring approval", required: false, default: 5000 },
    ],
  },
  {
    id: "overdue-reminder",
    name: "Asset Overdue Reminder",
    description: "Send reminders for overdue asset returns",
    category: "assets",
    tags: ["overdue", "reminders", "returns"],
    workflow: {
      name: "Asset Overdue Reminder",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-overdue",
          name: "Find Overdue Checkouts",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "asset_checkouts",
              filters: {
                expectedReturnDate: { $lt: "{{now}}" },
                actualReturnDate: null,
                status: "checked_out",
              },
              include: ["asset", "user"],
            },
          },
        },
        {
          id: "send-reminders",
          name: "Send Overdue Reminders",
          type: "loop",
          config: {
            collection: "{{steps.find-overdue.output}}",
            itemVariable: "checkout",
            steps: ["notify-borrower"],
          },
        },
        {
          id: "notify-borrower",
          name: "Notify Borrower",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{checkout.user.email}}"],
            template: "asset-overdue-reminder",
            data: {
              assetName: "{{checkout.asset.name}}",
              expectedReturn: "{{checkout.expectedReturnDate}}",
              daysOverdue: "{{dateDiff(now, checkout.expectedReturnDate, 'days')}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "maintenance-scheduling",
    name: "Maintenance Scheduling",
    description: "Schedule preventive maintenance based on usage",
    category: "assets",
    tags: ["maintenance", "scheduling", "preventive"],
    workflow: {
      name: "Maintenance Scheduling",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 6 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-due-maintenance",
          name: "Find Assets Due for Maintenance",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "assets",
              filters: {
                $or: [
                  { nextMaintenanceDate: { $lte: "{{now + 7d}}" } },
                  { usageHours: { $gte: "{{asset.maintenanceIntervalHours}}" } },
                ],
              },
            },
          },
        },
        {
          id: "create-maintenance-tasks",
          name: "Create Maintenance Tasks",
          type: "loop",
          config: {
            collection: "{{steps.find-due-maintenance.output}}",
            itemVariable: "asset",
            steps: ["create-task"],
          },
        },
        {
          id: "create-task",
          name: "Create Maintenance Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "maintenance_tasks",
              data: {
                assetId: "{{asset.id}}",
                type: "preventive",
                scheduledDate: "{{now + 3d}}",
                assigneeId: "{{asset.technicianId}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
];

// Finance Templates
export const financeTemplates: WorkflowTemplate[] = [
  {
    id: "expense-approval-routing",
    name: "Expense Approval Routing",
    description: "Route expenses for approval based on amount",
    category: "finance",
    tags: ["expenses", "approval", "routing"],
    workflow: {
      name: "Expense Approval Routing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "expense.submitted" },
      },
      steps: [
        {
          id: "determine-approver",
          name: "Determine Approver Level",
          type: "condition",
          config: {
            expression: "{{trigger.data.amount}}",
            trueBranch: ["manager-approval"],
            falseBranch: ["director-approval"],
          },
          conditions: [{ field: "trigger.data.amount", operator: "lt", value: 1000 }],
        },
        {
          id: "manager-approval",
          name: "Request Manager Approval",
          type: "approval",
          config: {
            approvers: ["{{trigger.data.submitter.managerId}}"],
            requiredApprovals: 1,
            timeout: 172800,
          },
          onSuccess: ["approve-expense"],
          onFailure: ["reject-expense"],
        },
        {
          id: "director-approval",
          name: "Request Director Approval",
          type: "approval",
          config: {
            approvers: ["{{trigger.data.project.directorId}}", "{{trigger.data.organization.financeDirectorId}}"],
            requiredApprovals: 1,
            timeout: 259200,
          },
          onSuccess: ["approve-expense"],
          onFailure: ["reject-expense"],
        },
        {
          id: "approve-expense",
          name: "Approve Expense",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "expenses",
              id: "{{trigger.data.id}}",
              data: { status: "approved" },
            },
          },
        },
        {
          id: "reject-expense",
          name: "Reject Expense",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "expenses",
              id: "{{trigger.data.id}}",
              data: { status: "rejected" },
            },
          },
        },
      ],
    },
    variables: [
      { name: "managerThreshold", type: "number", description: "Amount threshold for manager approval", required: false, default: 1000 },
    ],
  },
  {
    id: "invoice-overdue",
    name: "Invoice Overdue Follow-up",
    description: "Automated follow-up for overdue invoices",
    category: "finance",
    tags: ["invoices", "collections", "overdue"],
    workflow: {
      name: "Invoice Overdue Follow-up",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-overdue",
          name: "Find Overdue Invoices",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "invoices",
              filters: {
                dueDate: { $lt: "{{now}}" },
                status: "sent",
                paidAmount: { $lt: "{{invoice.totalAmount}}" },
              },
              include: ["contact", "company"],
            },
          },
        },
        {
          id: "categorize-overdue",
          name: "Categorize by Days Overdue",
          type: "transform",
          config: {
            input: "{{steps.find-overdue.output}}",
            output: "categorized",
            transformation: "categorizeByDaysOverdue",
          },
        },
        {
          id: "send-first-reminder",
          name: "Send First Reminder (1-7 days)",
          type: "loop",
          config: {
            collection: "{{categorized.firstReminder}}",
            itemVariable: "invoice",
            steps: ["email-first-reminder"],
          },
        },
        {
          id: "email-first-reminder",
          name: "Email First Reminder",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{invoice.contact.email}}"],
            template: "invoice-reminder-first",
            data: { invoice: "{{invoice}}" },
          },
        },
        {
          id: "send-second-reminder",
          name: "Send Second Reminder (8-14 days)",
          type: "loop",
          config: {
            collection: "{{categorized.secondReminder}}",
            itemVariable: "invoice",
            steps: ["email-second-reminder"],
          },
        },
        {
          id: "email-second-reminder",
          name: "Email Second Reminder",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{invoice.contact.email}}"],
            template: "invoice-reminder-second",
            data: { invoice: "{{invoice}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "budget-threshold",
    name: "Budget Threshold Alert",
    description: "Alert when budget utilization exceeds thresholds",
    category: "finance",
    tags: ["budgets", "alerts", "thresholds"],
    workflow: {
      name: "Budget Threshold Alert",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "expense.created" },
      },
      steps: [
        {
          id: "calculate-utilization",
          name: "Calculate Budget Utilization",
          type: "action",
          config: {
            actionType: "calculateBudgetUtilization",
            parameters: {
              budgetId: "{{trigger.data.budgetId}}",
            },
          },
        },
        {
          id: "check-threshold",
          name: "Check Threshold",
          type: "condition",
          config: {
            expression: "{{steps.calculate-utilization.output.percentage}}",
            trueBranch: ["send-alert"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.calculate-utilization.output.percentage", operator: "gte", value: 80 }],
        },
        {
          id: "send-alert",
          name: "Send Budget Alert",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.budget.ownerId}}", "{{trigger.data.project.managerId}}"],
            template: "budget-threshold-alert",
            data: {
              budgetName: "{{trigger.data.budget.name}}",
              utilization: "{{steps.calculate-utilization.output.percentage}}",
              remaining: "{{steps.calculate-utilization.output.remaining}}",
            },
          },
        },
      ],
    },
    variables: [
      { name: "warningThreshold", type: "number", description: "Percentage threshold for warning", required: false, default: 80 },
      { name: "criticalThreshold", type: "number", description: "Percentage threshold for critical", required: false, default: 95 },
    ],
  },
];

// Talent Templates
export const talentTemplates: WorkflowTemplate[] = [
  {
    id: "booking-confirmation",
    name: "Talent Booking Confirmation",
    description: "Send booking confirmation to talent and agents",
    category: "talent",
    tags: ["bookings", "confirmation", "talent"],
    workflow: {
      name: "Talent Booking Confirmation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "booking.confirmed" },
      },
      steps: [
        {
          id: "generate-contract",
          name: "Generate Contract",
          type: "action",
          config: {
            actionType: "generateDocument",
            parameters: {
              template: "talent-contract",
              bookingId: "{{trigger.data.id}}",
            },
          },
        },
        {
          id: "send-to-talent",
          name: "Send to Talent",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.talent.email}}"],
            template: "booking-confirmation-talent",
            data: {
              booking: "{{trigger.data}}",
              contract: "{{steps.generate-contract.output}}",
            },
          },
        },
        {
          id: "send-to-agent",
          name: "Send to Agent",
          type: "condition",
          config: {
            expression: "{{trigger.data.talent.agentId}}",
            trueBranch: ["notify-agent"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.talent.agentId", operator: "ne", value: null }],
        },
        {
          id: "notify-agent",
          name: "Notify Agent",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.talent.agent.email}}"],
            template: "booking-confirmation-agent",
            data: { booking: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "rider-review",
    name: "Rider Review Request",
    description: "Request rider review before event",
    category: "talent",
    tags: ["riders", "review", "production"],
    workflow: {
      name: "Rider Review Request",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-upcoming-bookings",
          name: "Find Upcoming Bookings",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "bookings",
              filters: {
                eventDate: { $gte: "{{now}}", $lte: "{{now + 14d}}" },
                riderReviewed: false,
              },
              include: ["talent", "event"],
            },
          },
        },
        {
          id: "send-review-requests",
          name: "Send Review Requests",
          type: "loop",
          config: {
            collection: "{{steps.find-upcoming-bookings.output}}",
            itemVariable: "booking",
            steps: ["notify-production"],
          },
        },
        {
          id: "notify-production",
          name: "Notify Production Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{booking.event.productionManagerId}}"],
            template: "rider-review-request",
            data: {
              talentName: "{{booking.talent.name}}",
              eventName: "{{booking.event.name}}",
              rider: "{{booking.talent.rider}}",
            },
          },
        },
      ],
    },
    variables: [
      { name: "daysBeforeEvent", type: "number", description: "Days before event to request review", required: false, default: 14 },
    ],
  },
];

// Experience Templates
export const experienceTemplates: WorkflowTemplate[] = [
  {
    id: "ticket-purchase",
    name: "Ticket Purchase Confirmation",
    description: "Send confirmation and tickets after purchase",
    category: "experience",
    tags: ["tickets", "purchase", "confirmation"],
    workflow: {
      name: "Ticket Purchase Confirmation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "ticket.purchased" },
      },
      steps: [
        {
          id: "generate-tickets",
          name: "Generate Ticket PDFs",
          type: "action",
          config: {
            actionType: "generateTickets",
            parameters: {
              orderId: "{{trigger.data.orderId}}",
              format: "pdf",
            },
          },
        },
        {
          id: "send-confirmation",
          name: "Send Confirmation Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customer.email}}"],
            template: "ticket-purchase-confirmation",
            data: {
              order: "{{trigger.data}}",
              tickets: "{{steps.generate-tickets.output}}",
            },
          },
        },
        {
          id: "add-to-calendar",
          name: "Send Calendar Invite",
          type: "action",
          config: {
            actionType: "sendCalendarInvite",
            parameters: {
              email: "{{trigger.data.customer.email}}",
              event: "{{trigger.data.event}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "guest-checkin",
    name: "Guest Check-in Processing",
    description: "Process guest check-in and trigger hospitality",
    category: "experience",
    tags: ["checkin", "guests", "hospitality"],
    workflow: {
      name: "Guest Check-in Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "guest.checked_in" },
      },
      steps: [
        {
          id: "update-attendance",
          name: "Update Attendance Record",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "attendees",
              id: "{{trigger.data.attendeeId}}",
              data: { checkedInAt: "{{now}}", status: "checked_in" },
            },
          },
        },
        {
          id: "check-vip",
          name: "Check VIP Status",
          type: "condition",
          config: {
            expression: "{{trigger.data.ticketType}}",
            trueBranch: ["notify-hospitality"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.ticketType", operator: "in", value: ["vip", "platinum", "backstage"] }],
        },
        {
          id: "notify-hospitality",
          name: "Notify Hospitality Team",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{trigger.data.event.hospitalityTeamIds}}"],
            template: "vip-checkin-alert",
            data: {
              guestName: "{{trigger.data.guest.name}}",
              ticketType: "{{trigger.data.ticketType}}",
              location: "{{trigger.data.checkInLocation}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "hospitality-fulfillment",
    name: "Hospitality Request Fulfillment",
    description: "Process and fulfill hospitality requests",
    category: "experience",
    tags: ["hospitality", "requests", "fulfillment"],
    workflow: {
      name: "Hospitality Request Fulfillment",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "hospitality_request.created" },
      },
      steps: [
        {
          id: "assign-staff",
          name: "Assign Staff Member",
          type: "action",
          config: {
            actionType: "assignAvailableStaff",
            parameters: {
              requestId: "{{trigger.data.id}}",
              skillRequired: "{{trigger.data.type}}",
              location: "{{trigger.data.location}}",
            },
          },
        },
        {
          id: "notify-staff",
          name: "Notify Assigned Staff",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{steps.assign-staff.output.staffId}}"],
            template: "hospitality-request-assigned",
            data: {
              request: "{{trigger.data}}",
              guestName: "{{trigger.data.guest.name}}",
              location: "{{trigger.data.location}}",
            },
          },
        },
        {
          id: "set-sla-timer",
          name: "Set SLA Timer",
          type: "delay",
          config: { duration: 15, unit: "minutes" },
        },
        {
          id: "check-completion",
          name: "Check if Completed",
          type: "condition",
          config: {
            expression: "{{trigger.data.request.status}}",
            trueBranch: [],
            falseBranch: ["escalate"],
          },
          conditions: [{ field: "trigger.data.request.status", operator: "eq", value: "completed" }],
        },
        {
          id: "escalate",
          name: "Escalate to Supervisor",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{trigger.data.event.hospitalitySupervisorId}}"],
            template: "hospitality-sla-breach",
            data: { request: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [
      { name: "slaMinutes", type: "number", description: "SLA time in minutes", required: false, default: 15 },
    ],
  },
];

// Export all templates
export const allWorkflowTemplates: WorkflowTemplate[] = [
  // Core domain templates
  ...projectManagementTemplates,
  ...liveProductionTemplates,
  ...workforceTemplates,
  ...assetTemplates,
  ...financeTemplates,
  ...talentTemplates,
  ...experienceTemplates,
  // Extended domain templates
  ...salesCrmTemplates,
  ...marketingTemplates,
  ...financeExtendedTemplates,
  ...procurementTemplates,
  ...workforceExtendedTemplates,
  ...projectManagementExtendedTemplates,
  ...productionExtendedTemplates,
  ...supportTemplates,
  ...complianceTemplates,
];

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return allWorkflowTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return allWorkflowTemplates.find((t) => t.id === id);
}

export function getTemplateCategories(): string[] {
  return Array.from(new Set(allWorkflowTemplates.map((t) => t.category)));
}
