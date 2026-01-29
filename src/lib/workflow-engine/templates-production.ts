/**
 * Production/Events Extended Workflow Templates
 * Implements 20 additional workflows for event production automation
 */

import type { WorkflowTemplate } from "./types";

export const productionExtendedTemplates: WorkflowTemplate[] = [
  {
    id: "event-registration-confirmation",
    name: "Event Registration Confirmation",
    description: "Send confirmation and tickets after registration",
    category: "production",
    tags: ["registration", "confirmation", "tickets"],
    workflow: {
      name: "Event Registration Confirmation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "registration.created" },
      },
      steps: [
        {
          id: "generate-confirmation",
          name: "Generate Confirmation Number",
          type: "action",
          config: {
            actionType: "generateConfirmationNumber",
            parameters: { registrationId: "{{trigger.data.id}}" },
          },
        },
        {
          id: "generate-tickets",
          name: "Generate Tickets",
          type: "action",
          config: {
            actionType: "generateTickets",
            parameters: {
              registrationId: "{{trigger.data.id}}",
              format: "pdf",
              includeQR: true,
            },
          },
        },
        {
          id: "send-confirmation",
          name: "Send Confirmation Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "registration-confirmation",
            data: {
              registration: "{{trigger.data}}",
              confirmationNumber: "{{steps.generate-confirmation.output}}",
              tickets: "{{steps.generate-tickets.output}}",
            },
          },
        },
        {
          id: "send-calendar",
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
          id: "update-capacity",
          name: "Update Event Capacity",
          type: "action",
          config: {
            actionType: "updateEventCapacity",
            parameters: {
              eventId: "{{trigger.data.eventId}}",
              ticketTypeId: "{{trigger.data.ticketTypeId}}",
              quantity: "{{trigger.data.quantity}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "waitlist-management",
    name: "Waitlist Management",
    description: "Manage event waitlists and notify when spots open",
    category: "production",
    tags: ["waitlist", "capacity", "notifications"],
    workflow: {
      name: "Waitlist Management",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "registration.cancelled" },
      },
      steps: [
        {
          id: "check-waitlist",
          name: "Check Waitlist",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "waitlist_entries",
              filters: {
                eventId: "{{trigger.data.eventId}}",
                ticketTypeId: "{{trigger.data.ticketTypeId}}",
                status: "waiting",
              },
              orderBy: { createdAt: "asc" },
              limit: 1,
            },
          },
        },
        {
          id: "check-has-waitlist",
          name: "Check if Waitlist Exists",
          type: "condition",
          config: {
            expression: "{{steps.check-waitlist.output.length}}",
            trueBranch: ["offer-spot"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.check-waitlist.output.length", operator: "gt", value: 0 }],
        },
        {
          id: "offer-spot",
          name: "Offer Spot to First in Waitlist",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "waitlist_entries",
              id: "{{steps.check-waitlist.output[0].id}}",
              data: { status: "offered", offeredAt: "{{now}}", expiresAt: "{{now + 24h}}" },
            },
          },
        },
        {
          id: "notify-waitlist",
          name: "Notify Waitlist Entry",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.check-waitlist.output[0].email}}"],
            template: "waitlist-spot-available",
            data: {
              entry: "{{steps.check-waitlist.output[0]}}",
              expiresAt: "{{now + 24h}}",
            },
          },
        },
        {
          id: "schedule-expiry",
          name: "Schedule Offer Expiry",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "waitlist-offer-expired",
              triggerAt: "{{now + 24h}}",
              context: { entryId: "{{steps.check-waitlist.output[0].id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "session-capacity-alert",
    name: "Session Capacity Alert",
    description: "Alert when sessions approach capacity",
    category: "production",
    tags: ["sessions", "capacity", "alerts"],
    workflow: {
      name: "Session Capacity Alert",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "session_registration.created" },
      },
      steps: [
        {
          id: "get-session",
          name: "Get Session Details",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "event_sessions",
              filters: { id: "{{trigger.data.sessionId}}" },
            },
          },
        },
        {
          id: "calculate-capacity",
          name: "Calculate Remaining Capacity",
          type: "action",
          config: {
            actionType: "calculateSessionCapacity",
            parameters: { sessionId: "{{trigger.data.sessionId}}" },
          },
        },
        {
          id: "check-threshold",
          name: "Check Capacity Threshold",
          type: "condition",
          config: {
            expression: "{{steps.calculate-capacity.output.percentFull}}",
            trueBranch: ["alert-organizer"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.calculate-capacity.output.percentFull", operator: "gte", value: 90 }],
        },
        {
          id: "alert-organizer",
          name: "Alert Event Organizer",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{steps.get-session.output[0].event.organizerId}}"],
            template: "session-near-capacity",
            data: {
              session: "{{steps.get-session.output[0]}}",
              capacity: "{{steps.calculate-capacity.output}}",
            },
          },
        },
      ],
    },
    variables: [
      { name: "capacityThreshold", type: "number", description: "Percentage threshold for alert", required: false, default: 90 },
    ],
  },
  {
    id: "speaker-confirmation-sequence",
    name: "Speaker Confirmation & Reminder Sequence",
    description: "Manage speaker confirmations and send reminders",
    category: "production",
    tags: ["speakers", "talent", "confirmations"],
    workflow: {
      name: "Speaker Confirmation & Reminder Sequence",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "session_talent.invited" },
      },
      steps: [
        {
          id: "send-invitation",
          name: "Send Speaker Invitation",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.talent.email}}"],
            template: "speaker-invitation",
            data: { invitation: "{{trigger.data}}" },
          },
        },
        {
          id: "schedule-reminder-1",
          name: "Schedule First Reminder",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "speaker-invitation-reminder",
              triggerAt: "{{now + 3d}}",
              context: { invitationId: "{{trigger.data.id}}" },
            },
          },
        },
        {
          id: "schedule-reminder-2",
          name: "Schedule Second Reminder",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "speaker-invitation-reminder",
              triggerAt: "{{now + 7d}}",
              context: { invitationId: "{{trigger.data.id}}", isUrgent: true },
            },
          },
        },
        {
          id: "create-task",
          name: "Create Follow-up Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "Follow up with {{trigger.data.talent.name}}",
                dueDate: "{{now + 5d}}",
                assigneeId: "{{trigger.data.session.event.organizerId}}",
                category: "speaker_management",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "sponsor-deliverable-tracking",
    name: "Sponsor Deliverable Tracking",
    description: "Track and remind sponsors about deliverables",
    category: "production",
    tags: ["sponsors", "deliverables", "tracking"],
    workflow: {
      name: "Sponsor Deliverable Tracking",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-overdue",
          name: "Find Overdue Deliverables",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "partner_deliverables",
              filters: {
                dueDate: { $lt: "{{now}}" },
                status: { $nin: ["received", "approved"] },
              },
              include: ["partner", "event"],
            },
          },
        },
        {
          id: "find-upcoming",
          name: "Find Upcoming Deliverables",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "partner_deliverables",
              filters: {
                dueDate: { $gte: "{{now}}", $lte: "{{now + 7d}}" },
                status: "pending",
              },
              include: ["partner", "event"],
            },
          },
        },
        {
          id: "send-overdue-reminders",
          name: "Send Overdue Reminders",
          type: "loop",
          config: {
            collection: "{{steps.find-overdue.output}}",
            itemVariable: "deliverable",
            steps: ["send-overdue-reminder"],
          },
        },
        {
          id: "send-overdue-reminder",
          name: "Send Overdue Reminder",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{deliverable.partner.contactEmail}}"],
            template: "deliverable-overdue",
            data: { deliverable: "{{deliverable}}" },
          },
        },
        {
          id: "send-upcoming-reminders",
          name: "Send Upcoming Reminders",
          type: "loop",
          config: {
            collection: "{{steps.find-upcoming.output}}",
            itemVariable: "deliverable",
            steps: ["send-upcoming-reminder"],
          },
        },
        {
          id: "send-upcoming-reminder",
          name: "Send Upcoming Reminder",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{deliverable.partner.contactEmail}}"],
            template: "deliverable-due-soon",
            data: { deliverable: "{{deliverable}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "exhibitor-onboarding",
    name: "Exhibitor Onboarding",
    description: "Onboard exhibitors with setup instructions",
    category: "production",
    tags: ["exhibitors", "onboarding", "setup"],
    workflow: {
      name: "Exhibitor Onboarding",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "exhibitor.confirmed" },
      },
      steps: [
        {
          id: "send-welcome",
          name: "Send Welcome Package",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.contactEmail}}"],
            template: "exhibitor-welcome",
            data: { exhibitor: "{{trigger.data}}" },
          },
        },
        {
          id: "create-portal-access",
          name: "Create Exhibitor Portal Access",
          type: "action",
          config: {
            actionType: "createExhibitorPortalAccess",
            parameters: {
              exhibitorId: "{{trigger.data.id}}",
              contactEmail: "{{trigger.data.contactEmail}}",
            },
          },
        },
        {
          id: "create-onboarding-tasks",
          name: "Create Onboarding Tasks",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "exhibitor-onboarding-checklist",
              data: { exhibitorId: "{{trigger.data.id}}" },
            },
          },
        },
        {
          id: "assign-booth",
          name: "Assign Booth Location",
          type: "action",
          config: {
            actionType: "assignBoothLocation",
            parameters: {
              exhibitorId: "{{trigger.data.id}}",
              eventId: "{{trigger.data.eventId}}",
              boothSize: "{{trigger.data.boothSize}}",
            },
          },
        },
        {
          id: "send-setup-instructions",
          name: "Send Setup Instructions",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.contactEmail}}"],
            template: "exhibitor-setup-instructions",
            data: {
              exhibitor: "{{trigger.data}}",
              booth: "{{steps.assign-booth.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "badge-generation",
    name: "Badge Generation",
    description: "Generate and queue badges for printing",
    category: "production",
    tags: ["badges", "credentials", "printing"],
    workflow: {
      name: "Badge Generation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "registration.checked_in" },
      },
      steps: [
        {
          id: "get-credential-type",
          name: "Get Credential Type",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "credential_types",
              filters: { id: "{{trigger.data.ticketType.credentialTypeId}}" },
            },
          },
        },
        {
          id: "generate-badge",
          name: "Generate Badge",
          type: "action",
          config: {
            actionType: "generateBadge",
            parameters: {
              registrationId: "{{trigger.data.id}}",
              templateId: "{{steps.get-credential-type.output[0].templateId}}",
              data: {
                name: "{{trigger.data.firstName}} {{trigger.data.lastName}}",
                company: "{{trigger.data.company}}",
                title: "{{trigger.data.title}}",
                ticketType: "{{trigger.data.ticketType.name}}",
              },
            },
          },
        },
        {
          id: "create-credential",
          name: "Create Issued Credential",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "issued_credentials",
              data: {
                credentialTypeId: "{{trigger.data.ticketType.credentialTypeId}}",
                sourceType: "registration",
                sourceId: "{{trigger.data.id}}",
                holderName: "{{trigger.data.firstName}} {{trigger.data.lastName}}",
                status: "active",
                issuedAt: "{{now}}",
              },
            },
          },
        },
        {
          id: "queue-for-print",
          name: "Queue for Printing",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "credential_print_queue",
              data: {
                credentialId: "{{steps.create-credential.output.id}}",
                printerId: "{{trigger.data.checkInLocation.printerId}}",
                status: "queued",
                priority: "{{trigger.data.ticketType.accessLevel > 5 ? 'high' : 'normal'}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "access-credential-issuance",
    name: "Access Credential Issuance",
    description: "Issue and manage access credentials",
    category: "production",
    tags: ["credentials", "access", "security"],
    workflow: {
      name: "Access Credential Issuance",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "credential_request.approved" },
      },
      steps: [
        {
          id: "get-credential-type",
          name: "Get Credential Type",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "credential_types",
              filters: { id: "{{trigger.data.credentialTypeId}}" },
            },
          },
        },
        {
          id: "generate-credential",
          name: "Generate Credential",
          type: "action",
          config: {
            actionType: "generateCredential",
            parameters: {
              request: "{{trigger.data}}",
              credentialType: "{{steps.get-credential-type.output[0]}}",
            },
          },
        },
        {
          id: "create-issued-credential",
          name: "Create Issued Credential Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "issued_credentials",
              data: {
                credentialTypeId: "{{trigger.data.credentialTypeId}}",
                sourceType: "{{trigger.data.sourceType}}",
                sourceId: "{{trigger.data.sourceId}}",
                holderName: "{{trigger.data.holderName}}",
                accessZones: "{{steps.get-credential-type.output[0].accessZones}}",
                validFrom: "{{trigger.data.validFrom}}",
                validUntil: "{{trigger.data.validUntil}}",
                status: "active",
              },
            },
          },
        },
        {
          id: "notify-holder",
          name: "Notify Credential Holder",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "credential-issued",
            data: {
              credential: "{{steps.create-issued-credential.output}}",
              accessInfo: "{{steps.get-credential-type.output[0]}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "event-feedback-collection",
    name: "Event Feedback Collection",
    description: "Collect feedback from attendees after event",
    category: "production",
    tags: ["feedback", "surveys", "attendees"],
    workflow: {
      name: "Event Feedback Collection",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "event.completed" },
      },
      steps: [
        {
          id: "get-attendees",
          name: "Get Event Attendees",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "registrations",
              filters: {
                eventId: "{{trigger.data.id}}",
                status: "checked_in",
              },
            },
          },
        },
        {
          id: "create-survey",
          name: "Create Feedback Survey",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "event-feedback-survey",
              data: { eventId: "{{trigger.data.id}}" },
            },
          },
        },
        {
          id: "send-surveys",
          name: "Send Survey Invitations",
          type: "loop",
          config: {
            collection: "{{steps.get-attendees.output}}",
            itemVariable: "attendee",
            steps: ["send-survey"],
          },
        },
        {
          id: "send-survey",
          name: "Send Survey Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{attendee.email}}"],
            template: "event-feedback-request",
            data: {
              event: "{{trigger.data}}",
              surveyUrl: "{{steps.create-survey.output.url}}",
            },
          },
        },
        {
          id: "schedule-reminder",
          name: "Schedule Survey Reminder",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "feedback-survey-reminder",
              triggerAt: "{{now + 3d}}",
              context: { eventId: "{{trigger.data.id}}", surveyId: "{{steps.create-survey.output.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "post-event-survey",
    name: "Post-Event Survey Processing",
    description: "Process and analyze post-event survey responses",
    category: "production",
    tags: ["surveys", "analysis", "feedback"],
    workflow: {
      name: "Post-Event Survey Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "survey.completed" },
      },
      steps: [
        {
          id: "store-response",
          name: "Store Survey Response",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "survey_responses",
              data: {
                surveyId: "{{trigger.data.surveyId}}",
                respondentId: "{{trigger.data.respondentId}}",
                responses: "{{trigger.data.responses}}",
                submittedAt: "{{now}}",
              },
            },
          },
        },
        {
          id: "calculate-scores",
          name: "Calculate Satisfaction Scores",
          type: "action",
          config: {
            actionType: "calculateSurveyScores",
            parameters: {
              surveyId: "{{trigger.data.surveyId}}",
              responses: "{{trigger.data.responses}}",
            },
          },
        },
        {
          id: "check-low-score",
          name: "Check for Low Scores",
          type: "condition",
          config: {
            expression: "{{steps.calculate-scores.output.overallScore}}",
            trueBranch: ["flag-for-review"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.calculate-scores.output.overallScore", operator: "lt", value: 3 }],
        },
        {
          id: "flag-for-review",
          name: "Flag for Review",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "feedback_flags",
              data: {
                responseId: "{{steps.store-response.output.id}}",
                reason: "low_satisfaction",
                score: "{{steps.calculate-scores.output.overallScore}}",
                status: "pending_review",
              },
            },
          },
        },
        {
          id: "update-event-metrics",
          name: "Update Event Metrics",
          type: "action",
          config: {
            actionType: "updateEventMetrics",
            parameters: {
              eventId: "{{trigger.data.eventId}}",
              metrics: "{{steps.calculate-scores.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "attendee-networking-match",
    name: "Attendee Networking Match",
    description: "Match attendees for networking based on interests",
    category: "production",
    tags: ["networking", "matching", "attendees"],
    workflow: {
      name: "Attendee Networking Match",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "networking_session.started" },
      },
      steps: [
        {
          id: "get-participants",
          name: "Get Session Participants",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "networking_participants",
              filters: {
                sessionId: "{{trigger.data.id}}",
                status: "checked_in",
              },
              include: ["registration", "profile"],
            },
          },
        },
        {
          id: "run-matching",
          name: "Run Matching Algorithm",
          type: "action",
          config: {
            actionType: "runNetworkingMatch",
            parameters: {
              participants: "{{steps.get-participants.output}}",
              criteria: "{{trigger.data.matchingCriteria}}",
              roundDuration: "{{trigger.data.roundDuration}}",
            },
          },
        },
        {
          id: "create-matches",
          name: "Create Match Records",
          type: "loop",
          config: {
            collection: "{{steps.run-matching.output.matches}}",
            itemVariable: "match",
            steps: ["create-match-record"],
          },
        },
        {
          id: "create-match-record",
          name: "Create Match Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "networking_matches",
              data: {
                sessionId: "{{trigger.data.id}}",
                participant1Id: "{{match.participant1Id}}",
                participant2Id: "{{match.participant2Id}}",
                tableNumber: "{{match.tableNumber}}",
                round: "{{match.round}}",
              },
            },
          },
        },
        {
          id: "notify-participants",
          name: "Notify Participants",
          type: "loop",
          config: {
            collection: "{{steps.get-participants.output}}",
            itemVariable: "participant",
            steps: ["send-match-notification"],
          },
        },
        {
          id: "send-match-notification",
          name: "Send Match Notification",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{participant.registration.userId}}"],
            template: "networking-match",
            data: { session: "{{trigger.data}}", matches: "{{steps.run-matching.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "session-recording-processing",
    name: "Session Recording Processing",
    description: "Process and distribute session recordings",
    category: "production",
    tags: ["recordings", "sessions", "content"],
    workflow: {
      name: "Session Recording Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "session.ended" },
      },
      steps: [
        {
          id: "check-recording",
          name: "Check if Recorded",
          type: "condition",
          config: {
            expression: "{{trigger.data.wasRecorded}}",
            trueBranch: ["process-recording"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.wasRecorded", operator: "eq", value: true }],
        },
        {
          id: "process-recording",
          name: "Process Recording",
          type: "action",
          config: {
            actionType: "processSessionRecording",
            parameters: {
              sessionId: "{{trigger.data.id}}",
              recordingUrl: "{{trigger.data.recordingUrl}}",
              generateTranscript: true,
            },
          },
        },
        {
          id: "create-content-record",
          name: "Create Content Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "session_content",
              data: {
                sessionId: "{{trigger.data.id}}",
                recordingUrl: "{{steps.process-recording.output.processedUrl}}",
                transcriptUrl: "{{steps.process-recording.output.transcriptUrl}}",
                duration: "{{steps.process-recording.output.duration}}",
                status: "available",
              },
            },
          },
        },
        {
          id: "notify-attendees",
          name: "Notify Session Attendees",
          type: "action",
          config: {
            actionType: "notifySessionAttendees",
            parameters: {
              sessionId: "{{trigger.data.id}}",
              template: "session-recording-available",
              data: { content: "{{steps.create-content-record.output}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "event-roi-calculation",
    name: "Event ROI Calculation",
    description: "Calculate and report event ROI",
    category: "production",
    tags: ["roi", "analytics", "reporting"],
    workflow: {
      name: "Event ROI Calculation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "event.closed" },
      },
      steps: [
        {
          id: "gather-revenue",
          name: "Gather Revenue Data",
          type: "action",
          config: {
            actionType: "calculateEventRevenue",
            parameters: {
              eventId: "{{trigger.data.id}}",
              sources: ["tickets", "sponsorships", "exhibitors", "merchandise"],
            },
          },
        },
        {
          id: "gather-costs",
          name: "Gather Cost Data",
          type: "action",
          config: {
            actionType: "calculateEventCosts",
            parameters: {
              eventId: "{{trigger.data.id}}",
              categories: ["venue", "production", "marketing", "staff", "catering", "technology"],
            },
          },
        },
        {
          id: "calculate-roi",
          name: "Calculate ROI",
          type: "action",
          config: {
            actionType: "calculateROI",
            parameters: {
              revenue: "{{steps.gather-revenue.output}}",
              costs: "{{steps.gather-costs.output}}",
            },
          },
        },
        {
          id: "create-report",
          name: "Create ROI Report",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "event_reports",
              data: {
                eventId: "{{trigger.data.id}}",
                type: "roi",
                revenue: "{{steps.gather-revenue.output}}",
                costs: "{{steps.gather-costs.output}}",
                roi: "{{steps.calculate-roi.output}}",
                generatedAt: "{{now}}",
              },
            },
          },
        },
        {
          id: "notify-stakeholders",
          name: "Notify Stakeholders",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{trigger.data.stakeholderIds}}",
            template: "event-roi-report",
            data: { event: "{{trigger.data}}", report: "{{steps.create-report.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "emergency-protocol-activation",
    name: "Emergency Protocol Activation",
    description: "Activate emergency protocols and notifications",
    category: "production",
    tags: ["emergency", "safety", "protocols"],
    workflow: {
      name: "Emergency Protocol Activation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "emergency.declared" },
      },
      steps: [
        {
          id: "get-protocol",
          name: "Get Emergency Protocol",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "emergency_protocols",
              filters: { type: "{{trigger.data.emergencyType}}", eventId: "{{trigger.data.eventId}}" },
            },
          },
        },
        {
          id: "notify-security",
          name: "Notify Security Team",
          type: "notification",
          config: {
            channel: "sms",
            recipients: "{{trigger.data.event.securityTeamPhones}}",
            template: "emergency-alert-security",
            data: { emergency: "{{trigger.data}}", protocol: "{{steps.get-protocol.output[0]}}" },
          },
        },
        {
          id: "notify-staff",
          name: "Notify All Staff",
          type: "notification",
          config: {
            channel: "push",
            recipients: "{{trigger.data.event.staffIds}}",
            template: "emergency-alert-staff",
            data: { emergency: "{{trigger.data}}" },
          },
        },
        {
          id: "broadcast-attendees",
          name: "Broadcast to Attendees",
          type: "action",
          config: {
            actionType: "broadcastEmergencyAlert",
            parameters: {
              eventId: "{{trigger.data.eventId}}",
              message: "{{steps.get-protocol.output[0].attendeeMessage}}",
              channels: ["app_push", "sms"],
            },
          },
        },
        {
          id: "create-incident",
          name: "Create Incident Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "incidents",
              data: {
                eventId: "{{trigger.data.eventId}}",
                type: "{{trigger.data.emergencyType}}",
                severity: "critical",
                status: "active",
                reportedAt: "{{now}}",
                description: "{{trigger.data.description}}",
              },
            },
          },
        },
        {
          id: "notify-authorities",
          name: "Notify Authorities if Required",
          type: "condition",
          config: {
            expression: "{{steps.get-protocol.output[0].notifyAuthorities}}",
            trueBranch: ["contact-authorities"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.get-protocol.output[0].notifyAuthorities", operator: "eq", value: true }],
        },
        {
          id: "contact-authorities",
          name: "Contact Emergency Services",
          type: "action",
          config: {
            actionType: "contactEmergencyServices",
            parameters: {
              eventId: "{{trigger.data.eventId}}",
              emergencyType: "{{trigger.data.emergencyType}}",
              location: "{{trigger.data.event.venue}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "venue-setup-checklist",
    name: "Venue Setup Checklist",
    description: "Manage venue setup tasks and verification",
    category: "production",
    tags: ["venue", "setup", "checklist"],
    workflow: {
      name: "Venue Setup Checklist",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "event.setup_started" },
      },
      steps: [
        {
          id: "get-setup-template",
          name: "Get Setup Template",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "setup_templates",
              filters: { venueId: "{{trigger.data.venueId}}", eventType: "{{trigger.data.eventType}}" },
              include: ["tasks"],
            },
          },
        },
        {
          id: "create-checklist",
          name: "Create Setup Checklist",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "{{steps.get-setup-template.output[0].id}}",
              data: { eventId: "{{trigger.data.id}}" },
            },
          },
        },
        {
          id: "assign-tasks",
          name: "Assign Setup Tasks",
          type: "loop",
          config: {
            collection: "{{steps.create-checklist.output.tasks}}",
            itemVariable: "task",
            steps: ["assign-task"],
          },
        },
        {
          id: "assign-task",
          name: "Assign Task to Team",
          type: "action",
          config: {
            actionType: "assignTaskToTeam",
            parameters: {
              taskId: "{{task.id}}",
              teamId: "{{task.defaultTeamId}}",
            },
          },
        },
        {
          id: "notify-production",
          name: "Notify Production Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.productionManagerId}}"],
            template: "venue-setup-started",
            data: { event: "{{trigger.data}}", checklist: "{{steps.create-checklist.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "catering-order-management",
    name: "Catering Order Management",
    description: "Manage catering orders and dietary requirements",
    category: "production",
    tags: ["catering", "hospitality", "orders"],
    workflow: {
      name: "Catering Order Management",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-upcoming-events",
          name: "Find Events Needing Catering",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "events",
              filters: {
                startDate: { $gte: "{{now}}", $lte: "{{now + 7d}}" },
                cateringRequired: true,
                cateringOrderStatus: { $nin: ["confirmed", "delivered"] },
              },
            },
          },
        },
        {
          id: "process-events",
          name: "Process Each Event",
          type: "loop",
          config: {
            collection: "{{steps.find-upcoming-events.output}}",
            itemVariable: "event",
            steps: ["compile-requirements", "send-order"],
          },
        },
        {
          id: "compile-requirements",
          name: "Compile Dietary Requirements",
          type: "action",
          config: {
            actionType: "compileDietaryRequirements",
            parameters: { eventId: "{{event.id}}" },
          },
        },
        {
          id: "send-order",
          name: "Send Catering Order",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{event.cateringVendor.email}}"],
            template: "catering-order",
            data: {
              event: "{{event}}",
              headcount: "{{steps.compile-requirements.output.totalCount}}",
              dietaryBreakdown: "{{steps.compile-requirements.output.breakdown}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "av-equipment-coordination",
    name: "AV Equipment Coordination",
    description: "Coordinate AV equipment needs for sessions",
    category: "production",
    tags: ["av", "equipment", "technical"],
    workflow: {
      name: "AV Equipment Coordination",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "session.tech_requirements_submitted" },
      },
      steps: [
        {
          id: "check-inventory",
          name: "Check Equipment Inventory",
          type: "action",
          config: {
            actionType: "checkEquipmentAvailability",
            parameters: {
              requirements: "{{trigger.data.requirements}}",
              eventId: "{{trigger.data.eventId}}",
              sessionTime: "{{trigger.data.startTime}}",
            },
          },
        },
        {
          id: "check-available",
          name: "Check if All Available",
          type: "condition",
          config: {
            expression: "{{steps.check-inventory.output.allAvailable}}",
            trueBranch: ["reserve-equipment"],
            falseBranch: ["flag-shortage"],
          },
          conditions: [{ field: "steps.check-inventory.output.allAvailable", operator: "eq", value: true }],
        },
        {
          id: "reserve-equipment",
          name: "Reserve Equipment",
          type: "action",
          config: {
            actionType: "reserveEquipment",
            parameters: {
              sessionId: "{{trigger.data.id}}",
              equipment: "{{trigger.data.requirements}}",
            },
          },
        },
        {
          id: "flag-shortage",
          name: "Flag Equipment Shortage",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "equipment_shortages",
              data: {
                sessionId: "{{trigger.data.id}}",
                missingItems: "{{steps.check-inventory.output.unavailable}}",
                status: "pending",
              },
            },
          },
        },
        {
          id: "notify-av-team",
          name: "Notify AV Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.event.avManagerId}}"],
            template: "av-requirements-submitted",
            data: {
              session: "{{trigger.data}}",
              availability: "{{steps.check-inventory.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "transportation-coordination",
    name: "Transportation Coordination",
    description: "Coordinate transportation for VIPs and talent",
    category: "production",
    tags: ["transportation", "logistics", "vip"],
    workflow: {
      name: "Transportation Coordination",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "transport_request.created" },
      },
      steps: [
        {
          id: "check-fleet",
          name: "Check Fleet Availability",
          type: "action",
          config: {
            actionType: "checkFleetAvailability",
            parameters: {
              vehicleType: "{{trigger.data.vehicleType}}",
              pickupTime: "{{trigger.data.pickupTime}}",
              passengers: "{{trigger.data.passengerCount}}",
            },
          },
        },
        {
          id: "assign-vehicle",
          name: "Assign Vehicle",
          type: "action",
          config: {
            actionType: "assignVehicle",
            parameters: {
              requestId: "{{trigger.data.id}}",
              vehicleId: "{{steps.check-fleet.output.recommendedVehicleId}}",
            },
          },
        },
        {
          id: "assign-driver",
          name: "Assign Driver",
          type: "action",
          config: {
            actionType: "assignDriver",
            parameters: {
              requestId: "{{trigger.data.id}}",
              vehicleId: "{{steps.assign-vehicle.output.vehicleId}}",
            },
          },
        },
        {
          id: "notify-passenger",
          name: "Notify Passenger",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.passengerEmail}}"],
            template: "transport-confirmed",
            data: {
              request: "{{trigger.data}}",
              vehicle: "{{steps.assign-vehicle.output}}",
              driver: "{{steps.assign-driver.output}}",
            },
          },
        },
        {
          id: "notify-driver",
          name: "Notify Driver",
          type: "notification",
          config: {
            channel: "sms",
            recipients: ["{{steps.assign-driver.output.driverPhone}}"],
            template: "transport-assignment",
            data: { request: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "event-day-briefing",
    name: "Event Day Briefing",
    description: "Generate and distribute event day briefings",
    category: "production",
    tags: ["briefing", "event-day", "communication"],
    workflow: {
      name: "Event Day Briefing",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 5 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-today-events",
          name: "Find Today's Events",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "events",
              filters: {
                startDate: { $gte: "{{startOfDay(now)}}", $lt: "{{endOfDay(now)}}" },
                status: "confirmed",
              },
              include: ["venue", "sessions", "staff"],
            },
          },
        },
        {
          id: "generate-briefings",
          name: "Generate Briefings",
          type: "loop",
          config: {
            collection: "{{steps.find-today-events.output}}",
            itemVariable: "event",
            steps: ["generate-briefing", "distribute-briefing"],
          },
        },
        {
          id: "generate-briefing",
          name: "Generate Event Briefing",
          type: "action",
          config: {
            actionType: "generateEventBriefing",
            parameters: {
              eventId: "{{event.id}}",
              sections: ["schedule", "contacts", "logistics", "notes", "weather"],
            },
          },
        },
        {
          id: "distribute-briefing",
          name: "Distribute Briefing",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{event.staff.map(s => s.email)}}",
            template: "event-day-briefing",
            data: { event: "{{event}}", briefing: "{{steps.generate-briefing.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
];
