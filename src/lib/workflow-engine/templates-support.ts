/**
 * Service/Support Workflow Templates
 * Implements 8 workflows for service and support automation
 */

import type { WorkflowTemplate } from "./types";

export const supportTemplates: WorkflowTemplate[] = [
  {
    id: "ticket-assignment-routing",
    name: "Ticket Assignment Routing",
    description: "Automatically route tickets to appropriate agents",
    category: "support",
    tags: ["tickets", "routing", "assignment"],
    workflow: {
      name: "Ticket Assignment Routing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "support_ticket.created" },
      },
      steps: [
        {
          id: "categorize-ticket",
          name: "Categorize Ticket",
          type: "action",
          config: {
            actionType: "categorizeTicket",
            parameters: {
              ticketId: "{{trigger.data.id}}",
              subject: "{{trigger.data.subject}}",
              description: "{{trigger.data.description}}",
            },
          },
        },
        {
          id: "determine-priority",
          name: "Determine Priority",
          type: "action",
          config: {
            actionType: "determineTicketPriority",
            parameters: {
              ticketId: "{{trigger.data.id}}",
              customerId: "{{trigger.data.customerId}}",
              category: "{{steps.categorize-ticket.output.category}}",
            },
          },
        },
        {
          id: "find-agent",
          name: "Find Available Agent",
          type: "action",
          config: {
            actionType: "findAvailableAgent",
            parameters: {
              category: "{{steps.categorize-ticket.output.category}}",
              priority: "{{steps.determine-priority.output.priority}}",
              skills: "{{steps.categorize-ticket.output.requiredSkills}}",
            },
          },
        },
        {
          id: "assign-ticket",
          name: "Assign Ticket",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "support_tickets",
              id: "{{trigger.data.id}}",
              data: {
                assigneeId: "{{steps.find-agent.output.agentId}}",
                category: "{{steps.categorize-ticket.output.category}}",
                priority: "{{steps.determine-priority.output.priority}}",
                status: "assigned",
              },
            },
          },
        },
        {
          id: "notify-agent",
          name: "Notify Agent",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{steps.find-agent.output.agentId}}"],
            template: "ticket-assigned",
            data: { ticket: "{{trigger.data}}", priority: "{{steps.determine-priority.output}}" },
          },
        },
        {
          id: "send-acknowledgment",
          name: "Send Customer Acknowledgment",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customerEmail}}"],
            template: "ticket-received",
            data: { ticket: "{{trigger.data}}", estimatedResponse: "{{steps.determine-priority.output.slaHours}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "sla-breach-warning",
    name: "SLA Breach Warning",
    description: "Warn before SLA breach and escalate if needed",
    category: "support",
    tags: ["sla", "breach", "warning", "escalation"],
    workflow: {
      name: "SLA Breach Warning",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "*/15 * * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-at-risk",
          name: "Find At-Risk Tickets",
          type: "action",
          config: {
            actionType: "findTicketsAtSLARisk",
            parameters: {
              warningThresholdPercent: 80,
              statuses: ["open", "assigned", "in_progress"],
            },
          },
        },
        {
          id: "process-warnings",
          name: "Process Warning Tickets",
          type: "loop",
          config: {
            collection: "{{steps.find-at-risk.output.warning}}",
            itemVariable: "ticket",
            steps: ["send-warning"],
          },
        },
        {
          id: "send-warning",
          name: "Send SLA Warning",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{ticket.assigneeId}}"],
            template: "sla-warning",
            data: { ticket: "{{ticket}}", timeRemaining: "{{ticket.slaTimeRemaining}}" },
          },
        },
        {
          id: "process-breaches",
          name: "Process Breached Tickets",
          type: "loop",
          config: {
            collection: "{{steps.find-at-risk.output.breached}}",
            itemVariable: "ticket",
            steps: ["escalate-ticket", "notify-manager"],
          },
        },
        {
          id: "escalate-ticket",
          name: "Escalate Ticket",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "support_tickets",
              id: "{{ticket.id}}",
              data: { escalated: true, escalatedAt: "{{now}}", escalationReason: "sla_breach" },
            },
          },
        },
        {
          id: "notify-manager",
          name: "Notify Support Manager",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{org.supportManagerId}}"],
            template: "sla-breach-escalation",
            data: { ticket: "{{ticket}}" },
          },
        },
      ],
    },
    variables: [
      { name: "warningThreshold", type: "number", description: "SLA percentage for warning", required: false, default: 80 },
    ],
  },
  {
    id: "ticket-escalation",
    name: "Ticket Escalation",
    description: "Escalate tickets based on rules and thresholds",
    category: "support",
    tags: ["tickets", "escalation", "management"],
    workflow: {
      name: "Ticket Escalation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "support_ticket.escalation_requested" },
      },
      steps: [
        {
          id: "get-escalation-path",
          name: "Get Escalation Path",
          type: "action",
          config: {
            actionType: "getEscalationPath",
            parameters: {
              ticketId: "{{trigger.data.id}}",
              currentLevel: "{{trigger.data.escalationLevel}}",
              category: "{{trigger.data.category}}",
            },
          },
        },
        {
          id: "update-ticket",
          name: "Update Ticket Escalation",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "support_tickets",
              id: "{{trigger.data.id}}",
              data: {
                escalationLevel: "{{trigger.data.escalationLevel + 1}}",
                assigneeId: "{{steps.get-escalation-path.output.nextAssigneeId}}",
                escalatedAt: "{{now}}",
                escalationReason: "{{trigger.data.reason}}",
              },
            },
          },
        },
        {
          id: "notify-new-assignee",
          name: "Notify New Assignee",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.get-escalation-path.output.nextAssigneeId}}"],
            template: "ticket-escalated-to-you",
            data: { ticket: "{{trigger.data}}", reason: "{{trigger.data.reason}}" },
          },
        },
        {
          id: "notify-customer",
          name: "Notify Customer",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customerEmail}}"],
            template: "ticket-escalated-customer",
            data: { ticket: "{{trigger.data}}" },
          },
        },
        {
          id: "log-escalation",
          name: "Log Escalation",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "ticket_activities",
              data: {
                ticketId: "{{trigger.data.id}}",
                type: "escalation",
                fromUserId: "{{trigger.data.assigneeId}}",
                toUserId: "{{steps.get-escalation-path.output.nextAssigneeId}}",
                reason: "{{trigger.data.reason}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "customer-satisfaction-survey",
    name: "Customer Satisfaction Survey",
    description: "Send satisfaction surveys after ticket resolution",
    category: "support",
    tags: ["csat", "surveys", "feedback"],
    workflow: {
      name: "Customer Satisfaction Survey",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "support_ticket.resolved" },
      },
      steps: [
        {
          id: "check-eligibility",
          name: "Check Survey Eligibility",
          type: "action",
          config: {
            actionType: "checkSurveyEligibility",
            parameters: {
              customerId: "{{trigger.data.customerId}}",
              surveyType: "csat",
              cooldownDays: 14,
            },
          },
        },
        {
          id: "check-eligible",
          name: "Check if Eligible",
          type: "condition",
          config: {
            expression: "{{steps.check-eligibility.output.eligible}}",
            trueBranch: ["wait-delay"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.check-eligibility.output.eligible", operator: "eq", value: true }],
        },
        {
          id: "wait-delay",
          name: "Wait Before Sending",
          type: "delay",
          config: { duration: 1, unit: "hours" },
        },
        {
          id: "send-survey",
          name: "Send CSAT Survey",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customerEmail}}"],
            template: "csat-survey",
            data: { ticket: "{{trigger.data}}" },
          },
        },
        {
          id: "create-survey-record",
          name: "Create Survey Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "survey_requests",
              data: {
                ticketId: "{{trigger.data.id}}",
                customerId: "{{trigger.data.customerId}}",
                type: "csat",
                sentAt: "{{now}}",
                status: "sent",
              },
            },
          },
        },
      ],
    },
    variables: [
      { name: "cooldownDays", type: "number", description: "Days between surveys", required: false, default: 14 },
    ],
  },
  {
    id: "knowledge-base-suggestion",
    name: "Knowledge Base Suggestion",
    description: "Suggest relevant KB articles for tickets",
    category: "support",
    tags: ["knowledge-base", "suggestions", "self-service"],
    workflow: {
      name: "Knowledge Base Suggestion",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "support_ticket.created" },
      },
      steps: [
        {
          id: "search-kb",
          name: "Search Knowledge Base",
          type: "action",
          config: {
            actionType: "searchKnowledgeBase",
            parameters: {
              query: "{{trigger.data.subject}} {{trigger.data.description}}",
              limit: 5,
              minScore: 0.7,
            },
          },
        },
        {
          id: "check-results",
          name: "Check if Results Found",
          type: "condition",
          config: {
            expression: "{{steps.search-kb.output.length}}",
            trueBranch: ["send-suggestions"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.search-kb.output.length", operator: "gt", value: 0 }],
        },
        {
          id: "send-suggestions",
          name: "Send KB Suggestions",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customerEmail}}"],
            template: "kb-suggestions",
            data: { ticket: "{{trigger.data}}", articles: "{{steps.search-kb.output}}" },
          },
        },
        {
          id: "attach-to-ticket",
          name: "Attach Suggestions to Ticket",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "support_tickets",
              id: "{{trigger.data.id}}",
              data: { suggestedArticles: "{{steps.search-kb.output.map(a => a.id)}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "recurring-issue-detection",
    name: "Recurring Issue Detection",
    description: "Detect and alert on recurring issues",
    category: "support",
    tags: ["issues", "detection", "patterns"],
    workflow: {
      name: "Recurring Issue Detection",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "analyze-tickets",
          name: "Analyze Recent Tickets",
          type: "action",
          config: {
            actionType: "analyzeTicketPatterns",
            parameters: {
              lookbackDays: 7,
              minOccurrences: 5,
              groupBy: ["category", "tags", "keywords"],
            },
          },
        },
        {
          id: "identify-patterns",
          name: "Identify Recurring Patterns",
          type: "action",
          config: {
            actionType: "identifyRecurringIssues",
            parameters: {
              patterns: "{{steps.analyze-tickets.output}}",
              threshold: 5,
            },
          },
        },
        {
          id: "check-patterns",
          name: "Check if Patterns Found",
          type: "condition",
          config: {
            expression: "{{steps.identify-patterns.output.length}}",
            trueBranch: ["create-alerts"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.identify-patterns.output.length", operator: "gt", value: 0 }],
        },
        {
          id: "create-alerts",
          name: "Create Issue Alerts",
          type: "loop",
          config: {
            collection: "{{steps.identify-patterns.output}}",
            itemVariable: "pattern",
            steps: ["create-alert"],
          },
        },
        {
          id: "create-alert",
          name: "Create Alert Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "recurring_issue_alerts",
              data: {
                pattern: "{{pattern.description}}",
                occurrences: "{{pattern.count}}",
                affectedTickets: "{{pattern.ticketIds}}",
                suggestedAction: "{{pattern.suggestedAction}}",
                status: "new",
              },
            },
          },
        },
        {
          id: "notify-team",
          name: "Notify Support Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{org.supportManagerId}}"],
            template: "recurring-issues-detected",
            data: { patterns: "{{steps.identify-patterns.output}}" },
          },
        },
      ],
    },
    variables: [
      { name: "minOccurrences", type: "number", description: "Minimum occurrences to flag", required: false, default: 5 },
    ],
  },
  {
    id: "first-response-automation",
    name: "First Response Automation",
    description: "Automate first response for common ticket types",
    category: "support",
    tags: ["automation", "response", "efficiency"],
    workflow: {
      name: "First Response Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "support_ticket.created" },
      },
      steps: [
        {
          id: "classify-ticket",
          name: "Classify Ticket",
          type: "action",
          config: {
            actionType: "classifyTicket",
            parameters: {
              subject: "{{trigger.data.subject}}",
              description: "{{trigger.data.description}}",
            },
          },
        },
        {
          id: "check-auto-response",
          name: "Check if Auto-Response Available",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "auto_response_templates",
              filters: {
                category: "{{steps.classify-ticket.output.category}}",
                isActive: true,
              },
            },
          },
        },
        {
          id: "check-template-exists",
          name: "Check if Template Exists",
          type: "condition",
          config: {
            expression: "{{steps.check-auto-response.output.length}}",
            trueBranch: ["send-auto-response"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.check-auto-response.output.length", operator: "gt", value: 0 }],
        },
        {
          id: "send-auto-response",
          name: "Send Auto Response",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customerEmail}}"],
            template: "{{steps.check-auto-response.output[0].templateId}}",
            data: { ticket: "{{trigger.data}}" },
          },
        },
        {
          id: "update-ticket",
          name: "Update Ticket Status",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "support_tickets",
              id: "{{trigger.data.id}}",
              data: {
                firstResponseAt: "{{now}}",
                autoResponded: true,
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "ticket-merge-detection",
    name: "Ticket Merge Detection",
    description: "Detect and suggest duplicate tickets for merging",
    category: "support",
    tags: ["duplicates", "merge", "efficiency"],
    workflow: {
      name: "Ticket Merge Detection",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "support_ticket.created" },
      },
      steps: [
        {
          id: "find-duplicates",
          name: "Find Potential Duplicates",
          type: "action",
          config: {
            actionType: "findDuplicateTickets",
            parameters: {
              ticketId: "{{trigger.data.id}}",
              customerId: "{{trigger.data.customerId}}",
              subject: "{{trigger.data.subject}}",
              lookbackDays: 30,
              similarityThreshold: 0.8,
            },
          },
        },
        {
          id: "check-duplicates",
          name: "Check if Duplicates Found",
          type: "condition",
          config: {
            expression: "{{steps.find-duplicates.output.length}}",
            trueBranch: ["flag-for-review"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.find-duplicates.output.length", operator: "gt", value: 0 }],
        },
        {
          id: "flag-for-review",
          name: "Flag for Merge Review",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "support_tickets",
              id: "{{trigger.data.id}}",
              data: {
                potentialDuplicates: "{{steps.find-duplicates.output.map(t => t.id)}}",
                flaggedForMerge: true,
              },
            },
          },
        },
        {
          id: "notify-agent",
          name: "Notify Assigned Agent",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{trigger.data.assigneeId}}"],
            template: "potential-duplicate-ticket",
            data: {
              ticket: "{{trigger.data}}",
              duplicates: "{{steps.find-duplicates.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
];
