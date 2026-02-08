import { defineSchema } from '../schema/defineSchema';

/**
 * PAYMENT MILESTONE ENTITY SCHEMA (SSOT)
 *
 * Progressive billing milestones tied to budgets.
 * Supports deposit scheduling (50/25/25), phase-triggered billing,
 * and deliverable-based invoicing for live production workflows.
 */
export const paymentMilestoneSchema = defineSchema({
  identity: {
    name: 'Payment Milestone',
    namePlural: 'Payment Milestones',
    slug: 'modules/finance/payment-milestones',
    icon: 'Milestone',
    description: 'Progressive billing milestones for budget-based invoicing',
  },

  data: {
    endpoint: '/api/payment-milestones',
    primaryKey: 'id',
    fields: {
      budget_id: {
        type: 'relation',
        label: 'Budget',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'budget', display: 'name' },
      },
      name: {
        type: 'text',
        label: 'Milestone Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
        placeholder: 'e.g., Deposit on Signing, Load-In Payment, Final Settlement',
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      milestone_order: {
        type: 'number',
        label: 'Order',
        required: true,
        inTable: true,
        inForm: true,
        default: 0,
      },
      percentage: {
        type: 'number',
        label: 'Percentage of Budget',
        inTable: true,
        inForm: true,
        helpText: 'Leave blank if using fixed amount',
      },
      fixed_amount: {
        type: 'currency',
        label: 'Fixed Amount',
        inTable: true,
        inForm: true,
        helpText: 'Leave blank if using percentage',
      },
      trigger_type: {
        type: 'select',
        label: 'Trigger',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Manual', value: 'manual', color: 'gray' },
          { label: 'Date', value: 'date', color: 'blue' },
          { label: 'Phase Completion', value: 'phase_completion', color: 'purple' },
          { label: 'Deliverable', value: 'deliverable', color: 'green' },
          { label: 'Event Date', value: 'event_date', color: 'orange' },
        ],
        default: 'manual',
      },
      trigger_date: {
        type: 'date',
        label: 'Trigger Date',
        inForm: true,
        inDetail: true,
      },
      trigger_phase: {
        type: 'select',
        label: 'Trigger Phase',
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Contract Signed', value: 'contract_signed' },
          { label: 'Pre-Production Complete', value: 'pre_production' },
          { label: 'Advance Complete', value: 'advance' },
          { label: 'Load-In', value: 'load_in' },
          { label: 'Show Day', value: 'show_day' },
          { label: 'Load-Out Complete', value: 'load_out' },
          { label: 'Settlement', value: 'settlement' },
          { label: 'Post-Mortem', value: 'post_mortem' },
        ],
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'gray' },
          { label: 'Ready to Invoice', value: 'ready', color: 'blue' },
          { label: 'Invoiced', value: 'invoiced', color: 'yellow' },
          { label: 'Paid', value: 'paid', color: 'green' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
        ],
        default: 'pending',
      },
      invoice_id: {
        type: 'relation',
        label: 'Invoice',
        inTable: true,
        inDetail: true,
        relation: { entity: 'invoice', display: 'invoice_number' },
      },
      paid_at: {
        type: 'datetime',
        label: 'Paid At',
        inDetail: true,
      },
    },
    computed: {
      amount: {
        label: 'Amount',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            if (r.fixed_amount) return Number(r.fixed_amount);
            // Percentage-based would need budget total — computed server-side
            return Number(r.fixed_amount) || 0;
          },
        },
        format: 'currency',
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Milestone'),
    subtitle: (r: Record<string, unknown>) => {
      if (r.percentage) return `${r.percentage}% of budget`;
      if (r.fixed_amount) return `$${Number(r.fixed_amount).toLocaleString()}`;
      return '';
    },
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        pending: { label: 'Pending', variant: 'secondary' },
        ready: { label: 'Ready', variant: 'primary' },
        invoiced: { label: 'Invoiced', variant: 'warning' },
        paid: { label: 'Paid', variant: 'success' },
        cancelled: { label: 'Cancelled', variant: 'destructive' },
      };
      return statusMap[String(r.status)] || { label: String(r.status), variant: 'secondary' };
    },
    defaultSort: { field: 'milestone_order', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name'], placeholder: 'Search milestones...' },

  filters: {
    quick: [
      { key: 'ready', label: 'Ready to Invoice', query: { where: { status: 'ready' } } },
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
    ],
    advanced: ['status', 'trigger_type', 'budget_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'ready', label: 'Ready', query: { where: { status: 'ready' } }, count: true },
        { key: 'invoiced', label: 'Invoiced', query: { where: { status: 'invoiced' } }, count: true },
        { key: 'paid', label: 'Paid', query: { where: { status: 'paid' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'amount', label: 'Amount', value: { type: 'field', field: 'fixed_amount' }, format: 'currency' },
        ],
        blocks: [
          { key: 'trigger', title: 'Trigger', content: { type: 'fields', fields: ['trigger_type', 'trigger_date', 'trigger_phase'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Milestone Details', fields: ['budget_id', 'name', 'description', 'milestone_order'] },
        { key: 'amount', title: 'Amount', fields: ['percentage', 'fixed_amount'] },
        { key: 'trigger', title: 'Trigger', fields: ['trigger_type', 'trigger_date', 'trigger_phase', 'due_date'] },
        { key: 'status', title: 'Status', fields: ['status'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'percentage', 'fixed_amount', 'trigger_type', 'due_date', 'status', 'invoice_id'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/budgets/${r.budget_id}/milestones/${r.id}` } },
      { key: 'create-invoice', label: 'Create Invoice', variant: 'primary', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.status === 'ready' },
      { key: 'mark-ready', label: 'Mark Ready', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.status === 'pending' },
    ],
    bulk: [
      { key: 'create-invoices', label: 'Create Invoices for Selected', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'Add Milestone', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
