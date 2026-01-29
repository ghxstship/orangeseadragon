/**
 * Sales & CRM Workflow Templates
 * Implements 15 workflows for HubSpot/Odoo parity
 */

import type { WorkflowTemplate } from "./types";

export const salesCrmTemplates: WorkflowTemplate[] = [
  {
    id: "lead-scoring-automation",
    name: "Lead Scoring Automation",
    description: "Automatically score leads based on engagement and profile data",
    category: "sales_crm",
    tags: ["leads", "scoring", "automation"],
    workflow: {
      name: "Lead Scoring Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "lead.activity_recorded" },
      },
      steps: [
        {
          id: "get-scoring-rules",
          name: "Get Active Scoring Rules",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "lead_scoring_rules",
              filters: { isActive: true },
            },
          },
        },
        {
          id: "calculate-score",
          name: "Calculate Lead Score",
          type: "action",
          config: {
            actionType: "calculateLeadScore",
            parameters: {
              leadId: "{{trigger.data.leadId}}",
              rules: "{{steps.get-scoring-rules.output}}",
              activity: "{{trigger.data}}",
            },
          },
        },
        {
          id: "update-lead-score",
          name: "Update Lead Score",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "leads",
              id: "{{trigger.data.leadId}}",
              data: {
                score: "{{steps.calculate-score.output.totalScore}}",
                scoreUpdatedAt: "{{now}}",
                grade: "{{steps.calculate-score.output.grade}}",
              },
            },
          },
        },
        {
          id: "check-mql-threshold",
          name: "Check MQL Threshold",
          type: "condition",
          config: {
            expression: "{{steps.calculate-score.output.totalScore}}",
            trueBranch: ["notify-sales"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.calculate-score.output.totalScore", operator: "gte", value: 80 }],
        },
        {
          id: "notify-sales",
          name: "Notify Sales Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.lead.assignedToId}}"],
            template: "mql-notification",
            data: { lead: "{{trigger.data.lead}}", score: "{{steps.calculate-score.output.totalScore}}" },
          },
        },
      ],
    },
    variables: [
      { name: "mqlThreshold", type: "number", description: "Score threshold for MQL status", required: false, default: 80 },
    ],
  },
  {
    id: "lead-assignment-routing",
    name: "Lead Assignment Routing",
    description: "Automatically assign leads to sales reps based on rules",
    category: "sales_crm",
    tags: ["leads", "assignment", "routing"],
    workflow: {
      name: "Lead Assignment Routing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "lead.created" },
      },
      steps: [
        {
          id: "get-assignment-rules",
          name: "Get Assignment Rules",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "lead_assignment_rules",
              filters: { isActive: true },
              orderBy: { priority: "asc" },
            },
          },
        },
        {
          id: "match-rule",
          name: "Match Assignment Rule",
          type: "action",
          config: {
            actionType: "matchLeadAssignmentRule",
            parameters: {
              lead: "{{trigger.data}}",
              rules: "{{steps.get-assignment-rules.output}}",
            },
          },
        },
        {
          id: "assign-lead",
          name: "Assign Lead to Rep",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "leads",
              id: "{{trigger.data.id}}",
              data: {
                assignedToId: "{{steps.match-rule.output.assigneeId}}",
                assignedAt: "{{now}}",
              },
            },
          },
        },
        {
          id: "notify-assignee",
          name: "Notify Assigned Rep",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{steps.match-rule.output.assigneeId}}"],
            template: "new-lead-assigned",
            data: { lead: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "lead-nurture-sequence",
    name: "Lead Nurture Sequence",
    description: "Automated email sequence to nurture leads over time",
    category: "sales_crm",
    tags: ["leads", "nurture", "email", "sequences"],
    workflow: {
      name: "Lead Nurture Sequence",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "lead.enrolled_in_sequence" },
      },
      steps: [
        {
          id: "get-sequence",
          name: "Get Sequence Steps",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "email_sequence_steps",
              filters: { sequenceId: "{{trigger.data.sequenceId}}" },
              orderBy: { position: "asc" },
            },
          },
        },
        {
          id: "execute-sequence",
          name: "Execute Sequence Steps",
          type: "loop",
          config: {
            collection: "{{steps.get-sequence.output}}",
            itemVariable: "step",
            steps: ["wait-delay", "check-unenrolled", "send-email"],
          },
        },
        {
          id: "wait-delay",
          name: "Wait for Delay",
          type: "delay",
          config: { duration: "{{step.delayDays}}", unit: "days" },
        },
        {
          id: "check-unenrolled",
          name: "Check if Still Enrolled",
          type: "condition",
          config: {
            expression: "{{trigger.data.enrollment.status}}",
            trueBranch: [],
            falseBranch: ["send-email"],
          },
          conditions: [{ field: "trigger.data.enrollment.status", operator: "eq", value: "unenrolled" }],
        },
        {
          id: "send-email",
          name: "Send Sequence Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.lead.email}}"],
            template: "{{step.emailTemplateId}}",
            data: { lead: "{{trigger.data.lead}}", step: "{{step}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "deal-stage-progression",
    name: "Deal Stage Progression",
    description: "Automate actions when deals move through pipeline stages",
    category: "sales_crm",
    tags: ["deals", "pipeline", "stages", "automation"],
    workflow: {
      name: "Deal Stage Progression",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "deal.stage_changed" },
      },
      steps: [
        {
          id: "get-stage-actions",
          name: "Get Stage Actions",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "pipeline_stage_actions",
              filters: { stageId: "{{trigger.data.newStageId}}" },
            },
          },
        },
        {
          id: "execute-actions",
          name: "Execute Stage Actions",
          type: "loop",
          config: {
            collection: "{{steps.get-stage-actions.output}}",
            itemVariable: "action",
            steps: ["execute-action"],
          },
        },
        {
          id: "execute-action",
          name: "Execute Action",
          type: "action",
          config: {
            actionType: "{{action.actionType}}",
            parameters: "{{action.parameters}}",
          },
        },
        {
          id: "log-activity",
          name: "Log Stage Change Activity",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "activities",
              data: {
                type: "stage_change",
                entityType: "deal",
                entityId: "{{trigger.data.dealId}}",
                metadata: {
                  fromStage: "{{trigger.data.previousStageId}}",
                  toStage: "{{trigger.data.newStageId}}",
                },
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "quote-expiration-reminder",
    name: "Quote Expiration Reminder",
    description: "Send reminders before quotes expire",
    category: "sales_crm",
    tags: ["quotes", "proposals", "reminders", "expiration"],
    workflow: {
      name: "Quote Expiration Reminder",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-expiring-quotes",
          name: "Find Expiring Quotes",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "proposals",
              filters: {
                expiresAt: { $lte: "{{now + 7d}}", $gte: "{{now}}" },
                status: "sent",
              },
              include: ["contact", "deal"],
            },
          },
        },
        {
          id: "send-reminders",
          name: "Send Expiration Reminders",
          type: "loop",
          config: {
            collection: "{{steps.find-expiring-quotes.output}}",
            itemVariable: "quote",
            steps: ["notify-contact", "notify-owner"],
          },
        },
        {
          id: "notify-contact",
          name: "Notify Contact",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{quote.contact.email}}"],
            template: "quote-expiring-customer",
            data: { quote: "{{quote}}", daysRemaining: "{{dateDiff(quote.expiresAt, now, 'days')}}" },
          },
        },
        {
          id: "notify-owner",
          name: "Notify Quote Owner",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{quote.ownerId}}"],
            template: "quote-expiring-internal",
            data: { quote: "{{quote}}" },
          },
        },
      ],
    },
    variables: [
      { name: "reminderDays", type: "number", description: "Days before expiration to send reminder", required: false, default: 7 },
    ],
  },
  {
    id: "contract-renewal-reminder",
    name: "Contract Renewal Reminder",
    description: "Automated reminders for upcoming contract renewals",
    category: "sales_crm",
    tags: ["contracts", "renewals", "reminders"],
    workflow: {
      name: "Contract Renewal Reminder",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-renewals",
          name: "Find Upcoming Renewals",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "contracts",
              filters: {
                endDate: { $lte: "{{now + 90d}}", $gte: "{{now}}" },
                status: "active",
                autoRenew: false,
              },
              include: ["company", "contact", "owner"],
            },
          },
        },
        {
          id: "categorize-renewals",
          name: "Categorize by Urgency",
          type: "transform",
          config: {
            input: "{{steps.find-renewals.output}}",
            output: "categorized",
            transformation: "categorizeByDaysUntil(endDate, [30, 60, 90])",
          },
        },
        {
          id: "send-urgent",
          name: "Send Urgent Reminders (30 days)",
          type: "loop",
          config: {
            collection: "{{categorized.urgent}}",
            itemVariable: "contract",
            steps: ["notify-urgent"],
          },
        },
        {
          id: "notify-urgent",
          name: "Send Urgent Notification",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{contract.owner.email}}", "{{contract.contact.email}}"],
            template: "contract-renewal-urgent",
            data: { contract: "{{contract}}" },
          },
        },
        {
          id: "create-renewal-tasks",
          name: "Create Renewal Tasks",
          type: "loop",
          config: {
            collection: "{{categorized.upcoming}}",
            itemVariable: "contract",
            steps: ["create-task"],
          },
        },
        {
          id: "create-task",
          name: "Create Renewal Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "Renew contract: {{contract.name}}",
                dueDate: "{{contract.endDate - 14d}}",
                assigneeId: "{{contract.ownerId}}",
                relatedEntityType: "contract",
                relatedEntityId: "{{contract.id}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "win-loss-analysis",
    name: "Win/Loss Analysis Trigger",
    description: "Trigger analysis workflow when deals are won or lost",
    category: "sales_crm",
    tags: ["deals", "analysis", "win-loss"],
    workflow: {
      name: "Win/Loss Analysis Trigger",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "deal.closed" },
      },
      steps: [
        {
          id: "create-analysis-record",
          name: "Create Analysis Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "deal_analyses",
              data: {
                dealId: "{{trigger.data.id}}",
                outcome: "{{trigger.data.status}}",
                amount: "{{trigger.data.amount}}",
                daysInPipeline: "{{dateDiff(trigger.data.closedAt, trigger.data.createdAt, 'days')}}",
                competitorId: "{{trigger.data.competitorId}}",
              },
            },
          },
        },
        {
          id: "check-survey-needed",
          name: "Check if Survey Needed",
          type: "condition",
          config: {
            expression: "{{trigger.data.amount}}",
            trueBranch: ["send-survey"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.amount", operator: "gte", value: 10000 }],
        },
        {
          id: "send-survey",
          name: "Send Win/Loss Survey",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.contact.email}}"],
            template: "{{trigger.data.status === 'won' ? 'deal-won-survey' : 'deal-lost-survey'}}",
            data: { deal: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "customer-onboarding-sequence",
    name: "Customer Onboarding Sequence",
    description: "Automated onboarding sequence for new customers",
    category: "sales_crm",
    tags: ["customers", "onboarding", "sequences"],
    workflow: {
      name: "Customer Onboarding Sequence",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "deal.won" },
      },
      steps: [
        {
          id: "convert-to-customer",
          name: "Convert Contact to Customer",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "contacts",
              id: "{{trigger.data.contactId}}",
              data: { lifecycleStage: "customer", becameCustomerAt: "{{now}}" },
            },
          },
        },
        {
          id: "create-onboarding-project",
          name: "Create Onboarding Project",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "customer-onboarding",
              data: {
                name: "Onboarding: {{trigger.data.company.name}}",
                customerId: "{{trigger.data.contactId}}",
                dealId: "{{trigger.data.id}}",
              },
            },
          },
        },
        {
          id: "send-welcome",
          name: "Send Welcome Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.contact.email}}"],
            template: "customer-welcome",
            data: { customer: "{{trigger.data.contact}}", deal: "{{trigger.data}}" },
          },
        },
        {
          id: "schedule-kickoff",
          name: "Schedule Kickoff Call",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "calendar_events",
              data: {
                title: "Kickoff Call: {{trigger.data.company.name}}",
                type: "meeting",
                scheduledFor: "{{now + 3d}}",
                attendees: ["{{trigger.data.contactId}}", "{{trigger.data.ownerId}}"],
              },
            },
          },
        },
        {
          id: "notify-csm",
          name: "Notify Customer Success",
          type: "notification",
          config: {
            channel: "slack",
            recipients: ["#customer-success"],
            template: "new-customer-alert",
            data: { customer: "{{trigger.data.contact}}", deal: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "upsell-crosssell-trigger",
    name: "Upsell/Cross-sell Trigger",
    description: "Identify and trigger upsell/cross-sell opportunities",
    category: "sales_crm",
    tags: ["upsell", "cross-sell", "opportunities"],
    workflow: {
      name: "Upsell/Cross-sell Trigger",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 10 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-opportunities",
          name: "Find Upsell Opportunities",
          type: "action",
          config: {
            actionType: "identifyUpsellOpportunities",
            parameters: {
              criteria: {
                customerTenure: { $gte: 90 },
                healthScore: { $gte: 70 },
                hasNotPurchased: ["premium", "enterprise"],
              },
            },
          },
        },
        {
          id: "create-opportunities",
          name: "Create Opportunity Records",
          type: "loop",
          config: {
            collection: "{{steps.find-opportunities.output}}",
            itemVariable: "opp",
            steps: ["create-opp", "notify-owner"],
          },
        },
        {
          id: "create-opp",
          name: "Create Opportunity",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "opportunities",
              data: {
                type: "{{opp.type}}",
                contactId: "{{opp.contactId}}",
                companyId: "{{opp.companyId}}",
                recommendedProducts: "{{opp.products}}",
                estimatedValue: "{{opp.estimatedValue}}",
              },
            },
          },
        },
        {
          id: "notify-owner",
          name: "Notify Account Owner",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{opp.ownerId}}"],
            template: "upsell-opportunity",
            data: { opportunity: "{{opp}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "churn-risk-detection",
    name: "Churn Risk Detection",
    description: "Detect and alert on customers at risk of churning",
    category: "sales_crm",
    tags: ["churn", "risk", "customers", "retention"],
    workflow: {
      name: "Churn Risk Detection",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 6 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "calculate-health-scores",
          name: "Calculate Customer Health Scores",
          type: "action",
          config: {
            actionType: "calculateCustomerHealthScores",
            parameters: {
              factors: ["usage", "engagement", "support_tickets", "nps", "payment_history"],
            },
          },
        },
        {
          id: "identify-at-risk",
          name: "Identify At-Risk Customers",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "contacts",
              filters: {
                lifecycleStage: "customer",
                healthScore: { $lt: 40 },
              },
              include: ["company", "owner"],
            },
          },
        },
        {
          id: "create-alerts",
          name: "Create Churn Alerts",
          type: "loop",
          config: {
            collection: "{{steps.identify-at-risk.output}}",
            itemVariable: "customer",
            steps: ["create-alert", "notify-csm"],
          },
        },
        {
          id: "create-alert",
          name: "Create Churn Alert",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "churn_alerts",
              data: {
                customerId: "{{customer.id}}",
                healthScore: "{{customer.healthScore}}",
                riskFactors: "{{customer.riskFactors}}",
                recommendedActions: "{{customer.recommendedActions}}",
              },
            },
          },
        },
        {
          id: "notify-csm",
          name: "Notify Customer Success Manager",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{customer.ownerId}}"],
            template: "churn-risk-alert",
            data: { customer: "{{customer}}" },
          },
        },
      ],
    },
    variables: [
      { name: "riskThreshold", type: "number", description: "Health score threshold for risk", required: false, default: 40 },
    ],
  },
  {
    id: "nps-csat-survey",
    name: "NPS/CSAT Survey Automation",
    description: "Automated NPS and CSAT survey distribution",
    category: "sales_crm",
    tags: ["nps", "csat", "surveys", "feedback"],
    workflow: {
      name: "NPS/CSAT Survey Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "support_ticket.resolved" },
      },
      steps: [
        {
          id: "check-survey-eligibility",
          name: "Check Survey Eligibility",
          type: "action",
          config: {
            actionType: "checkSurveyEligibility",
            parameters: {
              contactId: "{{trigger.data.contactId}}",
              surveyType: "csat",
              cooldownDays: 30,
            },
          },
        },
        {
          id: "send-survey",
          name: "Send CSAT Survey",
          type: "condition",
          config: {
            expression: "{{steps.check-survey-eligibility.output.eligible}}",
            trueBranch: ["dispatch-survey"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.check-survey-eligibility.output.eligible", operator: "eq", value: true }],
        },
        {
          id: "dispatch-survey",
          name: "Dispatch Survey Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.contact.email}}"],
            template: "csat-survey",
            data: { ticket: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [
      { name: "cooldownDays", type: "number", description: "Days between surveys", required: false, default: 30 },
    ],
  },
  {
    id: "re-engagement-campaign",
    name: "Re-engagement Campaign",
    description: "Automated campaign to re-engage inactive leads",
    category: "sales_crm",
    tags: ["leads", "re-engagement", "campaigns"],
    workflow: {
      name: "Re-engagement Campaign",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 10 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-inactive-leads",
          name: "Find Inactive Leads",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "leads",
              filters: {
                lastActivityAt: { $lt: "{{now - 60d}}" },
                status: { $nin: ["converted", "disqualified"] },
              },
            },
          },
        },
        {
          id: "enroll-in-campaign",
          name: "Enroll in Re-engagement Campaign",
          type: "loop",
          config: {
            collection: "{{steps.find-inactive-leads.output}}",
            itemVariable: "lead",
            steps: ["enroll-lead"],
          },
        },
        {
          id: "enroll-lead",
          name: "Enroll Lead",
          type: "action",
          config: {
            actionType: "enrollInSequence",
            parameters: {
              leadId: "{{lead.id}}",
              sequenceId: "re-engagement-sequence",
            },
          },
        },
      ],
    },
    variables: [
      { name: "inactiveDays", type: "number", description: "Days of inactivity before re-engagement", required: false, default: 60 },
    ],
  },
  {
    id: "sales-activity-logging",
    name: "Sales Activity Logging",
    description: "Automatically log and track sales activities",
    category: "sales_crm",
    tags: ["activities", "logging", "tracking"],
    workflow: {
      name: "Sales Activity Logging",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "email.sent" },
      },
      steps: [
        {
          id: "create-activity",
          name: "Create Activity Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "activities",
              data: {
                type: "email",
                direction: "outbound",
                subject: "{{trigger.data.subject}}",
                contactId: "{{trigger.data.recipientId}}",
                userId: "{{trigger.data.senderId}}",
                metadata: {
                  emailId: "{{trigger.data.id}}",
                  opened: false,
                  clicked: false,
                },
              },
            },
          },
        },
        {
          id: "update-contact-activity",
          name: "Update Contact Last Activity",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "contacts",
              id: "{{trigger.data.recipientId}}",
              data: { lastActivityAt: "{{now}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "pipeline-velocity-alerts",
    name: "Pipeline Velocity Alerts",
    description: "Alert when deals are stalling in pipeline stages",
    category: "sales_crm",
    tags: ["pipeline", "velocity", "alerts", "stalled"],
    workflow: {
      name: "Pipeline Velocity Alerts",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-stalled-deals",
          name: "Find Stalled Deals",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "deals",
              filters: {
                status: "open",
                stageChangedAt: { $lt: "{{now - 14d}}" },
              },
              include: ["contact", "company", "owner", "stage"],
            },
          },
        },
        {
          id: "send-alerts",
          name: "Send Stalled Deal Alerts",
          type: "loop",
          config: {
            collection: "{{steps.find-stalled-deals.output}}",
            itemVariable: "deal",
            steps: ["notify-owner"],
          },
        },
        {
          id: "notify-owner",
          name: "Notify Deal Owner",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{deal.ownerId}}"],
            template: "stalled-deal-alert",
            data: {
              deal: "{{deal}}",
              daysInStage: "{{dateDiff(now, deal.stageChangedAt, 'days')}}",
            },
          },
        },
      ],
    },
    variables: [
      { name: "stalledDays", type: "number", description: "Days in stage before considered stalled", required: false, default: 14 },
    ],
  },
  {
    id: "commission-calculation",
    name: "Commission Calculation",
    description: "Calculate and record sales commissions on closed deals",
    category: "sales_crm",
    tags: ["commissions", "sales", "compensation"],
    workflow: {
      name: "Commission Calculation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "deal.won" },
      },
      steps: [
        {
          id: "get-commission-plan",
          name: "Get Rep Commission Plan",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "commission_plans",
              filters: { userId: "{{trigger.data.ownerId}}", isActive: true },
            },
          },
        },
        {
          id: "calculate-commission",
          name: "Calculate Commission Amount",
          type: "action",
          config: {
            actionType: "calculateCommission",
            parameters: {
              dealAmount: "{{trigger.data.amount}}",
              plan: "{{steps.get-commission-plan.output[0]}}",
              dealType: "{{trigger.data.type}}",
            },
          },
        },
        {
          id: "create-commission-record",
          name: "Create Commission Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "commissions",
              data: {
                userId: "{{trigger.data.ownerId}}",
                dealId: "{{trigger.data.id}}",
                amount: "{{steps.calculate-commission.output.amount}}",
                rate: "{{steps.calculate-commission.output.rate}}",
                status: "pending",
                earnedAt: "{{now}}",
              },
            },
          },
        },
        {
          id: "notify-rep",
          name: "Notify Sales Rep",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.ownerId}}"],
            template: "commission-earned",
            data: {
              deal: "{{trigger.data}}",
              commission: "{{steps.calculate-commission.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
];
