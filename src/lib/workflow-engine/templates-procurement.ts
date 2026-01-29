/**
 * Procurement Workflow Templates
 * Implements 10 workflows for procurement automation
 */

import type { WorkflowTemplate } from "./types";

export const procurementTemplates: WorkflowTemplate[] = [
  {
    id: "rfq-creation-distribution",
    name: "RFQ Creation & Distribution",
    description: "Create and distribute RFQs to qualified vendors",
    category: "procurement",
    tags: ["rfq", "vendors", "sourcing"],
    workflow: {
      name: "RFQ Creation & Distribution",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "rfq.created" },
      },
      steps: [
        {
          id: "get-qualified-vendors",
          name: "Get Qualified Vendors",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendors",
              filters: {
                categories: { $contains: "{{trigger.data.category}}" },
                status: "approved",
                isActive: true,
              },
            },
          },
        },
        {
          id: "create-invitations",
          name: "Create Vendor Invitations",
          type: "loop",
          config: {
            collection: "{{steps.get-qualified-vendors.output}}",
            itemVariable: "vendor",
            steps: ["create-invitation", "send-invitation"],
          },
        },
        {
          id: "create-invitation",
          name: "Create RFQ Invitation",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "rfq_invitations",
              data: {
                rfqId: "{{trigger.data.id}}",
                vendorId: "{{vendor.id}}",
                status: "sent",
                sentAt: "{{now}}",
                dueDate: "{{trigger.data.responseDeadline}}",
              },
            },
          },
        },
        {
          id: "send-invitation",
          name: "Send RFQ to Vendor",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{vendor.contactEmail}}"],
            template: "rfq-invitation",
            data: { rfq: "{{trigger.data}}", vendor: "{{vendor}}" },
          },
        },
        {
          id: "schedule-reminder",
          name: "Schedule Response Reminder",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "rfq-response-reminder",
              triggerAt: "{{trigger.data.responseDeadline - 2d}}",
              context: { rfqId: "{{trigger.data.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "vendor-bid-evaluation",
    name: "Vendor Bid Evaluation",
    description: "Evaluate and score vendor bids",
    category: "procurement",
    tags: ["bids", "evaluation", "scoring"],
    workflow: {
      name: "Vendor Bid Evaluation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "rfq.deadline_passed" },
      },
      steps: [
        {
          id: "get-bids",
          name: "Get All Submitted Bids",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendor_bids",
              filters: { rfqId: "{{trigger.data.id}}", status: "submitted" },
              include: ["vendor", "lineItems"],
            },
          },
        },
        {
          id: "score-bids",
          name: "Score Bids",
          type: "loop",
          config: {
            collection: "{{steps.get-bids.output}}",
            itemVariable: "bid",
            steps: ["calculate-score"],
          },
        },
        {
          id: "calculate-score",
          name: "Calculate Bid Score",
          type: "action",
          config: {
            actionType: "calculateBidScore",
            parameters: {
              bid: "{{bid}}",
              criteria: "{{trigger.data.evaluationCriteria}}",
              weights: "{{trigger.data.criteriaWeights}}",
            },
          },
        },
        {
          id: "rank-bids",
          name: "Rank Bids",
          type: "action",
          config: {
            actionType: "rankBids",
            parameters: { rfqId: "{{trigger.data.id}}" },
          },
        },
        {
          id: "create-evaluation-report",
          name: "Create Evaluation Report",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "bid_evaluations",
              data: {
                rfqId: "{{trigger.data.id}}",
                evaluatedAt: "{{now}}",
                rankings: "{{steps.rank-bids.output}}",
                recommendedVendorId: "{{steps.rank-bids.output[0].vendorId}}",
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
            recipients: ["{{trigger.data.ownerId}}"],
            template: "bid-evaluation-complete",
            data: { rfq: "{{trigger.data}}", evaluation: "{{steps.create-evaluation-report.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "vendor-onboarding",
    name: "Vendor Onboarding",
    description: "Onboard new vendors with compliance checks",
    category: "procurement",
    tags: ["vendors", "onboarding", "compliance"],
    workflow: {
      name: "Vendor Onboarding",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "vendor.created" },
      },
      steps: [
        {
          id: "send-welcome",
          name: "Send Welcome Package",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.contactEmail}}"],
            template: "vendor-welcome",
            data: { vendor: "{{trigger.data}}" },
          },
        },
        {
          id: "create-onboarding-tasks",
          name: "Create Onboarding Tasks",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "vendor-onboarding-checklist",
              data: { vendorId: "{{trigger.data.id}}", vendorName: "{{trigger.data.name}}" },
            },
          },
        },
        {
          id: "request-documents",
          name: "Request Required Documents",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.contactEmail}}"],
            template: "vendor-document-request",
            data: {
              vendor: "{{trigger.data}}",
              requiredDocs: ["w9", "insurance_certificate", "bank_details"],
            },
          },
        },
        {
          id: "schedule-compliance-check",
          name: "Schedule Compliance Check",
          type: "action",
          config: {
            actionType: "scheduleWorkflow",
            parameters: {
              workflowId: "vendor-compliance-check",
              triggerAt: "{{now + 7d}}",
              context: { vendorId: "{{trigger.data.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "vendor-performance-review",
    name: "Vendor Performance Review",
    description: "Periodic vendor performance evaluation",
    category: "procurement",
    tags: ["vendors", "performance", "review"],
    workflow: {
      name: "Vendor Performance Review",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 9 1 */3 *", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-active-vendors",
          name: "Get Active Vendors",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendors",
              filters: { status: "approved", isActive: true },
            },
          },
        },
        {
          id: "evaluate-vendors",
          name: "Evaluate Each Vendor",
          type: "loop",
          config: {
            collection: "{{steps.get-active-vendors.output}}",
            itemVariable: "vendor",
            steps: ["calculate-metrics", "create-review"],
          },
        },
        {
          id: "calculate-metrics",
          name: "Calculate Performance Metrics",
          type: "action",
          config: {
            actionType: "calculateVendorMetrics",
            parameters: {
              vendorId: "{{vendor.id}}",
              period: "{{now - 90d}}",
              metrics: ["on_time_delivery", "quality_score", "price_competitiveness", "responsiveness"],
            },
          },
        },
        {
          id: "create-review",
          name: "Create Performance Review",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "vendor_reviews",
              data: {
                vendorId: "{{vendor.id}}",
                period: "{{formatDate(now, 'YYYY-Q')}}",
                metrics: "{{steps.calculate-metrics.output}}",
                overallScore: "{{steps.calculate-metrics.output.overallScore}}",
              },
            },
          },
        },
        {
          id: "identify-issues",
          name: "Identify Performance Issues",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendor_reviews",
              filters: { period: "{{formatDate(now, 'YYYY-Q')}}", overallScore: { $lt: 70 } },
              include: ["vendor"],
            },
          },
        },
        {
          id: "notify-procurement",
          name: "Notify of Issues",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["procurement@company.com"],
            template: "vendor-performance-issues",
            data: { vendors: "{{steps.identify-issues.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "goods-receipt-confirmation",
    name: "Goods Receipt Confirmation",
    description: "Confirm receipt of goods and update inventory",
    category: "procurement",
    tags: ["receiving", "inventory", "goods-receipt"],
    workflow: {
      name: "Goods Receipt Confirmation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "goods_receipt.created" },
      },
      steps: [
        {
          id: "get-po",
          name: "Get Purchase Order",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "purchase_orders",
              filters: { id: "{{trigger.data.purchaseOrderId}}" },
              include: ["lineItems", "vendor"],
            },
          },
        },
        {
          id: "validate-quantities",
          name: "Validate Received Quantities",
          type: "action",
          config: {
            actionType: "validateGoodsReceipt",
            parameters: {
              receipt: "{{trigger.data}}",
              purchaseOrder: "{{steps.get-po.output[0]}}",
            },
          },
        },
        {
          id: "update-inventory",
          name: "Update Inventory",
          type: "loop",
          config: {
            collection: "{{trigger.data.lineItems}}",
            itemVariable: "item",
            steps: ["add-to-inventory"],
          },
        },
        {
          id: "add-to-inventory",
          name: "Add Item to Inventory",
          type: "action",
          config: {
            actionType: "adjustInventory",
            parameters: {
              itemId: "{{item.itemId}}",
              quantity: "{{item.receivedQuantity}}",
              type: "receipt",
              referenceType: "goods_receipt",
              referenceId: "{{trigger.data.id}}",
            },
          },
        },
        {
          id: "update-po-status",
          name: "Update PO Status",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "purchase_orders",
              id: "{{trigger.data.purchaseOrderId}}",
              data: {
                receivedQuantity: "{{steps.validate-quantities.output.totalReceived}}",
                status: "{{steps.validate-quantities.output.fullyReceived ? 'received' : 'partial'}}",
              },
            },
          },
        },
        {
          id: "trigger-invoice-match",
          name: "Trigger Invoice Matching",
          type: "action",
          config: {
            actionType: "emitEvent",
            parameters: {
              eventType: "goods_receipt.ready_for_matching",
              data: { receiptId: "{{trigger.data.id}}", poId: "{{trigger.data.purchaseOrderId}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "quality-inspection",
    name: "Quality Inspection",
    description: "Quality inspection workflow for received goods",
    category: "procurement",
    tags: ["quality", "inspection", "receiving"],
    workflow: {
      name: "Quality Inspection",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "goods_receipt.requires_inspection" },
      },
      steps: [
        {
          id: "create-inspection",
          name: "Create Inspection Record",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "quality_inspections",
              data: {
                goodsReceiptId: "{{trigger.data.id}}",
                status: "pending",
                inspectionType: "{{trigger.data.inspectionType}}",
                dueDate: "{{now + 2d}}",
              },
            },
          },
        },
        {
          id: "assign-inspector",
          name: "Assign Quality Inspector",
          type: "action",
          config: {
            actionType: "assignAvailableStaff",
            parameters: {
              role: "quality_inspector",
              taskId: "{{steps.create-inspection.output.id}}",
            },
          },
        },
        {
          id: "notify-inspector",
          name: "Notify Inspector",
          type: "notification",
          config: {
            channel: "push",
            recipients: ["{{steps.assign-inspector.output.staffId}}"],
            template: "inspection-assigned",
            data: { inspection: "{{steps.create-inspection.output}}", receipt: "{{trigger.data}}" },
          },
        },
        {
          id: "create-checklist",
          name: "Create Inspection Checklist",
          type: "action",
          config: {
            actionType: "createFromTemplate",
            parameters: {
              template: "quality-inspection-checklist",
              data: { inspectionId: "{{steps.create-inspection.output.id}}" },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "return-to-vendor",
    name: "Return to Vendor (RTV)",
    description: "Process returns to vendors for defective goods",
    category: "procurement",
    tags: ["returns", "rtv", "vendors"],
    workflow: {
      name: "Return to Vendor (RTV)",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "rtv.created" },
      },
      steps: [
        {
          id: "get-vendor",
          name: "Get Vendor Details",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendors",
              filters: { id: "{{trigger.data.vendorId}}" },
            },
          },
        },
        {
          id: "create-rma",
          name: "Create RMA Request",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "rma_requests",
              data: {
                rtvId: "{{trigger.data.id}}",
                vendorId: "{{trigger.data.vendorId}}",
                items: "{{trigger.data.items}}",
                reason: "{{trigger.data.reason}}",
                status: "pending_vendor_approval",
              },
            },
          },
        },
        {
          id: "notify-vendor",
          name: "Notify Vendor",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.get-vendor.output[0].contactEmail}}"],
            template: "rma-request",
            data: { rma: "{{steps.create-rma.output}}", rtv: "{{trigger.data}}" },
          },
        },
        {
          id: "adjust-inventory",
          name: "Adjust Inventory",
          type: "loop",
          config: {
            collection: "{{trigger.data.items}}",
            itemVariable: "item",
            steps: ["reduce-inventory"],
          },
        },
        {
          id: "reduce-inventory",
          name: "Reduce Inventory",
          type: "action",
          config: {
            actionType: "adjustInventory",
            parameters: {
              itemId: "{{item.itemId}}",
              quantity: "-{{item.quantity}}",
              type: "rtv",
              referenceType: "rtv",
              referenceId: "{{trigger.data.id}}",
            },
          },
        },
        {
          id: "create-credit-expectation",
          name: "Create Credit Expectation",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "expected_credits",
              data: {
                vendorId: "{{trigger.data.vendorId}}",
                rtvId: "{{trigger.data.id}}",
                expectedAmount: "{{trigger.data.totalValue}}",
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
    id: "vendor-invoice-matching",
    name: "Vendor Invoice Matching",
    description: "Three-way match for vendor invoices",
    category: "procurement",
    tags: ["invoices", "matching", "ap"],
    workflow: {
      name: "Vendor Invoice Matching",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "vendor_invoice.received" },
      },
      steps: [
        {
          id: "get-po",
          name: "Get Purchase Order",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "purchase_orders",
              filters: { number: "{{trigger.data.poNumber}}" },
              include: ["lineItems"],
            },
          },
        },
        {
          id: "get-receipts",
          name: "Get Goods Receipts",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "goods_receipts",
              filters: { purchaseOrderId: "{{steps.get-po.output[0].id}}" },
            },
          },
        },
        {
          id: "perform-match",
          name: "Perform Three-Way Match",
          type: "action",
          config: {
            actionType: "threeWayMatch",
            parameters: {
              invoice: "{{trigger.data}}",
              purchaseOrder: "{{steps.get-po.output[0]}}",
              receipts: "{{steps.get-receipts.output}}",
              tolerancePercent: 2,
            },
          },
        },
        {
          id: "check-match-result",
          name: "Check Match Result",
          type: "condition",
          config: {
            expression: "{{steps.perform-match.output.matched}}",
            trueBranch: ["approve-invoice"],
            falseBranch: ["flag-exception"],
          },
          conditions: [{ field: "steps.perform-match.output.matched", operator: "eq", value: true }],
        },
        {
          id: "approve-invoice",
          name: "Auto-Approve Invoice",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "vendor_invoices",
              id: "{{trigger.data.id}}",
              data: { status: "approved", matchedAt: "{{now}}", autoMatched: true },
            },
          },
        },
        {
          id: "flag-exception",
          name: "Flag for Review",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "invoice_exceptions",
              data: {
                invoiceId: "{{trigger.data.id}}",
                exceptions: "{{steps.perform-match.output.exceptions}}",
                status: "pending_review",
              },
            },
          },
        },
      ],
    },
    variables: [
      { name: "tolerancePercent", type: "number", description: "Matching tolerance percentage", required: false, default: 2 },
    ],
  },
  {
    id: "purchase-requisition-approval",
    name: "Purchase Requisition Approval",
    description: "Route purchase requisitions for approval",
    category: "procurement",
    tags: ["requisitions", "approval", "purchasing"],
    workflow: {
      name: "Purchase Requisition Approval",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "purchase_requisition.submitted" },
      },
      steps: [
        {
          id: "determine-approvers",
          name: "Determine Approval Chain",
          type: "action",
          config: {
            actionType: "getApprovalChain",
            parameters: {
              type: "purchase_requisition",
              amount: "{{trigger.data.totalAmount}}",
              departmentId: "{{trigger.data.departmentId}}",
            },
          },
        },
        {
          id: "create-approval-request",
          name: "Create Approval Request",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "approval_requests",
              data: {
                entityType: "purchase_requisition",
                entityId: "{{trigger.data.id}}",
                approvers: "{{steps.determine-approvers.output}}",
                currentLevel: 0,
                status: "pending",
              },
            },
          },
        },
        {
          id: "notify-first-approver",
          name: "Notify First Approver",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{steps.determine-approvers.output[0].userId}}"],
            template: "requisition-approval-request",
            data: { requisition: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "contract-expiration-management",
    name: "Contract Expiration Management",
    description: "Manage vendor contract expirations and renewals",
    category: "procurement",
    tags: ["contracts", "expiration", "renewals"],
    workflow: {
      name: "Contract Expiration Management",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "find-expiring",
          name: "Find Expiring Contracts",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendor_contracts",
              filters: {
                expirationDate: { $lte: "{{now + 90d}}", $gte: "{{now}}" },
                status: "active",
              },
              include: ["vendor"],
            },
          },
        },
        {
          id: "categorize-contracts",
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
          name: "Process Urgent Contracts",
          type: "loop",
          config: {
            collection: "{{categorized.urgent}}",
            itemVariable: "contract",
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
                name: "Renew contract: {{contract.vendor.name}}",
                description: "Contract expires: {{contract.expirationDate}}",
                dueDate: "{{contract.expirationDate - 14d}}",
                assigneeId: "{{contract.ownerId}}",
                priority: "high",
              },
            },
          },
        },
        {
          id: "notify-owner",
          name: "Notify Contract Owner",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{contract.ownerId}}"],
            template: "contract-expiring-urgent",
            data: { contract: "{{contract}}" },
          },
        },
      ],
    },
    variables: [],
  },
];
