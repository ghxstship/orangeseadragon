/**
 * HR/Workforce Extended Workflow Templates
 * Implements 16 additional workflows for workforce automation
 */

import type { WorkflowTemplate } from "./types";

export const workforceExtendedTemplates: WorkflowTemplate[] = [
  {
    id: "employee-onboarding-automation",
    name: "Employee Onboarding Automation",
    description: "Comprehensive employee onboarding workflow",
    category: "workforce",
    tags: ["onboarding", "employees", "hr"],
    workflow: {
      name: "Employee Onboarding Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "employee.hired" },
      },
      steps: [
        {
          id: "create-onboarding-record",
          name: "Create Onboarding Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "onboarding_records",
              data: {
                employeeId: "{{trigger.data.id}}",
                startDate: "{{trigger.data.startDate}}",
                status: "pending",
                templateId: "{{trigger.data.onboardingTemplateId}}",
              },
            },
          },
        },
        {
          id: "get-template",
          name: "Get Onboarding Template",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "onboarding_templates",
              filters: { id: "{{trigger.data.onboardingTemplateId}}" },
              include: ["tasks", "documents"],
            },
          },
        },
        {
          id: "create-tasks",
          name: "Create Onboarding Tasks",
          type: "loop",
          config: {
            collection: "{{steps.get-template.output[0].tasks}}",
            itemVariable: "task",
            steps: ["create-task"],
          },
        },
        {
          id: "create-task",
          name: "Create Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "{{task.name}}",
                description: "{{task.description}}",
                dueDate: "{{trigger.data.startDate + task.dueDaysOffset}}",
                assigneeId: "{{task.assigneeRole === 'employee' ? trigger.data.id : task.assigneeId}}",
                category: "onboarding",
                relatedEntityType: "employee",
                relatedEntityId: "{{trigger.data.id}}",
              },
            },
          },
        },
        {
          id: "provision-accounts",
          name: "Provision System Accounts",
          type: "action",
          config: {
            actionType: "provisionEmployeeAccounts",
            parameters: {
              employeeId: "{{trigger.data.id}}",
              systems: "{{trigger.data.requiredSystems}}",
            },
          },
        },
        {
          id: "send-welcome",
          name: "Send Welcome Email",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.email}}"],
            template: "employee-welcome",
            data: { employee: "{{trigger.data}}" },
          },
        },
        {
          id: "notify-manager",
          name: "Notify Manager",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.managerId}}"],
            template: "new-hire-notification",
            data: { employee: "{{trigger.data}}" },
          },
        },
        {
          id: "schedule-orientation",
          name: "Schedule Orientation",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "calendar_events",
              data: {
                title: "New Hire Orientation: {{trigger.data.firstName}} {{trigger.data.lastName}}",
                type: "meeting",
                scheduledFor: "{{trigger.data.startDate}}",
                duration: 240,
                attendees: ["{{trigger.data.id}}", "{{trigger.data.managerId}}"],
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "employee-offboarding-automation",
    name: "Employee Offboarding Automation",
    description: "Comprehensive employee offboarding workflow",
    category: "workforce",
    tags: ["offboarding", "employees", "hr"],
    workflow: {
      name: "Employee Offboarding Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "employee.terminated" },
      },
      steps: [
        {
          id: "create-offboarding-record",
          name: "Create Offboarding Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "offboarding_records",
              data: {
                employeeId: "{{trigger.data.id}}",
                lastDay: "{{trigger.data.lastDay}}",
                terminationType: "{{trigger.data.terminationType}}",
                status: "in_progress",
              },
            },
          },
        },
        {
          id: "get-template",
          name: "Get Offboarding Template",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "offboarding_templates",
              filters: { isDefault: true },
              include: ["tasks"],
            },
          },
        },
        {
          id: "create-tasks",
          name: "Create Offboarding Tasks",
          type: "loop",
          config: {
            collection: "{{steps.get-template.output[0].tasks}}",
            itemVariable: "task",
            steps: ["create-offboarding-task"],
          },
        },
        {
          id: "create-offboarding-task",
          name: "Create Offboarding Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "{{task.name}}",
                dueDate: "{{trigger.data.lastDay + task.dueDaysOffset}}",
                assigneeId: "{{task.assigneeId}}",
                category: "offboarding",
                relatedEntityType: "employee",
                relatedEntityId: "{{trigger.data.id}}",
              },
            },
          },
        },
        {
          id: "schedule-exit-interview",
          name: "Schedule Exit Interview",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "calendar_events",
              data: {
                title: "Exit Interview: {{trigger.data.firstName}} {{trigger.data.lastName}}",
                type: "meeting",
                scheduledFor: "{{trigger.data.lastDay - 2d}}",
                attendees: ["{{trigger.data.id}}", "{{org.hrManagerId}}"],
              },
            },
          },
        },
        {
          id: "schedule-access-revocation",
          name: "Schedule Access Revocation",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "revoke-employee-access",
              triggerAt: "{{trigger.data.lastDay + 1d}}",
              context: { employeeId: "{{trigger.data.id}}" },
            },
          },
        },
        {
          id: "notify-it",
          name: "Notify IT Department",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["it@company.com"],
            template: "employee-offboarding-it",
            data: { employee: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "leave-request-approval",
    name: "Leave Request Approval",
    description: "Route leave requests through approval chain",
    category: "workforce",
    tags: ["leave", "approval", "time-off"],
    workflow: {
      name: "Leave Request Approval",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "leave_request.submitted" },
      },
      steps: [
        {
          id: "check-balance",
          name: "Check Leave Balance",
          type: "action",
          config: {
            actionType: "checkLeaveBalance",
            parameters: {
              employeeId: "{{trigger.data.employeeId}}",
              leaveTypeId: "{{trigger.data.leaveTypeId}}",
              requestedDays: "{{trigger.data.days}}",
            },
          },
        },
        {
          id: "validate-balance",
          name: "Validate Sufficient Balance",
          type: "condition",
          config: {
            expression: "{{steps.check-balance.output.sufficient}}",
            trueBranch: ["get-approver"],
            falseBranch: ["reject-insufficient"],
          },
          conditions: [{ field: "steps.check-balance.output.sufficient", operator: "eq", value: true }],
        },
        {
          id: "reject-insufficient",
          name: "Reject - Insufficient Balance",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "leave_requests",
              id: "{{trigger.data.id}}",
              data: { status: "rejected", rejectionReason: "Insufficient leave balance" },
            },
          },
        },
        {
          id: "get-approver",
          name: "Get Approver",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "employees",
              filters: { id: "{{trigger.data.employee.managerId}}" },
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
                entityType: "leave_request",
                entityId: "{{trigger.data.id}}",
                approverId: "{{steps.get-approver.output[0].id}}",
                status: "pending",
              },
            },
          },
        },
        {
          id: "notify-approver",
          name: "Notify Approver",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.get-approver.output[0].email}}"],
            template: "leave-request-approval",
            data: { request: "{{trigger.data}}", balance: "{{steps.check-balance.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "performance-review-cycle",
    name: "Performance Review Cycle",
    description: "Automate performance review cycles",
    category: "workforce",
    tags: ["performance", "reviews", "hr"],
    workflow: {
      name: "Performance Review Cycle",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "review_cycle.started" },
      },
      steps: [
        {
          id: "get-eligible-employees",
          name: "Get Eligible Employees",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "employees",
              filters: {
                status: "active",
                hireDate: { $lt: "{{trigger.data.eligibilityDate}}" },
              },
              include: ["manager", "department"],
            },
          },
        },
        {
          id: "create-reviews",
          name: "Create Review Records",
          type: "loop",
          config: {
            collection: "{{steps.get-eligible-employees.output}}",
            itemVariable: "employee",
            steps: ["create-review", "notify-employee"],
          },
        },
        {
          id: "create-review",
          name: "Create Performance Review",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "performance_reviews",
              data: {
                employeeId: "{{employee.id}}",
                reviewerId: "{{employee.managerId}}",
                cycleId: "{{trigger.data.id}}",
                status: "pending_self_review",
                dueDate: "{{trigger.data.selfReviewDeadline}}",
              },
            },
          },
        },
        {
          id: "notify-employee",
          name: "Notify Employee",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{employee.email}}"],
            template: "performance-review-started",
            data: { employee: "{{employee}}", cycle: "{{trigger.data}}" },
          },
        },
        {
          id: "notify-managers",
          name: "Notify All Managers",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{distinct(steps.get-eligible-employees.output.map(e => e.managerId))}}"],
            template: "review-cycle-manager-notification",
            data: { cycle: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "goal-setting-tracking",
    name: "Goal Setting & Tracking",
    description: "Manage employee goal setting and progress tracking",
    category: "workforce",
    tags: ["goals", "okrs", "performance"],
    workflow: {
      name: "Goal Setting & Tracking",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "goal_period.started" },
      },
      steps: [
        {
          id: "get-employees",
          name: "Get Active Employees",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "employees",
              filters: { status: "active" },
            },
          },
        },
        {
          id: "create-goal-records",
          name: "Create Goal Setting Records",
          type: "loop",
          config: {
            collection: "{{steps.get-employees.output}}",
            itemVariable: "employee",
            steps: ["create-goal-record"],
          },
        },
        {
          id: "create-goal-record",
          name: "Create Goal Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "employee_goals",
              data: {
                employeeId: "{{employee.id}}",
                periodId: "{{trigger.data.id}}",
                status: "draft",
                dueDate: "{{trigger.data.goalSettingDeadline}}",
              },
            },
          },
        },
        {
          id: "notify-employees",
          name: "Notify Employees",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{steps.get-employees.output.map(e => e.email)}}",
            template: "goal-setting-period-started",
            data: { period: "{{trigger.data}}" },
          },
        },
        {
          id: "schedule-reminders",
          name: "Schedule Goal Reminders",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "goal-setting-reminder",
              triggerAt: "{{trigger.data.goalSettingDeadline - 3d}}",
              context: { periodId: "{{trigger.data.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "training-assignment",
    name: "Training Assignment",
    description: "Assign and track mandatory training",
    category: "workforce",
    tags: ["training", "learning", "compliance"],
    workflow: {
      name: "Training Assignment",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "training.assigned" },
      },
      steps: [
        {
          id: "create-enrollment",
          name: "Create Training Enrollment",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "training_enrollments",
              data: {
                employeeId: "{{trigger.data.employeeId}}",
                courseId: "{{trigger.data.courseId}}",
                assignedBy: "{{trigger.data.assignedBy}}",
                dueDate: "{{trigger.data.dueDate}}",
                status: "assigned",
              },
            },
          },
        },
        {
          id: "notify-employee",
          name: "Notify Employee",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.employee.email}}"],
            template: "training-assigned",
            data: { training: "{{trigger.data}}" },
          },
        },
        {
          id: "schedule-reminder",
          name: "Schedule Reminder",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "training-reminder",
              triggerAt: "{{trigger.data.dueDate - 7d}}",
              context: { enrollmentId: "{{steps.create-enrollment.output.id}}" },
            },
          },
        },
        {
          id: "notify-manager",
          name: "Notify Manager",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.employee.managerId}}"],
            template: "training-assigned-manager",
            data: { training: "{{trigger.data}}", employee: "{{trigger.data.employee}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "payroll-processing",
    name: "Payroll Processing",
    description: "Automate payroll processing workflow",
    category: "workforce",
    tags: ["payroll", "compensation", "hr"],
    workflow: {
      name: "Payroll Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "payroll_run.initiated" },
      },
      steps: [
        {
          id: "validate-timesheets",
          name: "Validate All Timesheets",
          type: "action",
          config: {
            actionType: "validateTimesheets",
            parameters: {
              payPeriodId: "{{trigger.data.payPeriodId}}",
              requireApproval: true,
            },
          },
        },
        {
          id: "check-validation",
          name: "Check Validation Results",
          type: "condition",
          config: {
            expression: "{{steps.validate-timesheets.output.allValid}}",
            trueBranch: ["calculate-payroll"],
            falseBranch: ["notify-issues"],
          },
          conditions: [{ field: "steps.validate-timesheets.output.allValid", operator: "eq", value: true }],
        },
        {
          id: "notify-issues",
          name: "Notify of Timesheet Issues",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.initiatorId}}"],
            template: "payroll-validation-issues",
            data: { issues: "{{steps.validate-timesheets.output.issues}}" },
          },
        },
        {
          id: "calculate-payroll",
          name: "Calculate Payroll",
          type: "action",
          config: {
            actionType: "calculatePayroll",
            parameters: {
              payrollRunId: "{{trigger.data.id}}",
              includeDeductions: true,
              includeBenefits: true,
            },
          },
        },
        {
          id: "generate-pay-stubs",
          name: "Generate Pay Stubs",
          type: "action",
          config: {
            actionType: "generatePayStubs",
            parameters: { payrollRunId: "{{trigger.data.id}}" },
          },
        },
        {
          id: "submit-for-approval",
          name: "Submit for Approval",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "approval_requests",
              data: {
                entityType: "payroll_run",
                entityId: "{{trigger.data.id}}",
                approverId: "{{org.financeManagerId}}",
                status: "pending",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "overtime-approval",
    name: "Overtime Approval",
    description: "Route overtime requests for approval",
    category: "workforce",
    tags: ["overtime", "approval", "time"],
    workflow: {
      name: "Overtime Approval",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "overtime_request.submitted" },
      },
      steps: [
        {
          id: "check-budget",
          name: "Check Overtime Budget",
          type: "action",
          config: {
            actionType: "checkOvertimeBudget",
            parameters: {
              departmentId: "{{trigger.data.employee.departmentId}}",
              requestedHours: "{{trigger.data.hours}}",
            },
          },
        },
        {
          id: "determine-approver",
          name: "Determine Approver",
          type: "action",
          config: {
            actionType: "getApprover",
            parameters: {
              employeeId: "{{trigger.data.employeeId}}",
              approvalType: "overtime",
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
                entityType: "overtime_request",
                entityId: "{{trigger.data.id}}",
                approverId: "{{steps.determine-approver.output.approverId}}",
                status: "pending",
                metadata: { budgetStatus: "{{steps.check-budget.output}}" },
              },
            },
          },
        },
        {
          id: "notify-approver",
          name: "Notify Approver",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.determine-approver.output.approverId}}"],
            template: "overtime-approval-request",
            data: { request: "{{trigger.data}}", budget: "{{steps.check-budget.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "shift-swap-request",
    name: "Shift Swap Request",
    description: "Process shift swap requests between employees",
    category: "workforce",
    tags: ["shifts", "swap", "scheduling"],
    workflow: {
      name: "Shift Swap Request",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "shift_swap.requested" },
      },
      steps: [
        {
          id: "validate-swap",
          name: "Validate Swap Eligibility",
          type: "action",
          config: {
            actionType: "validateShiftSwap",
            parameters: {
              requesterId: "{{trigger.data.requesterId}}",
              targetId: "{{trigger.data.targetId}}",
              shiftId: "{{trigger.data.shiftId}}",
            },
          },
        },
        {
          id: "check-valid",
          name: "Check if Valid",
          type: "condition",
          config: {
            expression: "{{steps.validate-swap.output.valid}}",
            trueBranch: ["notify-target"],
            falseBranch: ["reject-swap"],
          },
          conditions: [{ field: "steps.validate-swap.output.valid", operator: "eq", value: true }],
        },
        {
          id: "reject-swap",
          name: "Reject Invalid Swap",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "shift_swaps",
              id: "{{trigger.data.id}}",
              data: { status: "rejected", reason: "{{steps.validate-swap.output.reason}}" },
            },
          },
        },
        {
          id: "notify-target",
          name: "Notify Target Employee",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{trigger.data.targetId}}"],
            template: "shift-swap-request",
            data: { swap: "{{trigger.data}}" },
          },
        },
        {
          id: "set-expiry",
          name: "Set Response Deadline",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "shift-swap-expired",
              triggerAt: "{{now + 24h}}",
              context: { swapId: "{{trigger.data.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "expense-reimbursement",
    name: "Expense Reimbursement",
    description: "Process employee expense reimbursements",
    category: "workforce",
    tags: ["expenses", "reimbursement", "finance"],
    workflow: {
      name: "Expense Reimbursement",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "expense_report.submitted" },
      },
      steps: [
        {
          id: "validate-receipts",
          name: "Validate Receipts",
          type: "action",
          config: {
            actionType: "validateExpenseReceipts",
            parameters: {
              reportId: "{{trigger.data.id}}",
              requireReceiptsAbove: 25,
            },
          },
        },
        {
          id: "check-policy",
          name: "Check Policy Compliance",
          type: "action",
          config: {
            actionType: "checkExpensePolicy",
            parameters: {
              report: "{{trigger.data}}",
              policyId: "{{trigger.data.employee.expensePolicyId}}",
            },
          },
        },
        {
          id: "determine-approval",
          name: "Determine Approval Route",
          type: "action",
          config: {
            actionType: "getApprovalChain",
            parameters: {
              type: "expense",
              amount: "{{trigger.data.totalAmount}}",
              employeeId: "{{trigger.data.employeeId}}",
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
                entityType: "expense_report",
                entityId: "{{trigger.data.id}}",
                approvers: "{{steps.determine-approval.output}}",
                currentLevel: 0,
                status: "pending",
              },
            },
          },
        },
        {
          id: "notify-approver",
          name: "Notify First Approver",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.determine-approval.output[0].userId}}"],
            template: "expense-approval-request",
            data: { report: "{{trigger.data}}", policyCheck: "{{steps.check-policy.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "benefits-enrollment",
    name: "Benefits Enrollment",
    description: "Manage benefits enrollment periods",
    category: "workforce",
    tags: ["benefits", "enrollment", "hr"],
    workflow: {
      name: "Benefits Enrollment",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "benefits_period.opened" },
      },
      steps: [
        {
          id: "get-eligible",
          name: "Get Eligible Employees",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "employees",
              filters: {
                status: "active",
                benefitsEligible: true,
              },
            },
          },
        },
        {
          id: "create-enrollments",
          name: "Create Enrollment Records",
          type: "loop",
          config: {
            collection: "{{steps.get-eligible.output}}",
            itemVariable: "employee",
            steps: ["create-enrollment"],
          },
        },
        {
          id: "create-enrollment",
          name: "Create Enrollment Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "benefits_enrollments",
              data: {
                employeeId: "{{employee.id}}",
                periodId: "{{trigger.data.id}}",
                status: "pending",
                deadline: "{{trigger.data.enrollmentDeadline}}",
              },
            },
          },
        },
        {
          id: "notify-employees",
          name: "Notify Employees",
          type: "notification",
          config: {
            channel: "email",
            recipients: "{{steps.get-eligible.output.map(e => e.email)}}",
            template: "benefits-enrollment-open",
            data: { period: "{{trigger.data}}" },
          },
        },
        {
          id: "schedule-reminders",
          name: "Schedule Deadline Reminders",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "benefits-enrollment-reminder",
              triggerAt: "{{trigger.data.enrollmentDeadline - 7d}}",
              context: { periodId: "{{trigger.data.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "compensation-change",
    name: "Compensation Change Processing",
    description: "Process salary and compensation changes",
    category: "workforce",
    tags: ["compensation", "salary", "hr"],
    workflow: {
      name: "Compensation Change Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "compensation_change.submitted" },
      },
      steps: [
        {
          id: "validate-budget",
          name: "Validate Against Budget",
          type: "action",
          config: {
            actionType: "validateCompensationBudget",
            parameters: {
              departmentId: "{{trigger.data.employee.departmentId}}",
              changeAmount: "{{trigger.data.newAmount - trigger.data.currentAmount}}",
            },
          },
        },
        {
          id: "get-approval-chain",
          name: "Get Approval Chain",
          type: "action",
          config: {
            actionType: "getApprovalChain",
            parameters: {
              type: "compensation_change",
              changePercent: "{{(trigger.data.newAmount - trigger.data.currentAmount) / trigger.data.currentAmount * 100}}",
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
                entityType: "compensation_change",
                entityId: "{{trigger.data.id}}",
                approvers: "{{steps.get-approval-chain.output}}",
                currentLevel: 0,
                status: "pending",
              },
            },
          },
        },
        {
          id: "notify-approvers",
          name: "Notify First Approver",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.get-approval-chain.output[0].userId}}"],
            template: "compensation-change-approval",
            data: { change: "{{trigger.data}}", budget: "{{steps.validate-budget.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "probation-review",
    name: "Probation Review",
    description: "Manage probation period reviews",
    category: "workforce",
    tags: ["probation", "review", "hr"],
    workflow: {
      name: "Probation Review",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-probation-ending",
          name: "Find Probation Ending Soon",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "employees",
              filters: {
                status: "probation",
                probationEndDate: { $lte: "{{now + 14d}}", $gte: "{{now}}" },
              },
              include: ["manager"],
            },
          },
        },
        {
          id: "create-reviews",
          name: "Create Probation Reviews",
          type: "loop",
          config: {
            collection: "{{steps.find-probation-ending.output}}",
            itemVariable: "employee",
            steps: ["create-review", "notify-manager"],
          },
        },
        {
          id: "create-review",
          name: "Create Review Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "probation_reviews",
              data: {
                employeeId: "{{employee.id}}",
                reviewerId: "{{employee.managerId}}",
                dueDate: "{{employee.probationEndDate - 3d}}",
                status: "pending",
              },
            },
          },
        },
        {
          id: "notify-manager",
          name: "Notify Manager",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{employee.manager.email}}"],
            template: "probation-review-due",
            data: { employee: "{{employee}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "workforce-compliance-check",
    name: "Workforce Compliance Check",
    description: "Check workforce compliance requirements",
    category: "workforce",
    tags: ["compliance", "certifications", "hr"],
    workflow: {
      name: "Workforce Compliance Check",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 7 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "check-certifications",
          name: "Check Expiring Certifications",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "employee_certifications",
              filters: {
                expirationDate: { $lte: "{{now + 30d}}", $gte: "{{now}}" },
                status: "active",
              },
              include: ["employee", "certificationType"],
            },
          },
        },
        {
          id: "check-training",
          name: "Check Overdue Training",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "training_enrollments",
              filters: {
                dueDate: { $lt: "{{now}}" },
                status: { $in: ["assigned", "in_progress"] },
              },
              include: ["employee", "course"],
            },
          },
        },
        {
          id: "notify-cert-expiring",
          name: "Notify Certification Expiring",
          type: "loop",
          config: {
            collection: "{{steps.check-certifications.output}}",
            itemVariable: "cert",
            steps: ["send-cert-reminder"],
          },
        },
        {
          id: "send-cert-reminder",
          name: "Send Certification Reminder",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{cert.employee.email}}"],
            template: "certification-expiring",
            data: { certification: "{{cert}}" },
          },
        },
        {
          id: "generate-compliance-report",
          name: "Generate Compliance Report",
          type: "action",
          config: {
            actionType: "generateComplianceReport",
            parameters: {
              expiringCerts: "{{steps.check-certifications.output}}",
              overdueTraining: "{{steps.check-training.output}}",
            },
          },
        },
        {
          id: "notify-hr",
          name: "Notify HR",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["hr@company.com"],
            template: "workforce-compliance-report",
            data: { report: "{{steps.generate-compliance-report.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "employee-anniversary",
    name: "Employee Anniversary Recognition",
    description: "Recognize employee work anniversaries",
    category: "workforce",
    tags: ["anniversary", "recognition", "culture"],
    workflow: {
      name: "Employee Anniversary Recognition",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 * * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-anniversaries",
          name: "Find Today's Anniversaries",
          type: "action",
          config: {
            actionType: "findAnniversaries",
            parameters: {
              date: "{{now}}",
              milestones: [1, 3, 5, 10, 15, 20, 25],
            },
          },
        },
        {
          id: "process-anniversaries",
          name: "Process Anniversaries",
          type: "loop",
          config: {
            collection: "{{steps.find-anniversaries.output}}",
            itemVariable: "anniversary",
            steps: ["send-recognition", "notify-manager"],
          },
        },
        {
          id: "send-recognition",
          name: "Send Recognition",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{anniversary.employee.email}}"],
            template: "work-anniversary",
            data: { anniversary: "{{anniversary}}" },
          },
        },
        {
          id: "notify-manager",
          name: "Notify Manager",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{anniversary.employee.managerId}}"],
            template: "team-member-anniversary",
            data: { anniversary: "{{anniversary}}" },
          },
        },
        {
          id: "post-announcement",
          name: "Post Company Announcement",
          type: "condition",
          config: {
            expression: "{{anniversary.years}}",
            trueBranch: ["create-announcement"],
            falseBranch: [],
          },
          conditions: [{ field: "anniversary.years", operator: "gte", value: 5 }],
        },
        {
          id: "create-announcement",
          name: "Create Announcement",
          type: "notification",
          config: {
            channel: "slack",
            recipients: ["#general"],
            template: "milestone-anniversary-announcement",
            data: { anniversary: "{{anniversary}}" },
          },
        },
      ],
    },
    variables: [],
  },
];
