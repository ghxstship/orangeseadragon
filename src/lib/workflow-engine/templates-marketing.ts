/**
 * Marketing Automation Workflow Templates
 * Implements 12 workflows for marketing automation parity
 */

import type { WorkflowTemplate } from "./types";

export const marketingTemplates: WorkflowTemplate[] = [
  {
    id: "email-campaign-automation",
    name: "Email Campaign Automation",
    description: "Automated email campaign execution with tracking",
    category: "marketing",
    tags: ["email", "campaigns", "automation"],
    workflow: {
      name: "Email Campaign Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "campaign.scheduled_send" },
      },
      steps: [
        {
          id: "get-recipients",
          name: "Get Campaign Recipients",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "campaign_recipients",
              filters: { campaignId: "{{trigger.data.campaignId}}", status: "pending" },
              include: ["contact"],
            },
          },
        },
        {
          id: "send-emails",
          name: "Send Campaign Emails",
          type: "loop",
          config: {
            collection: "{{steps.get-recipients.output}}",
            itemVariable: "recipient",
            steps: ["send-email", "update-status"],
          },
        },
        {
          id: "send-email",
          name: "Send Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{recipient.contact.email}}"],
            template: "{{trigger.data.templateId}}",
            data: { campaign: "{{trigger.data}}", contact: "{{recipient.contact}}" },
          },
        },
        {
          id: "update-status",
          name: "Update Recipient Status",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "campaign_recipients",
              id: "{{recipient.id}}",
              data: { status: "sent", sentAt: "{{now}}" },
            },
          },
        },
        {
          id: "update-campaign-stats",
          name: "Update Campaign Stats",
          type: "action",
          config: {
            actionType: "updateCampaignStats",
            parameters: { campaignId: "{{trigger.data.campaignId}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "drip-campaign-sequence",
    name: "Drip Campaign Sequence",
    description: "Multi-touch drip campaign with conditional branching",
    category: "marketing",
    tags: ["drip", "campaigns", "sequences", "automation"],
    workflow: {
      name: "Drip Campaign Sequence",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "contact.enrolled_in_drip" },
      },
      steps: [
        {
          id: "get-drip-steps",
          name: "Get Drip Campaign Steps",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "drip_campaign_steps",
              filters: { campaignId: "{{trigger.data.campaignId}}" },
              orderBy: { position: "asc" },
            },
          },
        },
        {
          id: "execute-drip",
          name: "Execute Drip Steps",
          type: "loop",
          config: {
            collection: "{{steps.get-drip-steps.output}}",
            itemVariable: "dripStep",
            steps: ["wait-delay", "check-conditions", "execute-step"],
          },
        },
        {
          id: "wait-delay",
          name: "Wait for Step Delay",
          type: "delay",
          config: { duration: "{{dripStep.delayValue}}", unit: "{{dripStep.delayUnit}}" },
        },
        {
          id: "check-conditions",
          name: "Check Step Conditions",
          type: "condition",
          config: {
            expression: "{{dripStep.conditions}}",
            trueBranch: ["execute-step"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.enrollment.status", operator: "eq", value: "active" }],
        },
        {
          id: "execute-step",
          name: "Execute Drip Step",
          type: "action",
          config: {
            actionType: "executeDripStep",
            parameters: {
              stepType: "{{dripStep.type}}",
              contactId: "{{trigger.data.contactId}}",
              config: "{{dripStep.config}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "form-submission-followup",
    name: "Form Submission Follow-up",
    description: "Automated follow-up actions when forms are submitted",
    category: "marketing",
    tags: ["forms", "submissions", "follow-up", "automation"],
    workflow: {
      name: "Form Submission Follow-up",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "form.submitted" },
      },
      steps: [
        {
          id: "get-form-config",
          name: "Get Form Configuration",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "form_templates",
              filters: { id: "{{trigger.data.formId}}" },
            },
          },
        },
        {
          id: "create-or-update-contact",
          name: "Create or Update Contact",
          type: "action",
          config: {
            actionType: "upsertContact",
            parameters: {
              email: "{{trigger.data.fields.email}}",
              data: "{{trigger.data.fields}}",
              source: "form:{{trigger.data.formId}}",
            },
          },
        },
        {
          id: "send-confirmation",
          name: "Send Confirmation Email",
          type: "condition",
          config: {
            expression: "{{steps.get-form-config.output[0].sendConfirmation}}",
            trueBranch: ["dispatch-confirmation"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.get-form-config.output[0].sendConfirmation", operator: "eq", value: true }],
        },
        {
          id: "dispatch-confirmation",
          name: "Dispatch Confirmation Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.fields.email}}"],
            template: "{{steps.get-form-config.output[0].confirmationTemplateId}}",
            data: { submission: "{{trigger.data}}" },
          },
        },
        {
          id: "notify-team",
          name: "Notify Team",
          type: "condition",
          config: {
            expression: "{{steps.get-form-config.output[0].notifyTeam}}",
            trueBranch: ["send-team-notification"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.get-form-config.output[0].notifyTeam", operator: "eq", value: true }],
        },
        {
          id: "send-team-notification",
          name: "Send Team Notification",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{steps.get-form-config.output[0].notifyEmails}}",
            template: "form-submission-notification",
            data: { submission: "{{trigger.data}}", form: "{{steps.get-form-config.output[0]}}" },
          },
        },
        {
          id: "enroll-in-sequence",
          name: "Enroll in Follow-up Sequence",
          type: "condition",
          config: {
            expression: "{{steps.get-form-config.output[0].followUpSequenceId}}",
            trueBranch: ["enroll-contact"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.get-form-config.output[0].followUpSequenceId", operator: "ne", value: null }],
        },
        {
          id: "enroll-contact",
          name: "Enroll Contact in Sequence",
          type: "action",
          config: {
            actionType: "enrollInSequence",
            parameters: {
              contactId: "{{steps.create-or-update-contact.output.id}}",
              sequenceId: "{{steps.get-form-config.output[0].followUpSequenceId}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "landing-page-lead-capture",
    name: "Landing Page Lead Capture",
    description: "Process leads captured from landing pages",
    category: "marketing",
    tags: ["landing-pages", "leads", "capture"],
    workflow: {
      name: "Landing Page Lead Capture",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "landing_page.conversion" },
      },
      steps: [
        {
          id: "create-lead",
          name: "Create Lead Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "leads",
              data: {
                email: "{{trigger.data.email}}",
                firstName: "{{trigger.data.firstName}}",
                lastName: "{{trigger.data.lastName}}",
                source: "landing_page",
                sourceId: "{{trigger.data.landingPageId}}",
                utmSource: "{{trigger.data.utmSource}}",
                utmMedium: "{{trigger.data.utmMedium}}",
                utmCampaign: "{{trigger.data.utmCampaign}}",
              },
            },
          },
        },
        {
          id: "track-conversion",
          name: "Track Conversion",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "conversions",
              data: {
                landingPageId: "{{trigger.data.landingPageId}}",
                leadId: "{{steps.create-lead.output.id}}",
                conversionType: "lead_capture",
                metadata: "{{trigger.data}}",
              },
            },
          },
        },
        {
          id: "deliver-asset",
          name: "Deliver Gated Asset",
          type: "condition",
          config: {
            expression: "{{trigger.data.gatedAssetId}}",
            trueBranch: ["send-asset"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.gatedAssetId", operator: "ne", value: null }],
        },
        {
          id: "send-asset",
          name: "Send Gated Asset Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "gated-asset-delivery",
            data: { assetId: "{{trigger.data.gatedAssetId}}", lead: "{{steps.create-lead.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "event-registration-marketing",
    name: "Event Registration Marketing",
    description: "Marketing automation for event registrations",
    category: "marketing",
    tags: ["events", "registration", "marketing"],
    workflow: {
      name: "Event Registration Marketing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "registration.created" },
      },
      steps: [
        {
          id: "send-confirmation",
          name: "Send Registration Confirmation",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "event-registration-confirmation",
            data: { registration: "{{trigger.data}}" },
          },
        },
        {
          id: "add-to-calendar",
          name: "Send Calendar Invite",
          type: "action",
          config: {
            actionType: "sendCalendarInvite",
            parameters: {
              email: "{{trigger.data.email}}",
              event: "{{trigger.data.event}}",
            },
          },
        },
        {
          id: "enroll-reminder-sequence",
          name: "Enroll in Reminder Sequence",
          type: "action",
          config: {
            actionType: "enrollInSequence",
            parameters: {
              contactId: "{{trigger.data.contactId}}",
              sequenceId: "event-reminder-sequence",
              context: { eventId: "{{trigger.data.eventId}}", registrationId: "{{trigger.data.id}}" },
            },
          },
        },
        {
          id: "update-contact-tags",
          name: "Update Contact Tags",
          type: "action",
          config: {
            actionType: "addTags",
            parameters: {
              entityType: "contact",
              entityId: "{{trigger.data.contactId}}",
              tags: ["event-registrant", "{{trigger.data.event.type}}"],
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "marketing-attribution",
    name: "Marketing Attribution Tracking",
    description: "Track and attribute marketing touchpoints to conversions",
    category: "marketing",
    tags: ["attribution", "tracking", "analytics"],
    workflow: {
      name: "Marketing Attribution Tracking",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "deal.won" },
      },
      steps: [
        {
          id: "get-touchpoints",
          name: "Get Marketing Touchpoints",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "marketing_touchpoints",
              filters: { contactId: "{{trigger.data.contactId}}" },
              orderBy: { timestamp: "asc" },
            },
          },
        },
        {
          id: "calculate-attribution",
          name: "Calculate Attribution",
          type: "action",
          config: {
            actionType: "calculateAttribution",
            parameters: {
              touchpoints: "{{steps.get-touchpoints.output}}",
              dealAmount: "{{trigger.data.amount}}",
              model: "linear",
            },
          },
        },
        {
          id: "record-attribution",
          name: "Record Attribution Data",
          type: "loop",
          config: {
            collection: "{{steps.calculate-attribution.output.attributions}}",
            itemVariable: "attribution",
            steps: ["create-attribution-record"],
          },
        },
        {
          id: "create-attribution-record",
          name: "Create Attribution Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "attribution_records",
              data: {
                dealId: "{{trigger.data.id}}",
                touchpointId: "{{attribution.touchpointId}}",
                campaignId: "{{attribution.campaignId}}",
                channel: "{{attribution.channel}}",
                attributedAmount: "{{attribution.amount}}",
                attributionWeight: "{{attribution.weight}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "email-engagement-tracking",
    name: "Email Engagement Tracking",
    description: "Track and respond to email engagement events",
    category: "marketing",
    tags: ["email", "engagement", "tracking"],
    workflow: {
      name: "Email Engagement Tracking",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "email.opened" },
      },
      steps: [
        {
          id: "update-email-stats",
          name: "Update Email Stats",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "email_sends",
              id: "{{trigger.data.emailSendId}}",
              data: { openedAt: "{{now}}", openCount: "{{trigger.data.openCount + 1}}" },
            },
          },
        },
        {
          id: "update-contact-engagement",
          name: "Update Contact Engagement",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "contacts",
              id: "{{trigger.data.contactId}}",
              data: { lastEngagedAt: "{{now}}", engagementScore: "{{trigger.data.contact.engagementScore + 5}}" },
            },
          },
        },
        {
          id: "create-touchpoint",
          name: "Create Marketing Touchpoint",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "marketing_touchpoints",
              data: {
                contactId: "{{trigger.data.contactId}}",
                type: "email_open",
                campaignId: "{{trigger.data.campaignId}}",
                timestamp: "{{now}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "link-click-tracking",
    name: "Link Click Tracking",
    description: "Track and respond to email link clicks",
    category: "marketing",
    tags: ["email", "clicks", "tracking"],
    workflow: {
      name: "Link Click Tracking",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "email.link_clicked" },
      },
      steps: [
        {
          id: "record-click",
          name: "Record Link Click",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "email_clicks",
              data: {
                emailSendId: "{{trigger.data.emailSendId}}",
                contactId: "{{trigger.data.contactId}}",
                linkUrl: "{{trigger.data.linkUrl}}",
                clickedAt: "{{now}}",
              },
            },
          },
        },
        {
          id: "update-engagement",
          name: "Update Engagement Score",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "contacts",
              id: "{{trigger.data.contactId}}",
              data: { engagementScore: "{{trigger.data.contact.engagementScore + 10}}" },
            },
          },
        },
        {
          id: "check-high-intent",
          name: "Check High Intent Link",
          type: "condition",
          config: {
            expression: "{{trigger.data.linkTags}}",
            trueBranch: ["notify-sales"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.linkTags", operator: "contains", value: "high-intent" }],
        },
        {
          id: "notify-sales",
          name: "Notify Sales of High Intent",
          type: "notification",
          config: {
            channel: "slack",
            recipients: ["#sales-alerts"],
            template: "high-intent-click",
            data: { contact: "{{trigger.data.contact}}", link: "{{trigger.data.linkUrl}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "subscriber-lifecycle",
    name: "Subscriber Lifecycle Management",
    description: "Manage subscriber lifecycle stages and transitions",
    category: "marketing",
    tags: ["subscribers", "lifecycle", "management"],
    workflow: {
      name: "Subscriber Lifecycle Management",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "subscriber.created" },
      },
      steps: [
        {
          id: "send-welcome",
          name: "Send Welcome Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "subscriber-welcome",
            data: { subscriber: "{{trigger.data}}" },
          },
        },
        {
          id: "add-to-list",
          name: "Add to Default List",
          type: "action",
          config: {
            actionType: "addToList",
            parameters: {
              subscriberId: "{{trigger.data.id}}",
              listId: "{{trigger.data.defaultListId}}",
            },
          },
        },
        {
          id: "schedule-followup",
          name: "Schedule Follow-up",
          type: "delay",
          config: { duration: 3, unit: "days" },
        },
        {
          id: "send-followup",
          name: "Send Follow-up Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "subscriber-followup",
            data: { subscriber: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "unsubscribe-processing",
    name: "Unsubscribe Processing",
    description: "Process unsubscribe requests and update preferences",
    category: "marketing",
    tags: ["unsubscribe", "preferences", "compliance"],
    workflow: {
      name: "Unsubscribe Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "subscriber.unsubscribed" },
      },
      steps: [
        {
          id: "update-subscriber",
          name: "Update Subscriber Status",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "subscribers",
              id: "{{trigger.data.id}}",
              data: {
                status: "unsubscribed",
                unsubscribedAt: "{{now}}",
                unsubscribeReason: "{{trigger.data.reason}}",
              },
            },
          },
        },
        {
          id: "remove-from-sequences",
          name: "Remove from Active Sequences",
          type: "action",
          config: {
            actionType: "unenrollFromAllSequences",
            parameters: { contactId: "{{trigger.data.contactId}}" },
          },
        },
        {
          id: "log-compliance",
          name: "Log Compliance Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "compliance_logs",
              data: {
                type: "unsubscribe",
                entityType: "subscriber",
                entityId: "{{trigger.data.id}}",
                action: "email_opt_out",
                timestamp: "{{now}}",
              },
            },
          },
        },
        {
          id: "send-confirmation",
          name: "Send Unsubscribe Confirmation",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "unsubscribe-confirmation",
            data: { subscriber: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "content-personalization",
    name: "Content Personalization Engine",
    description: "Personalize content based on contact segments and behavior",
    category: "marketing",
    tags: ["personalization", "content", "segments"],
    workflow: {
      name: "Content Personalization Engine",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "content.personalization_requested" },
      },
      steps: [
        {
          id: "get-contact-segments",
          name: "Get Contact Segments",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "contact_segments",
              filters: { contactId: "{{trigger.data.contactId}}" },
            },
          },
        },
        {
          id: "get-behavior-data",
          name: "Get Behavior Data",
          type: "action",
          config: {
            actionType: "getContactBehavior",
            parameters: {
              contactId: "{{trigger.data.contactId}}",
              lookbackDays: 30,
            },
          },
        },
        {
          id: "select-content",
          name: "Select Personalized Content",
          type: "action",
          config: {
            actionType: "selectPersonalizedContent",
            parameters: {
              contentType: "{{trigger.data.contentType}}",
              segments: "{{steps.get-contact-segments.output}}",
              behavior: "{{steps.get-behavior-data.output}}",
            },
          },
        },
        {
          id: "return-content",
          name: "Return Personalized Content",
          type: "action",
          config: {
            actionType: "returnResult",
            parameters: { content: "{{steps.select-content.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "ab-test-automation",
    name: "A/B Test Automation",
    description: "Automate A/B testing for emails and landing pages",
    category: "marketing",
    tags: ["ab-testing", "optimization", "automation"],
    workflow: {
      name: "A/B Test Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "ab_test.started" },
      },
      steps: [
        {
          id: "split-audience",
          name: "Split Test Audience",
          type: "action",
          config: {
            actionType: "splitAudience",
            parameters: {
              audienceId: "{{trigger.data.audienceId}}",
              variants: "{{trigger.data.variants}}",
              splitRatio: "{{trigger.data.splitRatio}}",
            },
          },
        },
        {
          id: "deploy-variants",
          name: "Deploy Test Variants",
          type: "loop",
          config: {
            collection: "{{steps.split-audience.output.groups}}",
            itemVariable: "group",
            steps: ["deploy-variant"],
          },
        },
        {
          id: "deploy-variant",
          name: "Deploy Variant",
          type: "action",
          config: {
            actionType: "deployVariant",
            parameters: {
              testId: "{{trigger.data.id}}",
              variantId: "{{group.variantId}}",
              recipients: "{{group.recipients}}",
            },
          },
        },
        {
          id: "schedule-evaluation",
          name: "Schedule Test Evaluation",
          type: "delay",
          config: { duration: "{{trigger.data.testDurationHours}}", unit: "hours" },
        },
        {
          id: "evaluate-results",
          name: "Evaluate Test Results",
          type: "action",
          config: {
            actionType: "evaluateABTest",
            parameters: {
              testId: "{{trigger.data.id}}",
              metric: "{{trigger.data.primaryMetric}}",
              confidenceLevel: 0.95,
            },
          },
        },
        {
          id: "declare-winner",
          name: "Declare Winner",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "ab_tests",
              id: "{{trigger.data.id}}",
              data: {
                status: "completed",
                winnerId: "{{steps.evaluate-results.output.winnerId}}",
                results: "{{steps.evaluate-results.output}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
];
