/**
 * Project Management Extended Workflow Templates
 * Implements 13 additional workflows for project management automation
 */

import type { WorkflowTemplate } from "./types";

export const projectManagementExtendedTemplates: WorkflowTemplate[] = [
  {
    id: "project-kickoff",
    name: "Project Kickoff Automation",
    description: "Automate project kickoff activities",
    category: "project_management",
    tags: ["projects", "kickoff", "initialization"],
    workflow: {
      name: "Project Kickoff Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "project.approved" },
      },
      steps: [
        {
          id: "create-from-template",
          name: "Create Project Structure",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "{{trigger.data.templateId}}",
              data: {
                name: "{{trigger.data.name}}",
                startDate: "{{trigger.data.startDate}}",
                endDate: "{{trigger.data.endDate}}",
              },
            },
          },
        },
        {
          id: "create-channels",
          name: "Create Communication Channels",
          type: "action",
          config: {
            actionType: "createProjectChannels",
            parameters: {
              projectId: "{{trigger.data.id}}",
              channels: ["general", "updates", "issues"],
            },
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
                title: "Project Kickoff: {{trigger.data.name}}",
                type: "meeting",
                scheduledFor: "{{trigger.data.startDate}}",
                duration: 60,
                attendees: "{{trigger.data.teamMemberIds}}",
              },
            },
          },
        },
        {
          id: "notify-team",
          name: "Notify Team Members",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{trigger.data.teamMemberIds}}",
            template: "project-kickoff",
            data: { project: "{{trigger.data}}" },
          },
        },
        {
          id: "notify-stakeholders",
          name: "Notify Stakeholders",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{trigger.data.stakeholderIds}}",
            template: "project-started-stakeholder",
            data: { project: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "sprint-planning",
    name: "Sprint Planning Automation",
    description: "Automate sprint planning activities",
    category: "project_management",
    tags: ["sprints", "planning", "agile"],
    workflow: {
      name: "Sprint Planning Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "sprint.created" },
      },
      steps: [
        {
          id: "get-backlog",
          name: "Get Prioritized Backlog",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "backlog_items",
              filters: {
                projectId: "{{trigger.data.projectId}}",
                status: "ready",
                sprintId: null,
              },
              orderBy: { priority: "asc" },
              limit: 20,
            },
          },
        },
        {
          id: "calculate-capacity",
          name: "Calculate Team Capacity",
          type: "action",
          config: {
            actionType: "calculateSprintCapacity",
            parameters: {
              sprintId: "{{trigger.data.id}}",
              teamId: "{{trigger.data.teamId}}",
            },
          },
        },
        {
          id: "schedule-planning",
          name: "Schedule Planning Meeting",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "calendar_events",
              data: {
                title: "Sprint Planning: {{trigger.data.name}}",
                type: "meeting",
                scheduledFor: "{{trigger.data.startDate - 1d}}",
                duration: 120,
                attendees: "{{trigger.data.team.memberIds}}",
              },
            },
          },
        },
        {
          id: "notify-team",
          name: "Notify Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{trigger.data.team.memberIds}}",
            template: "sprint-planning-scheduled",
            data: {
              sprint: "{{trigger.data}}",
              backlog: "{{steps.get-backlog.output}}",
              capacity: "{{steps.calculate-capacity.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "sprint-retrospective",
    name: "Sprint Retrospective",
    description: "Automate sprint retrospective process",
    category: "project_management",
    tags: ["sprints", "retrospective", "agile"],
    workflow: {
      name: "Sprint Retrospective",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "sprint.completed" },
      },
      steps: [
        {
          id: "calculate-metrics",
          name: "Calculate Sprint Metrics",
          type: "action",
          config: {
            actionType: "calculateSprintMetrics",
            parameters: {
              sprintId: "{{trigger.data.id}}",
              metrics: ["velocity", "completion_rate", "scope_change", "bug_count"],
            },
          },
        },
        {
          id: "create-retro",
          name: "Create Retrospective Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "retrospectives",
              data: {
                sprintId: "{{trigger.data.id}}",
                metrics: "{{steps.calculate-metrics.output}}",
                status: "scheduled",
              },
            },
          },
        },
        {
          id: "schedule-retro",
          name: "Schedule Retrospective Meeting",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "calendar_events",
              data: {
                title: "Sprint Retrospective: {{trigger.data.name}}",
                type: "meeting",
                scheduledFor: "{{trigger.data.endDate + 1d}}",
                duration: 60,
                attendees: "{{trigger.data.team.memberIds}}",
              },
            },
          },
        },
        {
          id: "send-survey",
          name: "Send Retro Survey",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{trigger.data.team.memberIds}}",
            template: "sprint-retro-survey",
            data: { sprint: "{{trigger.data}}", metrics: "{{steps.calculate-metrics.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "resource-allocation",
    name: "Resource Allocation",
    description: "Manage project resource allocation",
    category: "project_management",
    tags: ["resources", "allocation", "capacity"],
    workflow: {
      name: "Resource Allocation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "resource_request.submitted" },
      },
      steps: [
        {
          id: "check-availability",
          name: "Check Resource Availability",
          type: "action",
          config: {
            actionType: "checkResourceAvailability",
            parameters: {
              resourceId: "{{trigger.data.resourceId}}",
              startDate: "{{trigger.data.startDate}}",
              endDate: "{{trigger.data.endDate}}",
              hoursPerWeek: "{{trigger.data.hoursPerWeek}}",
            },
          },
        },
        {
          id: "check-available",
          name: "Check if Available",
          type: "condition",
          config: {
            expression: "{{steps.check-availability.output.available}}",
            trueBranch: ["allocate-resource"],
            falseBranch: ["suggest-alternatives"],
          },
          conditions: [{ field: "steps.check-availability.output.available", operator: "eq", value: true }],
        },
        {
          id: "allocate-resource",
          name: "Allocate Resource",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "resource_allocations",
              data: {
                resourceId: "{{trigger.data.resourceId}}",
                projectId: "{{trigger.data.projectId}}",
                startDate: "{{trigger.data.startDate}}",
                endDate: "{{trigger.data.endDate}}",
                hoursPerWeek: "{{trigger.data.hoursPerWeek}}",
                status: "confirmed",
              },
            },
          },
        },
        {
          id: "suggest-alternatives",
          name: "Suggest Alternative Resources",
          type: "action",
          config: {
            actionType: "findAlternativeResources",
            parameters: {
              skillsRequired: "{{trigger.data.skillsRequired}}",
              startDate: "{{trigger.data.startDate}}",
              endDate: "{{trigger.data.endDate}}",
            },
          },
        },
        {
          id: "notify-requester",
          name: "Notify Requester",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.requesterId}}"],
            template: "resource-allocation-result",
            data: {
              request: "{{trigger.data}}",
              result: "{{steps.check-availability.output}}",
              alternatives: "{{steps.suggest-alternatives.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "project-status-report",
    name: "Project Status Report",
    description: "Generate and distribute project status reports",
    category: "project_management",
    tags: ["reports", "status", "stakeholders"],
    workflow: {
      name: "Project Status Report",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * 5", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-active-projects",
          name: "Get Active Projects",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "projects",
              filters: { status: "active" },
              include: ["manager", "stakeholders"],
            },
          },
        },
        {
          id: "generate-reports",
          name: "Generate Status Reports",
          type: "loop",
          config: {
            collection: "{{steps.get-active-projects.output}}",
            itemVariable: "project",
            steps: ["generate-report", "send-report"],
          },
        },
        {
          id: "generate-report",
          name: "Generate Project Report",
          type: "action",
          config: {
            actionType: "generateProjectStatusReport",
            parameters: {
              projectId: "{{project.id}}",
              sections: ["summary", "milestones", "risks", "budget", "timeline"],
            },
          },
        },
        {
          id: "send-report",
          name: "Send Report to Stakeholders",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{project.stakeholders.map(s => s.email)}}",
            template: "project-status-report",
            data: { project: "{{project}}", report: "{{steps.generate-report.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "risk-management",
    name: "Risk Management",
    description: "Monitor and manage project risks",
    category: "project_management",
    tags: ["risks", "management", "monitoring"],
    workflow: {
      name: "Risk Management",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "risk.identified" },
      },
      steps: [
        {
          id: "assess-risk",
          name: "Assess Risk",
          type: "action",
          config: {
            actionType: "assessRisk",
            parameters: {
              riskId: "{{trigger.data.id}}",
              factors: ["probability", "impact", "detectability"],
            },
          },
        },
        {
          id: "update-risk",
          name: "Update Risk Score",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "risks",
              id: "{{trigger.data.id}}",
              data: {
                score: "{{steps.assess-risk.output.score}}",
                priority: "{{steps.assess-risk.output.priority}}",
              },
            },
          },
        },
        {
          id: "check-critical",
          name: "Check if Critical",
          type: "condition",
          config: {
            expression: "{{steps.assess-risk.output.priority}}",
            trueBranch: ["escalate-risk"],
            falseBranch: ["create-mitigation-task"],
          },
          conditions: [{ field: "steps.assess-risk.output.priority", operator: "eq", value: "critical" }],
        },
        {
          id: "escalate-risk",
          name: "Escalate Critical Risk",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.project.managerId}}", "{{trigger.data.project.sponsorId}}"],
            template: "critical-risk-alert",
            data: { risk: "{{trigger.data}}", assessment: "{{steps.assess-risk.output}}" },
          },
        },
        {
          id: "create-mitigation-task",
          name: "Create Mitigation Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "Mitigate risk: {{trigger.data.name}}",
                description: "{{trigger.data.mitigationStrategy}}",
                projectId: "{{trigger.data.projectId}}",
                assigneeId: "{{trigger.data.ownerId}}",
                priority: "{{steps.assess-risk.output.priority}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "dependency-tracking",
    name: "Dependency Tracking",
    description: "Track and alert on task dependencies",
    category: "project_management",
    tags: ["dependencies", "tracking", "tasks"],
    workflow: {
      name: "Dependency Tracking",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "task.status_changed" },
      },
      steps: [
        {
          id: "get-dependents",
          name: "Get Dependent Tasks",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "task_dependencies",
              filters: { predecessorId: "{{trigger.data.id}}" },
              include: ["successor", "successor.assignee"],
            },
          },
        },
        {
          id: "check-completed",
          name: "Check if Completed",
          type: "condition",
          config: {
            expression: "{{trigger.data.status}}",
            trueBranch: ["unblock-dependents"],
            falseBranch: ["check-blocked"],
          },
          conditions: [{ field: "trigger.data.status", operator: "eq", value: "completed" }],
        },
        {
          id: "unblock-dependents",
          name: "Unblock Dependent Tasks",
          type: "loop",
          config: {
            collection: "{{steps.get-dependents.output}}",
            itemVariable: "dep",
            steps: ["update-dependent", "notify-assignee"],
          },
        },
        {
          id: "update-dependent",
          name: "Update Dependent Task",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "tasks",
              id: "{{dep.successorId}}",
              data: { blockedBy: null, status: "ready" },
            },
          },
        },
        {
          id: "notify-assignee",
          name: "Notify Task Assignee",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{dep.successor.assigneeId}}"],
            template: "task-unblocked",
            data: { task: "{{dep.successor}}", predecessor: "{{trigger.data}}" },
          },
        },
        {
          id: "check-blocked",
          name: "Check if Blocked",
          type: "condition",
          config: {
            expression: "{{trigger.data.status}}",
            trueBranch: ["alert-dependents"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.status", operator: "eq", value: "blocked" }],
        },
        {
          id: "alert-dependents",
          name: "Alert Dependent Task Owners",
          type: "loop",
          config: {
            collection: "{{steps.get-dependents.output}}",
            itemVariable: "dep",
            steps: ["send-blocked-alert"],
          },
        },
        {
          id: "send-blocked-alert",
          name: "Send Blocked Alert",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{dep.successor.assigneeId}}"],
            template: "predecessor-blocked",
            data: { task: "{{dep.successor}}", predecessor: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "scope-change-request",
    name: "Scope Change Request",
    description: "Process project scope change requests",
    category: "project_management",
    tags: ["scope", "change", "approval"],
    workflow: {
      name: "Scope Change Request",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "scope_change.submitted" },
      },
      steps: [
        {
          id: "analyze-impact",
          name: "Analyze Change Impact",
          type: "action",
          config: {
            actionType: "analyzeChangeImpact",
            parameters: {
              changeId: "{{trigger.data.id}}",
              factors: ["timeline", "budget", "resources", "risks"],
            },
          },
        },
        {
          id: "update-request",
          name: "Update Request with Analysis",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "scope_changes",
              id: "{{trigger.data.id}}",
              data: { impactAnalysis: "{{steps.analyze-impact.output}}" },
            },
          },
        },
        {
          id: "determine-approvers",
          name: "Determine Approvers",
          type: "action",
          config: {
            actionType: "getApprovalChain",
            parameters: {
              type: "scope_change",
              impactLevel: "{{steps.analyze-impact.output.overallImpact}}",
              projectId: "{{trigger.data.projectId}}",
            },
          },
        },
        {
          id: "create-approval",
          name: "Create Approval Request",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "approval_requests",
              data: {
                entityType: "scope_change",
                entityId: "{{trigger.data.id}}",
                approvers: "{{steps.determine-approvers.output}}",
                status: "pending",
              },
            },
          },
        },
        {
          id: "notify-approvers",
          name: "Notify Approvers",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{steps.determine-approvers.output.map(a => a.userId)}}",
            template: "scope-change-approval",
            data: { change: "{{trigger.data}}", impact: "{{steps.analyze-impact.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "project-closure",
    name: "Project Closure",
    description: "Automate project closure activities",
    category: "project_management",
    tags: ["projects", "closure", "completion"],
    workflow: {
      name: "Project Closure",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "project.completed" },
      },
      steps: [
        {
          id: "verify-deliverables",
          name: "Verify All Deliverables",
          type: "action",
          config: {
            actionType: "verifyProjectDeliverables",
            parameters: { projectId: "{{trigger.data.id}}" },
          },
        },
        {
          id: "generate-final-report",
          name: "Generate Final Report",
          type: "action",
          config: {
            actionType: "generateProjectFinalReport",
            parameters: {
              projectId: "{{trigger.data.id}}",
              sections: ["summary", "deliverables", "budget", "timeline", "lessons_learned"],
            },
          },
        },
        {
          id: "archive-project",
          name: "Archive Project",
          type: "action",
          config: {
            actionType: "archiveProject",
            parameters: { projectId: "{{trigger.data.id}}" },
          },
        },
        {
          id: "release-resources",
          name: "Release Resources",
          type: "action",
          config: {
            actionType: "releaseProjectResources",
            parameters: { projectId: "{{trigger.data.id}}" },
          },
        },
        {
          id: "send-closure-report",
          name: "Send Closure Report",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{trigger.data.stakeholderIds}}",
            template: "project-closure-report",
            data: { project: "{{trigger.data}}", report: "{{steps.generate-final-report.output}}" },
          },
        },
        {
          id: "schedule-lessons-learned",
          name: "Schedule Lessons Learned Session",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "calendar_events",
              data: {
                title: "Lessons Learned: {{trigger.data.name}}",
                type: "meeting",
                scheduledFor: "{{now + 7d}}",
                attendees: "{{trigger.data.teamMemberIds}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "workload-balancing",
    name: "Workload Balancing",
    description: "Monitor and balance team workload",
    category: "project_management",
    tags: ["workload", "capacity", "balancing"],
    workflow: {
      name: "Workload Balancing",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "analyze-workload",
          name: "Analyze Team Workload",
          type: "action",
          config: {
            actionType: "analyzeTeamWorkload",
            parameters: {
              lookAheadDays: 14,
              includeProjects: true,
            },
          },
        },
        {
          id: "identify-overloaded",
          name: "Identify Overloaded Members",
          type: "action",
          config: {
            actionType: "filterWorkloadAnalysis",
            parameters: {
              analysis: "{{steps.analyze-workload.output}}",
              threshold: 1.2,
            },
          },
        },
        {
          id: "identify-underutilized",
          name: "Identify Underutilized Members",
          type: "action",
          config: {
            actionType: "filterWorkloadAnalysis",
            parameters: {
              analysis: "{{steps.analyze-workload.output}}",
              maxThreshold: 0.6,
            },
          },
        },
        {
          id: "suggest-rebalancing",
          name: "Suggest Rebalancing",
          type: "action",
          config: {
            actionType: "suggestWorkloadRebalancing",
            parameters: {
              overloaded: "{{steps.identify-overloaded.output}}",
              underutilized: "{{steps.identify-underutilized.output}}",
            },
          },
        },
        {
          id: "notify-managers",
          name: "Notify Project Managers",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{org.pmLeadId}}"],
            template: "workload-analysis-report",
            data: {
              analysis: "{{steps.analyze-workload.output}}",
              suggestions: "{{steps.suggest-rebalancing.output}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "time-tracking-reminder",
    name: "Time Tracking Reminder",
    description: "Remind team members to log time",
    category: "project_management",
    tags: ["time", "tracking", "reminders"],
    workflow: {
      name: "Time Tracking Reminder",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 16 * * 5", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-incomplete",
          name: "Find Incomplete Time Entries",
          type: "action",
          config: {
            actionType: "findIncompleteTimeEntries",
            parameters: {
              weekEnding: "{{endOfWeek(now)}}",
              minimumHours: 32,
            },
          },
        },
        {
          id: "send-reminders",
          name: "Send Reminders",
          type: "loop",
          config: {
            collection: "{{steps.find-incomplete.output}}",
            itemVariable: "user",
            steps: ["send-reminder"],
          },
        },
        {
          id: "send-reminder",
          name: "Send Time Entry Reminder",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{user.email}}"],
            template: "time-entry-reminder",
            data: { user: "{{user}}", hoursLogged: "{{user.hoursLogged}}", hoursExpected: 40 },
          },
        },
      ],
    },
    variables: [
      { name: "minimumHours", type: "number", description: "Minimum hours expected per week", required: false, default: 32 },
    ],
  },
  {
    id: "project-health-check",
    name: "Project Health Check",
    description: "Automated project health monitoring",
    category: "project_management",
    tags: ["health", "monitoring", "projects"],
    workflow: {
      name: "Project Health Check",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 7 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-projects",
          name: "Get Active Projects",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "projects",
              filters: { status: "active" },
            },
          },
        },
        {
          id: "check-health",
          name: "Check Project Health",
          type: "loop",
          config: {
            collection: "{{steps.get-projects.output}}",
            itemVariable: "project",
            steps: ["calculate-health", "update-health"],
          },
        },
        {
          id: "calculate-health",
          name: "Calculate Health Score",
          type: "action",
          config: {
            actionType: "calculateProjectHealth",
            parameters: {
              projectId: "{{project.id}}",
              factors: ["schedule", "budget", "scope", "quality", "risks"],
            },
          },
        },
        {
          id: "update-health",
          name: "Update Project Health",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "projects",
              id: "{{project.id}}",
              data: {
                healthScore: "{{steps.calculate-health.output.score}}",
                healthStatus: "{{steps.calculate-health.output.status}}",
              },
            },
          },
        },
        {
          id: "find-at-risk",
          name: "Find At-Risk Projects",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "projects",
              filters: { status: "active", healthStatus: { $in: ["at_risk", "critical"] } },
              include: ["manager"],
            },
          },
        },
        {
          id: "alert-leadership",
          name: "Alert Leadership",
          type: "condition",
          config: {
            expression: "{{steps.find-at-risk.output.length}}",
            trueBranch: ["send-alert"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.find-at-risk.output.length", operator: "gt", value: 0 }],
        },
        {
          id: "send-alert",
          name: "Send At-Risk Alert",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{org.pmoLeadId}}"],
            template: "projects-at-risk-alert",
            data: { projects: "{{steps.find-at-risk.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "stakeholder-communication",
    name: "Stakeholder Communication",
    description: "Automated stakeholder communication management",
    category: "project_management",
    tags: ["stakeholders", "communication", "updates"],
    workflow: {
      name: "Stakeholder Communication",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "milestone.completed" },
      },
      steps: [
        {
          id: "get-stakeholders",
          name: "Get Project Stakeholders",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "project_stakeholders",
              filters: { projectId: "{{trigger.data.projectId}}" },
              include: ["contact"],
            },
          },
        },
        {
          id: "generate-update",
          name: "Generate Milestone Update",
          type: "action",
          config: {
            actionType: "generateMilestoneUpdate",
            parameters: {
              milestone: "{{trigger.data}}",
              includeMetrics: true,
            },
          },
        },
        {
          id: "send-updates",
          name: "Send Stakeholder Updates",
          type: "loop",
          config: {
            collection: "{{steps.get-stakeholders.output}}",
            itemVariable: "stakeholder",
            steps: ["send-update"],
          },
        },
        {
          id: "send-update",
          name: "Send Update",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{stakeholder.contact.email}}"],
            template: "milestone-completed-stakeholder",
            data: {
              milestone: "{{trigger.data}}",
              update: "{{steps.generate-update.output}}",
              stakeholder: "{{stakeholder}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
];
