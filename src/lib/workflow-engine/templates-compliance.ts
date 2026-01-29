/**
 * Compliance/Governance Workflow Templates
 * Implements 10 workflows for compliance and governance automation
 */

import type { WorkflowTemplate } from "./types";

export const complianceTemplates: WorkflowTemplate[] = [
  {
    id: "policy-acknowledgment",
    name: "Policy Acknowledgment",
    description: "Track and enforce policy acknowledgments",
    category: "compliance",
    tags: ["policies", "acknowledgment", "compliance"],
    workflow: {
      name: "Policy Acknowledgment",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "policy.published" },
      },
      steps: [
        {
          id: "get-affected-users",
          name: "Get Affected Users",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "employees",
              filters: {
                status: "active",
                departments: { $in: "{{trigger.data.applicableDepartments}}" },
              },
            },
          },
        },
        {
          id: "create-acknowledgments",
          name: "Create Acknowledgment Records",
          type: "loop",
          config: {
            collection: "{{steps.get-affected-users.output}}",
            itemVariable: "user",
            steps: ["create-acknowledgment"],
          },
        },
        {
          id: "create-acknowledgment",
          name: "Create Acknowledgment Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "policy_acknowledgments",
              data: {
                policyId: "{{trigger.data.id}}",
                userId: "{{user.id}}",
                status: "pending",
                dueDate: "{{trigger.data.acknowledgmentDeadline}}",
              },
            },
          },
        },
        {
          id: "notify-users",
          name: "Notify Users",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{steps.get-affected-users.output.map(u => u.email)}}",
            template: "policy-acknowledgment-required",
            data: { policy: "{{trigger.data}}" },
          },
        },
        {
          id: "schedule-reminder",
          name: "Schedule Reminder",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "policy-acknowledgment-reminder",
              triggerAt: "{{trigger.data.acknowledgmentDeadline - 3d}}",
              context: { policyId: "{{trigger.data.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "audit-trail-logging",
    name: "Audit Trail Logging",
    description: "Log all auditable actions for compliance",
    category: "compliance",
    tags: ["audit", "logging", "trail"],
    workflow: {
      name: "Audit Trail Logging",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "auditable_action.performed" },
      },
      steps: [
        {
          id: "enrich-context",
          name: "Enrich Audit Context",
          type: "action",
          config: {
            actionType: "enrichAuditContext",
            parameters: {
              action: "{{trigger.data}}",
              includeUserDetails: true,
              includeEntitySnapshot: true,
            },
          },
        },
        {
          id: "create-audit-log",
          name: "Create Audit Log Entry",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "audit_logs",
              data: {
                action: "{{trigger.data.action}}",
                entityType: "{{trigger.data.entityType}}",
                entityId: "{{trigger.data.entityId}}",
                userId: "{{trigger.data.userId}}",
                userEmail: "{{steps.enrich-context.output.userEmail}}",
                ipAddress: "{{trigger.data.ipAddress}}",
                userAgent: "{{trigger.data.userAgent}}",
                previousState: "{{steps.enrich-context.output.previousState}}",
                newState: "{{steps.enrich-context.output.newState}}",
                metadata: "{{trigger.data.metadata}}",
                timestamp: "{{now}}",
              },
            },
          },
        },
        {
          id: "check-sensitive",
          name: "Check if Sensitive Action",
          type: "condition",
          config: {
            expression: "{{trigger.data.sensitivityLevel}}",
            trueBranch: ["alert-compliance"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.sensitivityLevel", operator: "eq", value: "high" }],
        },
        {
          id: "alert-compliance",
          name: "Alert Compliance Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["compliance@company.com"],
            template: "sensitive-action-alert",
            data: { auditLog: "{{steps.create-audit-log.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "data-retention-enforcement",
    name: "Data Retention Enforcement",
    description: "Enforce data retention policies automatically",
    category: "compliance",
    tags: ["retention", "data", "gdpr"],
    workflow: {
      name: "Data Retention Enforcement",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 2 * * 0", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-retention-policies",
          name: "Get Active Retention Policies",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "retention_policies",
              filters: { isActive: true },
            },
          },
        },
        {
          id: "process-policies",
          name: "Process Each Policy",
          type: "loop",
          config: {
            collection: "{{steps.get-retention-policies.output}}",
            itemVariable: "policy",
            steps: ["find-expired-data", "archive-or-delete"],
          },
        },
        {
          id: "find-expired-data",
          name: "Find Expired Data",
          type: "action",
          config: {
            actionType: "findExpiredData",
            parameters: {
              entityType: "{{policy.entityType}}",
              retentionDays: "{{policy.retentionDays}}",
              dateField: "{{policy.dateField}}",
            },
          },
        },
        {
          id: "archive-or-delete",
          name: "Archive or Delete Data",
          type: "action",
          config: {
            actionType: "enforceRetention",
            parameters: {
              records: "{{steps.find-expired-data.output}}",
              action: "{{policy.action}}",
              archiveLocation: "{{policy.archiveLocation}}",
            },
          },
        },
        {
          id: "create-report",
          name: "Create Retention Report",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "retention_reports",
              data: {
                executedAt: "{{now}}",
                policiesProcessed: "{{steps.get-retention-policies.output.length}}",
                recordsProcessed: "{{sum(steps.process-policies.output.map(p => p.recordCount))}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "gdpr-data-request",
    name: "GDPR Data Request Processing",
    description: "Process GDPR data subject requests",
    category: "compliance",
    tags: ["gdpr", "privacy", "data-request"],
    workflow: {
      name: "GDPR Data Request Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "data_request.submitted" },
      },
      steps: [
        {
          id: "verify-identity",
          name: "Verify Requester Identity",
          type: "action",
          config: {
            actionType: "verifyDataSubjectIdentity",
            parameters: {
              requestId: "{{trigger.data.id}}",
              email: "{{trigger.data.email}}",
              verificationMethod: "{{trigger.data.verificationType}}",
            },
          },
        },
        {
          id: "check-verified",
          name: "Check if Verified",
          type: "condition",
          config: {
            expression: "{{steps.verify-identity.output.verified}}",
            trueBranch: ["process-request"],
            falseBranch: ["request-verification"],
          },
          conditions: [{ field: "steps.verify-identity.output.verified", operator: "eq", value: true }],
        },
        {
          id: "request-verification",
          name: "Request Additional Verification",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "data-request-verification-needed",
            data: { request: "{{trigger.data}}" },
          },
        },
        {
          id: "process-request",
          name: "Process Data Request",
          type: "action",
          config: {
            actionType: "processDataSubjectRequest",
            parameters: {
              requestId: "{{trigger.data.id}}",
              requestType: "{{trigger.data.type}}",
              dataSubjectId: "{{trigger.data.dataSubjectId}}",
            },
          },
        },
        {
          id: "create-task",
          name: "Create Compliance Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "Review GDPR {{trigger.data.type}} request",
                description: "Request ID: {{trigger.data.id}}",
                dueDate: "{{now + 30d}}",
                assigneeId: "{{org.dpoId}}",
                category: "compliance",
                priority: "high",
              },
            },
          },
        },
        {
          id: "notify-dpo",
          name: "Notify Data Protection Officer",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{org.dpoId}}"],
            template: "gdpr-request-received",
            data: { request: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "compliance-certification-tracking",
    name: "Compliance Certification Tracking",
    description: "Track and manage compliance certifications",
    category: "compliance",
    tags: ["certifications", "tracking", "compliance"],
    workflow: {
      name: "Compliance Certification Tracking",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-expiring",
          name: "Find Expiring Certifications",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "compliance_certifications",
              filters: {
                expirationDate: { $lte: "{{now + 90d}}", $gte: "{{now}}" },
                status: "active",
              },
            },
          },
        },
        {
          id: "categorize-urgency",
          name: "Categorize by Urgency",
          type: "transform",
          config: {
            input: "{{steps.find-expiring.output}}",
            output: "categorized",
            transformation: "categorizeByDaysUntil(expirationDate, [30, 60, 90])",
          },
        },
        {
          id: "process-urgent",
          name: "Process Urgent Certifications",
          type: "loop",
          config: {
            collection: "{{categorized.urgent}}",
            itemVariable: "cert",
            steps: ["create-renewal-task", "notify-owner"],
          },
        },
        {
          id: "create-renewal-task",
          name: "Create Renewal Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "Renew certification: {{cert.name}}",
                description: "Expires: {{cert.expirationDate}}",
                dueDate: "{{cert.expirationDate - 14d}}",
                assigneeId: "{{cert.ownerId}}",
                priority: "high",
                category: "compliance",
              },
            },
          },
        },
        {
          id: "notify-owner",
          name: "Notify Certification Owner",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{cert.ownerId}}"],
            template: "certification-expiring",
            data: { certification: "{{cert}}" },
          },
        },
        {
          id: "generate-report",
          name: "Generate Compliance Report",
          type: "action",
          config: {
            actionType: "generateComplianceCertReport",
            parameters: { certifications: "{{steps.find-expiring.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "regulatory-change-monitoring",
    name: "Regulatory Change Monitoring",
    description: "Monitor and respond to regulatory changes",
    category: "compliance",
    tags: ["regulatory", "monitoring", "changes"],
    workflow: {
      name: "Regulatory Change Monitoring",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "regulatory_update.detected" },
      },
      steps: [
        {
          id: "analyze-impact",
          name: "Analyze Regulatory Impact",
          type: "action",
          config: {
            actionType: "analyzeRegulatoryImpact",
            parameters: {
              update: "{{trigger.data}}",
              affectedAreas: "{{trigger.data.categories}}",
            },
          },
        },
        {
          id: "create-assessment",
          name: "Create Impact Assessment",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "regulatory_assessments",
              data: {
                updateId: "{{trigger.data.id}}",
                regulation: "{{trigger.data.regulation}}",
                effectiveDate: "{{trigger.data.effectiveDate}}",
                impactLevel: "{{steps.analyze-impact.output.impactLevel}}",
                affectedPolicies: "{{steps.analyze-impact.output.affectedPolicies}}",
                status: "pending_review",
              },
            },
          },
        },
        {
          id: "notify-compliance",
          name: "Notify Compliance Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["compliance@company.com"],
            template: "regulatory-change-alert",
            data: {
              update: "{{trigger.data}}",
              assessment: "{{steps.create-assessment.output}}",
            },
          },
        },
        {
          id: "create-review-task",
          name: "Create Review Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "Review regulatory change: {{trigger.data.regulation}}",
                description: "Effective date: {{trigger.data.effectiveDate}}",
                dueDate: "{{trigger.data.effectiveDate - 30d}}",
                assigneeId: "{{org.complianceOfficerId}}",
                priority: "{{steps.analyze-impact.output.impactLevel === 'high' ? 'urgent' : 'high'}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "internal-audit-workflow",
    name: "Internal Audit Workflow",
    description: "Manage internal audit processes",
    category: "compliance",
    tags: ["audit", "internal", "review"],
    workflow: {
      name: "Internal Audit Workflow",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "internal_audit.scheduled" },
      },
      steps: [
        {
          id: "create-audit-record",
          name: "Create Audit Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "internal_audits",
              data: {
                name: "{{trigger.data.name}}",
                scope: "{{trigger.data.scope}}",
                auditType: "{{trigger.data.auditType}}",
                scheduledDate: "{{trigger.data.scheduledDate}}",
                leadAuditorId: "{{trigger.data.leadAuditorId}}",
                status: "scheduled",
              },
            },
          },
        },
        {
          id: "create-checklist",
          name: "Create Audit Checklist",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "audit-checklist-{{trigger.data.auditType}}",
              data: { auditId: "{{steps.create-audit-record.output.id}}" },
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
            template: "internal-audit-scheduled",
            data: { audit: "{{steps.create-audit-record.output}}" },
          },
        },
        {
          id: "schedule-kickoff",
          name: "Schedule Kickoff Meeting",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "calendar_events",
              data: {
                title: "Audit Kickoff: {{trigger.data.name}}",
                type: "meeting",
                scheduledFor: "{{trigger.data.scheduledDate - 7d}}",
                attendees: "{{trigger.data.stakeholderIds.concat([trigger.data.leadAuditorId])}}",
              },
            },
          },
        },
        {
          id: "request-documents",
          name: "Request Required Documents",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{trigger.data.stakeholderIds}}",
            template: "audit-document-request",
            data: {
              audit: "{{steps.create-audit-record.output}}",
              requiredDocs: "{{trigger.data.requiredDocuments}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "risk-assessment-workflow",
    name: "Risk Assessment Workflow",
    description: "Conduct and track risk assessments",
    category: "compliance",
    tags: ["risk", "assessment", "governance"],
    workflow: {
      name: "Risk Assessment Workflow",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "risk_assessment.initiated" },
      },
      steps: [
        {
          id: "create-assessment",
          name: "Create Assessment Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "risk_assessments",
              data: {
                name: "{{trigger.data.name}}",
                scope: "{{trigger.data.scope}}",
                assessmentType: "{{trigger.data.type}}",
                initiatedBy: "{{trigger.data.initiatorId}}",
                dueDate: "{{trigger.data.dueDate}}",
                status: "in_progress",
              },
            },
          },
        },
        {
          id: "get-risk-categories",
          name: "Get Risk Categories",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "risk_categories",
              filters: { scope: { $in: "{{trigger.data.scope}}" } },
            },
          },
        },
        {
          id: "create-risk-items",
          name: "Create Risk Assessment Items",
          type: "loop",
          config: {
            collection: "{{steps.get-risk-categories.output}}",
            itemVariable: "category",
            steps: ["create-risk-item"],
          },
        },
        {
          id: "create-risk-item",
          name: "Create Risk Item",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "risk_assessment_items",
              data: {
                assessmentId: "{{steps.create-assessment.output.id}}",
                categoryId: "{{category.id}}",
                status: "pending",
              },
            },
          },
        },
        {
          id: "assign-reviewers",
          name: "Assign Category Reviewers",
          type: "action",
          config: {
            actionType: "assignRiskReviewers",
            parameters: {
              assessmentId: "{{steps.create-assessment.output.id}}",
              categories: "{{steps.get-risk-categories.output}}",
            },
          },
        },
        {
          id: "notify-reviewers",
          name: "Notify Reviewers",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{steps.assign-reviewers.output.reviewerIds}}",
            template: "risk-assessment-assigned",
            data: { assessment: "{{steps.create-assessment.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "incident-response-workflow",
    name: "Incident Response Workflow",
    description: "Manage compliance incident response",
    category: "compliance",
    tags: ["incident", "response", "breach"],
    workflow: {
      name: "Incident Response Workflow",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "compliance_incident.reported" },
      },
      steps: [
        {
          id: "create-incident",
          name: "Create Incident Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "compliance_incidents",
              data: {
                title: "{{trigger.data.title}}",
                description: "{{trigger.data.description}}",
                severity: "{{trigger.data.severity}}",
                category: "{{trigger.data.category}}",
                reportedBy: "{{trigger.data.reporterId}}",
                reportedAt: "{{now}}",
                status: "open",
              },
            },
          },
        },
        {
          id: "assess-severity",
          name: "Assess Incident Severity",
          type: "action",
          config: {
            actionType: "assessIncidentSeverity",
            parameters: {
              incident: "{{steps.create-incident.output}}",
              factors: ["data_exposure", "regulatory_impact", "financial_impact", "reputational_impact"],
            },
          },
        },
        {
          id: "assign-responders",
          name: "Assign Response Team",
          type: "action",
          config: {
            actionType: "assignIncidentResponseTeam",
            parameters: {
              incidentId: "{{steps.create-incident.output.id}}",
              severity: "{{steps.assess-severity.output.severity}}",
              category: "{{trigger.data.category}}",
            },
          },
        },
        {
          id: "notify-team",
          name: "Notify Response Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{steps.assign-responders.output.teamMemberIds}}",
            template: "incident-response-assigned",
            data: {
              incident: "{{steps.create-incident.output}}",
              severity: "{{steps.assess-severity.output}}",
            },
          },
        },
        {
          id: "check-breach",
          name: "Check if Data Breach",
          type: "condition",
          config: {
            expression: "{{trigger.data.category}}",
            trueBranch: ["initiate-breach-protocol"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.category", operator: "eq", value: "data_breach" }],
        },
        {
          id: "initiate-breach-protocol",
          name: "Initiate Breach Protocol",
          type: "action",
          config: {
            actionType: "initiateBreachProtocol",
            parameters: {
              incidentId: "{{steps.create-incident.output.id}}",
              notifyAuthorities: "{{steps.assess-severity.output.requiresNotification}}",
            },
          },
        },
        {
          id: "create-timeline",
          name: "Create Response Timeline",
          type: "action",
          config: {
            actionType: "createIncidentTimeline",
            parameters: {
              incidentId: "{{steps.create-incident.output.id}}",
              severity: "{{steps.assess-severity.output.severity}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "vendor-compliance-review",
    name: "Vendor Compliance Review",
    description: "Review vendor compliance status periodically",
    category: "compliance",
    tags: ["vendors", "compliance", "review"],
    workflow: {
      name: "Vendor Compliance Review",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 1 */6 *", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-vendors",
          name: "Get Active Vendors",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendors",
              filters: { status: "approved", isActive: true },
              include: ["complianceDocuments", "certifications"],
            },
          },
        },
        {
          id: "review-vendors",
          name: "Review Each Vendor",
          type: "loop",
          config: {
            collection: "{{steps.get-vendors.output}}",
            itemVariable: "vendor",
            steps: ["check-compliance", "update-status"],
          },
        },
        {
          id: "check-compliance",
          name: "Check Vendor Compliance",
          type: "action",
          config: {
            actionType: "checkVendorCompliance",
            parameters: {
              vendorId: "{{vendor.id}}",
              requirements: ["insurance", "certifications", "contracts", "background_checks"],
            },
          },
        },
        {
          id: "update-status",
          name: "Update Compliance Status",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "vendors",
              id: "{{vendor.id}}",
              data: {
                complianceStatus: "{{steps.check-compliance.output.status}}",
                complianceScore: "{{steps.check-compliance.output.score}}",
                lastComplianceReview: "{{now}}",
              },
            },
          },
        },
        {
          id: "find-non-compliant",
          name: "Find Non-Compliant Vendors",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendors",
              filters: {
                isActive: true,
                complianceStatus: { $in: ["non_compliant", "at_risk"] },
              },
            },
          },
        },
        {
          id: "notify-procurement",
          name: "Notify Procurement Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["procurement@company.com", "compliance@company.com"],
            template: "vendor-compliance-report",
            data: {
              totalVendors: "{{steps.get-vendors.output.length}}",
              nonCompliant: "{{steps.find-non-compliant.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
];
