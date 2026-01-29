/**
 * Finance Workflow Templates
 * Implements 12 additional workflows for finance automation
 */

import type { WorkflowTemplate } from "./types";

export const financeExtendedTemplates: WorkflowTemplate[] = [
  {
    id: "payment-reconciliation",
    name: "Payment Reconciliation",
    description: "Automatically reconcile payments with invoices",
    category: "finance",
    tags: ["payments", "reconciliation", "invoices"],
    workflow: {
      name: "Payment Reconciliation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "payment.received" },
      },
      steps: [
        {
          id: "find-matching-invoice",
          name: "Find Matching Invoice",
          type: "action",
          config: {
            actionType: "matchPaymentToInvoice",
            parameters: {
              paymentId: "{{trigger.data.id}}",
              amount: "{{trigger.data.amount}}",
              reference: "{{trigger.data.reference}}",
              payerId: "{{trigger.data.payerId}}",
            },
          },
        },
        {
          id: "check-match-found",
          name: "Check if Match Found",
          type: "condition",
          config: {
            expression: "{{steps.find-matching-invoice.output.matched}}",
            trueBranch: ["apply-payment"],
            falseBranch: ["flag-for-review"],
          },
          conditions: [{ field: "steps.find-matching-invoice.output.matched", operator: "eq", value: true }],
        },
        {
          id: "apply-payment",
          name: "Apply Payment to Invoice",
          type: "action",
          config: {
            actionType: "applyPaymentToInvoice",
            parameters: {
              paymentId: "{{trigger.data.id}}",
              invoiceId: "{{steps.find-matching-invoice.output.invoiceId}}",
            },
          },
        },
        {
          id: "update-invoice-status",
          name: "Update Invoice Status",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "invoices",
              id: "{{steps.find-matching-invoice.output.invoiceId}}",
              data: {
                status: "{{steps.apply-payment.output.fullyPaid ? 'paid' : 'partial'}}",
                paidAmount: "{{steps.apply-payment.output.totalPaid}}",
                paidAt: "{{steps.apply-payment.output.fullyPaid ? now : null}}",
              },
            },
          },
        },
        {
          id: "flag-for-review",
          name: "Flag for Manual Review",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "reconciliation_exceptions",
              data: {
                paymentId: "{{trigger.data.id}}",
                reason: "no_matching_invoice",
                amount: "{{trigger.data.amount}}",
                status: "pending_review",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "vendor-payment-processing",
    name: "Vendor Payment Processing",
    description: "Process and execute vendor payments",
    category: "finance",
    tags: ["vendors", "payments", "ap"],
    workflow: {
      name: "Vendor Payment Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 10 * * 3", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-approved-invoices",
          name: "Get Approved Vendor Invoices",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "vendor_invoices",
              filters: {
                status: "approved",
                dueDate: { $lte: "{{now + 7d}}" },
              },
              include: ["vendor", "bankAccount"],
            },
          },
        },
        {
          id: "group-by-vendor",
          name: "Group by Vendor",
          type: "transform",
          config: {
            input: "{{steps.get-approved-invoices.output}}",
            output: "groupedPayments",
            transformation: "groupBy(vendorId)",
          },
        },
        {
          id: "process-payments",
          name: "Process Vendor Payments",
          type: "loop",
          config: {
            collection: "{{groupedPayments}}",
            itemVariable: "vendorGroup",
            steps: ["create-payment-batch", "execute-payment"],
          },
        },
        {
          id: "create-payment-batch",
          name: "Create Payment Batch",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "payment_batches",
              data: {
                vendorId: "{{vendorGroup.vendorId}}",
                invoiceIds: "{{vendorGroup.invoices.map(i => i.id)}}",
                totalAmount: "{{vendorGroup.invoices.reduce((sum, i) => sum + i.amount, 0)}}",
                status: "pending",
              },
            },
          },
        },
        {
          id: "execute-payment",
          name: "Execute Payment",
          type: "action",
          config: {
            actionType: "executeVendorPayment",
            parameters: {
              batchId: "{{steps.create-payment-batch.output.id}}",
              paymentMethod: "{{vendorGroup.vendor.preferredPaymentMethod}}",
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "bank-reconciliation",
    name: "Bank Reconciliation",
    description: "Reconcile bank transactions with internal records",
    category: "finance",
    tags: ["banking", "reconciliation", "transactions"],
    workflow: {
      name: "Bank Reconciliation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "bank_feed.imported" },
      },
      steps: [
        {
          id: "get-transactions",
          name: "Get Imported Transactions",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "bank_transactions",
              filters: {
                feedId: "{{trigger.data.feedId}}",
                status: "unreconciled",
              },
            },
          },
        },
        {
          id: "auto-match",
          name: "Auto-Match Transactions",
          type: "loop",
          config: {
            collection: "{{steps.get-transactions.output}}",
            itemVariable: "txn",
            steps: ["find-match", "apply-match"],
          },
        },
        {
          id: "find-match",
          name: "Find Matching Record",
          type: "action",
          config: {
            actionType: "findBankTransactionMatch",
            parameters: {
              transaction: "{{txn}}",
              matchingRules: ["exact_amount", "reference_match", "date_proximity"],
            },
          },
        },
        {
          id: "apply-match",
          name: "Apply Match if Found",
          type: "condition",
          config: {
            expression: "{{steps.find-match.output.confidence}}",
            trueBranch: ["reconcile-transaction"],
            falseBranch: [],
          },
          conditions: [{ field: "steps.find-match.output.confidence", operator: "gte", value: 0.9 }],
        },
        {
          id: "reconcile-transaction",
          name: "Reconcile Transaction",
          type: "action",
          config: {
            actionType: "reconcileBankTransaction",
            parameters: {
              transactionId: "{{txn.id}}",
              matchedRecordId: "{{steps.find-match.output.matchedId}}",
              matchedRecordType: "{{steps.find-match.output.matchedType}}",
            },
          },
        },
        {
          id: "generate-report",
          name: "Generate Reconciliation Report",
          type: "action",
          config: {
            actionType: "generateReconciliationReport",
            parameters: { feedId: "{{trigger.data.feedId}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "revenue-recognition",
    name: "Revenue Recognition",
    description: "Automate revenue recognition based on delivery milestones",
    category: "finance",
    tags: ["revenue", "recognition", "accounting"],
    workflow: {
      name: "Revenue Recognition",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "milestone.completed" },
      },
      steps: [
        {
          id: "get-contract",
          name: "Get Contract Details",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "contracts",
              filters: { id: "{{trigger.data.contractId}}" },
              include: ["revenueSchedule", "milestones"],
            },
          },
        },
        {
          id: "calculate-recognition",
          name: "Calculate Revenue to Recognize",
          type: "action",
          config: {
            actionType: "calculateRevenueRecognition",
            parameters: {
              contract: "{{steps.get-contract.output[0]}}",
              milestone: "{{trigger.data}}",
              method: "{{steps.get-contract.output[0].revenueRecognitionMethod}}",
            },
          },
        },
        {
          id: "create-journal-entry",
          name: "Create Journal Entry",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "journal_entries",
              data: {
                date: "{{now}}",
                description: "Revenue recognition: {{trigger.data.name}}",
                lines: [
                  {
                    accountId: "{{steps.get-contract.output[0].deferredRevenueAccountId}}",
                    debit: "{{steps.calculate-recognition.output.amount}}",
                    credit: 0,
                  },
                  {
                    accountId: "{{steps.get-contract.output[0].revenueAccountId}}",
                    debit: 0,
                    credit: "{{steps.calculate-recognition.output.amount}}",
                  },
                ],
                sourceType: "revenue_recognition",
                sourceId: "{{trigger.data.id}}",
              },
            },
          },
        },
        {
          id: "update-schedule",
          name: "Update Revenue Schedule",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "revenue_schedules",
              id: "{{steps.get-contract.output[0].revenueSchedule.id}}",
              data: {
                recognizedAmount: "{{steps.get-contract.output[0].revenueSchedule.recognizedAmount + steps.calculate-recognition.output.amount}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "tax-calculation",
    name: "Tax Calculation & Filing Prep",
    description: "Calculate taxes and prepare filing data",
    category: "finance",
    tags: ["tax", "calculation", "compliance"],
    workflow: {
      name: "Tax Calculation & Filing Prep",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 6 1 * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-taxable-transactions",
          name: "Get Taxable Transactions",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "transactions",
              filters: {
                date: { $gte: "{{startOfMonth(now - 1M)}}", $lt: "{{startOfMonth(now)}}" },
                taxable: true,
              },
            },
          },
        },
        {
          id: "calculate-taxes",
          name: "Calculate Tax Amounts",
          type: "action",
          config: {
            actionType: "calculateTaxes",
            parameters: {
              transactions: "{{steps.get-taxable-transactions.output}}",
              period: "{{formatDate(now - 1M, 'YYYY-MM')}}",
            },
          },
        },
        {
          id: "create-tax-report",
          name: "Create Tax Report",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tax_reports",
              data: {
                period: "{{formatDate(now - 1M, 'YYYY-MM')}}",
                salesTax: "{{steps.calculate-taxes.output.salesTax}}",
                vatCollected: "{{steps.calculate-taxes.output.vatCollected}}",
                vatPaid: "{{steps.calculate-taxes.output.vatPaid}}",
                netVat: "{{steps.calculate-taxes.output.netVat}}",
                status: "draft",
              },
            },
          },
        },
        {
          id: "notify-finance",
          name: "Notify Finance Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["finance@company.com"],
            template: "tax-report-ready",
            data: { report: "{{steps.create-tax-report.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "financial-period-close",
    name: "Financial Period Close",
    description: "Automate month-end and year-end closing procedures",
    category: "finance",
    tags: ["period-close", "month-end", "accounting"],
    workflow: {
      name: "Financial Period Close",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "period_close.initiated" },
      },
      steps: [
        {
          id: "run-validations",
          name: "Run Pre-Close Validations",
          type: "action",
          config: {
            actionType: "runPeriodCloseValidations",
            parameters: {
              period: "{{trigger.data.period}}",
              checks: ["unposted_entries", "unreconciled_accounts", "pending_approvals"],
            },
          },
        },
        {
          id: "check-validations",
          name: "Check Validation Results",
          type: "condition",
          config: {
            expression: "{{steps.run-validations.output.passed}}",
            trueBranch: ["accrue-expenses"],
            falseBranch: ["notify-issues"],
          },
          conditions: [{ field: "steps.run-validations.output.passed", operator: "eq", value: true }],
        },
        {
          id: "notify-issues",
          name: "Notify of Blocking Issues",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.initiatorId}}"],
            template: "period-close-blocked",
            data: { issues: "{{steps.run-validations.output.issues}}" },
          },
        },
        {
          id: "accrue-expenses",
          name: "Create Accrual Entries",
          type: "action",
          config: {
            actionType: "createAccrualEntries",
            parameters: { period: "{{trigger.data.period}}" },
          },
        },
        {
          id: "depreciation",
          name: "Run Depreciation",
          type: "action",
          config: {
            actionType: "runDepreciation",
            parameters: { period: "{{trigger.data.period}}" },
          },
        },
        {
          id: "close-period",
          name: "Close Period",
          type: "action",
          config: {
            actionType: "closePeriod",
            parameters: { period: "{{trigger.data.period}}" },
          },
        },
        {
          id: "generate-reports",
          name: "Generate Financial Reports",
          type: "action",
          config: {
            actionType: "generateFinancialReports",
            parameters: {
              period: "{{trigger.data.period}}",
              reports: ["income_statement", "balance_sheet", "cash_flow"],
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "multi-currency-conversion",
    name: "Multi-Currency Conversion",
    description: "Handle multi-currency transactions and conversions",
    category: "finance",
    tags: ["currency", "conversion", "forex"],
    workflow: {
      name: "Multi-Currency Conversion",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "transaction.created" },
      },
      steps: [
        {
          id: "check-currency",
          name: "Check if Foreign Currency",
          type: "condition",
          config: {
            expression: "{{trigger.data.currency}}",
            trueBranch: ["get-exchange-rate"],
            falseBranch: [],
          },
          conditions: [{ field: "trigger.data.currency", operator: "ne", value: "{{org.baseCurrency}}" }],
        },
        {
          id: "get-exchange-rate",
          name: "Get Exchange Rate",
          type: "action",
          config: {
            actionType: "getExchangeRate",
            parameters: {
              fromCurrency: "{{trigger.data.currency}}",
              toCurrency: "{{org.baseCurrency}}",
              date: "{{trigger.data.date}}",
            },
          },
        },
        {
          id: "convert-amount",
          name: "Convert to Base Currency",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "transactions",
              id: "{{trigger.data.id}}",
              data: {
                baseCurrencyAmount: "{{trigger.data.amount * steps.get-exchange-rate.output.rate}}",
                exchangeRate: "{{steps.get-exchange-rate.output.rate}}",
                exchangeRateDate: "{{steps.get-exchange-rate.output.date}}",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "journal-entry-automation",
    name: "Journal Entry Automation",
    description: "Automatically create journal entries from source documents",
    category: "finance",
    tags: ["journal", "entries", "automation"],
    workflow: {
      name: "Journal Entry Automation",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "invoice.posted" },
      },
      steps: [
        {
          id: "get-accounting-rules",
          name: "Get Accounting Rules",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "accounting_rules",
              filters: { sourceType: "invoice", isActive: true },
            },
          },
        },
        {
          id: "generate-lines",
          name: "Generate Journal Lines",
          type: "action",
          config: {
            actionType: "generateJournalLines",
            parameters: {
              source: "{{trigger.data}}",
              rules: "{{steps.get-accounting-rules.output}}",
            },
          },
        },
        {
          id: "create-entry",
          name: "Create Journal Entry",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "journal_entries",
              data: {
                date: "{{trigger.data.date}}",
                description: "Invoice: {{trigger.data.number}}",
                lines: "{{steps.generate-lines.output}}",
                sourceType: "invoice",
                sourceId: "{{trigger.data.id}}",
                status: "posted",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "credit-memo-processing",
    name: "Credit Memo Processing",
    description: "Process credit memos and apply to invoices",
    category: "finance",
    tags: ["credit-memo", "invoices", "ar"],
    workflow: {
      name: "Credit Memo Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "credit_memo.approved" },
      },
      steps: [
        {
          id: "get-open-invoices",
          name: "Get Open Invoices",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "invoices",
              filters: {
                customerId: "{{trigger.data.customerId}}",
                status: { $in: ["sent", "partial"] },
              },
              orderBy: { dueDate: "asc" },
            },
          },
        },
        {
          id: "apply-credit",
          name: "Apply Credit to Invoices",
          type: "action",
          config: {
            actionType: "applyCreditMemo",
            parameters: {
              creditMemoId: "{{trigger.data.id}}",
              invoices: "{{steps.get-open-invoices.output}}",
              applicationMethod: "oldest_first",
            },
          },
        },
        {
          id: "update-credit-memo",
          name: "Update Credit Memo Status",
          type: "action",
          config: {
            actionType: "updateEntity",
            parameters: {
              entity: "credit_memos",
              id: "{{trigger.data.id}}",
              data: {
                status: "{{steps.apply-credit.output.remainingAmount > 0 ? 'partial' : 'applied'}}",
                appliedAmount: "{{steps.apply-credit.output.appliedAmount}}",
              },
            },
          },
        },
        {
          id: "notify-customer",
          name: "Notify Customer",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customer.email}}"],
            template: "credit-memo-applied",
            data: { creditMemo: "{{trigger.data}}", applications: "{{steps.apply-credit.output}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "aging-report-alerts",
    name: "Aging Report Alerts",
    description: "Generate aging reports and alert on overdue accounts",
    category: "finance",
    tags: ["aging", "ar", "collections"],
    workflow: {
      name: "Aging Report Alerts",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 7 * * 1", timezone: "UTC" },
      },
      steps: [
        {
          id: "generate-aging",
          name: "Generate Aging Report",
          type: "action",
          config: {
            actionType: "generateAgingReport",
            parameters: {
              asOfDate: "{{now}}",
              buckets: [0, 30, 60, 90, 120],
            },
          },
        },
        {
          id: "identify-critical",
          name: "Identify Critical Accounts",
          type: "action",
          config: {
            actionType: "filterAgingReport",
            parameters: {
              report: "{{steps.generate-aging.output}}",
              criteria: { daysOverdue: { $gte: 60 }, amount: { $gte: 1000 } },
            },
          },
        },
        {
          id: "notify-collections",
          name: "Notify Collections Team",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["collections@company.com"],
            template: "aging-report-summary",
            data: {
              report: "{{steps.generate-aging.output}}",
              criticalAccounts: "{{steps.identify-critical.output}}",
            },
          },
        },
        {
          id: "create-collection-tasks",
          name: "Create Collection Tasks",
          type: "loop",
          config: {
            collection: "{{steps.identify-critical.output}}",
            itemVariable: "account",
            steps: ["create-task"],
          },
        },
        {
          id: "create-task",
          name: "Create Collection Task",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "tasks",
              data: {
                name: "Follow up: {{account.customerName}}",
                description: "Overdue amount: {{account.totalOverdue}}",
                dueDate: "{{now + 3d}}",
                priority: "high",
                category: "collections",
              },
            },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "refund-processing",
    name: "Refund Processing",
    description: "Process and execute customer refunds",
    category: "finance",
    tags: ["refunds", "payments", "ar"],
    workflow: {
      name: "Refund Processing",
      version: 1,
      status: "active",
      trigger: {
        type: "event",
        config: { eventType: "refund.approved" },
      },
      steps: [
        {
          id: "validate-refund",
          name: "Validate Refund Request",
          type: "action",
          config: {
            actionType: "validateRefund",
            parameters: {
              refundId: "{{trigger.data.id}}",
              originalPaymentId: "{{trigger.data.originalPaymentId}}",
            },
          },
        },
        {
          id: "execute-refund",
          name: "Execute Refund",
          type: "action",
          config: {
            actionType: "executeRefund",
            parameters: {
              refundId: "{{trigger.data.id}}",
              amount: "{{trigger.data.amount}}",
              method: "{{trigger.data.refundMethod}}",
            },
          },
        },
        {
          id: "create-journal-entry",
          name: "Create Refund Journal Entry",
          type: "action",
          config: {
            actionType: "createEntity",
            parameters: {
              entity: "journal_entries",
              data: {
                date: "{{now}}",
                description: "Refund: {{trigger.data.reference}}",
                lines: [
                  { accountId: "{{org.revenueAccountId}}", debit: "{{trigger.data.amount}}", credit: 0 },
                  { accountId: "{{org.cashAccountId}}", debit: 0, credit: "{{trigger.data.amount}}" },
                ],
                sourceType: "refund",
                sourceId: "{{trigger.data.id}}",
              },
            },
          },
        },
        {
          id: "notify-customer",
          name: "Notify Customer",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{trigger.data.customer.email}}"],
            template: "refund-processed",
            data: { refund: "{{trigger.data}}" },
          },
        },
      ],
    },
    variables: [],
  },
  {
    id: "budget-variance-analysis",
    name: "Budget Variance Analysis",
    description: "Analyze budget vs actual and alert on variances",
    category: "finance",
    tags: ["budget", "variance", "analysis"],
    workflow: {
      name: "Budget Variance Analysis",
      version: 1,
      status: "active",
      trigger: {
        type: "schedule",
        config: { cron: "0 8 1 * *", timezone: "UTC" },
      },
      steps: [
        {
          id: "get-budgets",
          name: "Get Active Budgets",
          type: "action",
          config: {
            actionType: "query",
            parameters: {
              entity: "budgets",
              filters: { status: "active", period: "{{formatDate(now - 1M, 'YYYY-MM')}}" },
            },
          },
        },
        {
          id: "calculate-variances",
          name: "Calculate Variances",
          type: "action",
          config: {
            actionType: "calculateBudgetVariances",
            parameters: {
              budgets: "{{steps.get-budgets.output}}",
              period: "{{formatDate(now - 1M, 'YYYY-MM')}}",
            },
          },
        },
        {
          id: "identify-significant",
          name: "Identify Significant Variances",
          type: "action",
          config: {
            actionType: "filterVariances",
            parameters: {
              variances: "{{steps.calculate-variances.output}}",
              threshold: 0.1,
            },
          },
        },
        {
          id: "notify-managers",
          name: "Notify Budget Managers",
          type: "loop",
          config: {
            collection: "{{steps.identify-significant.output}}",
            itemVariable: "variance",
            steps: ["send-variance-alert"],
          },
        },
        {
          id: "send-variance-alert",
          name: "Send Variance Alert",
          type: "notification",
          config: {
            channel: "email",
            recipients: ["{{variance.budget.ownerId}}"],
            template: "budget-variance-alert",
            data: { variance: "{{variance}}" },
          },
        },
      ],
    },
    variables: [
      { name: "varianceThreshold", type: "number", description: "Variance threshold percentage", required: false, default: 0.1 },
    ],
  },
];
