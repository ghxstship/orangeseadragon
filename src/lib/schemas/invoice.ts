import { defineSchema } from '../schema/defineSchema';

/**
 * INVOICE ENTITY SCHEMA (SSOT)
 *
 * Full-featured invoicing with:
 * - Line items with per-line tax and discounts
 * - Invoice types (standard, credit, proforma, recurring)
 * - Direction (receivable vs payable)
 * - Full status lifecycle (draft → sent → viewed → partially_paid → paid)
 * - Budget and payment milestone linking
 * - Payment tracking with amount_due computation
 * - PDF generation support
 * - Progressive billing integration
 */
export const invoiceSchema = defineSchema({
  identity: {
    name: 'invoice',
    namePlural: 'Invoices',
    slug: 'modules/finance/invoices',
    icon: 'Receipt',
    description: 'Invoices and billing with line items',
  },

  data: {
    endpoint: '/api/invoices',
    primaryKey: 'id',
    fields: {
      invoice_number: {
        type: 'text',
        label: 'Invoice #',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      invoice_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Standard', value: 'standard', color: 'blue' },
          { label: 'Credit Note', value: 'credit', color: 'red' },
          { label: 'Proforma', value: 'proforma', color: 'gray' },
          { label: 'Recurring', value: 'recurring', color: 'purple' },
        ],
        default: 'standard',
      },
      direction: {
        type: 'select',
        label: 'Direction',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Receivable (Client owes us)', value: 'receivable', color: 'green' },
          { label: 'Payable (We owe vendor)', value: 'payable', color: 'orange' },
        ],
        default: 'receivable',
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Sent', value: 'sent', color: 'blue' },
          { label: 'Viewed', value: 'viewed', color: 'cyan' },
          { label: 'Partially Paid', value: 'partially_paid', color: 'yellow' },
          { label: 'Paid', value: 'paid', color: 'green' },
          { label: 'Overdue', value: 'overdue', color: 'red' },
          { label: 'Cancelled', value: 'cancelled', color: 'slate' },
          { label: 'Disputed', value: 'disputed', color: 'orange' },
        ],
        default: 'draft',
      },
      company_id: {
        type: 'relation',
        label: 'Client / Company',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'company', display: 'name' },
      },
      contact_id: {
        type: 'relation',
        label: 'Billing Contact',
        inForm: true,
        inDetail: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      project_id: {
        type: 'relation',
        label: 'Project',
        inTable: true,
        inForm: true,
        relation: { entity: 'project', display: 'name' },
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      billing_address: {
        type: 'textarea',
        label: 'Billing Address',
        inForm: true,
        inDetail: true,
      },
      issue_date: {
        type: 'date',
        label: 'Issue Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      // Financial totals
      subtotal: {
        type: 'currency',
        label: 'Subtotal',
        required: true,
        inTable: true,
        inDetail: true,
      },
      tax_rate: {
        type: 'percentage',
        label: 'Tax Rate',
        inForm: true,
        inDetail: true,
        default: 0,
      },
      tax_amount: {
        type: 'currency',
        label: 'Tax Amount',
        inDetail: true,
      },
      discount_amount: {
        type: 'currency',
        label: 'Discount',
        inForm: true,
        inDetail: true,
      },
      total_amount: {
        type: 'currency',
        label: 'Total',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      amount_paid: {
        type: 'currency',
        label: 'Paid',
        inTable: true,
        inDetail: true,
      },
      currency: {
        type: 'text',
        label: 'Currency',
        inForm: true,
        default: 'USD',
      },
      payment_terms: {
        type: 'number',
        label: 'Payment Terms (days)',
        inForm: true,
        default: 30,
      },
      // Notes
      notes: {
        type: 'textarea',
        label: 'Notes (visible to client)',
        inForm: true,
        inDetail: true,
      },
      internal_notes: {
        type: 'textarea',
        label: 'Internal Notes',
        inForm: true,
        inDetail: true,
      },
      // Timestamps
      sent_at: {
        type: 'datetime',
        label: 'Sent At',
        inDetail: true,
      },
      viewed_at: {
        type: 'datetime',
        label: 'Viewed At',
        inDetail: true,
      },
      paid_at: {
        type: 'datetime',
        label: 'Paid At',
        inDetail: true,
      },
    },
    computed: {
      amount_due: {
        label: 'Amount Due',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const total = Number(r.total_amount) || 0;
            const paid = Number(r.amount_paid) || 0;
            return total - paid;
          },
        },
        format: 'currency',
        inTable: true,
        inDetail: true,
      },
      days_overdue: {
        label: 'Days Overdue',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            if (r.status === 'paid' || r.status === 'cancelled' || r.status === 'draft') return 0;
            const due = new Date(String(r.due_date));
            const now = new Date();
            const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
            return diff > 0 ? diff : 0;
          },
        },
        format: 'number',
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.invoice_number || 'Untitled'),
    subtitle: (r: Record<string, unknown>) => `$${Number(r.total_amount || 0).toLocaleString()}`,
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        draft: { label: 'Draft', variant: 'secondary' },
        sent: { label: 'Sent', variant: 'primary' },
        viewed: { label: 'Viewed', variant: 'primary' },
        partially_paid: { label: 'Partial', variant: 'warning' },
        paid: { label: 'Paid', variant: 'success' },
        overdue: { label: 'Overdue', variant: 'destructive' },
        cancelled: { label: 'Cancelled', variant: 'secondary' },
        disputed: { label: 'Disputed', variant: 'warning' },
      };
      return statusMap[String(r.status)] || { label: String(r.status), variant: 'secondary' };
    },
    defaultSort: { field: 'issue_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['invoice_number'],
    placeholder: 'Search invoices...',
  },

  filters: {
    quick: [
      { key: 'unpaid', label: 'Unpaid', query: { where: { status: 'sent' } } },
      { key: 'overdue', label: 'Overdue', query: { where: { status: 'overdue' } } },
      { key: 'receivable', label: 'Receivable', query: { where: { direction: 'receivable' } } },
      { key: 'payable', label: 'Payable', query: { where: { direction: 'payable' } } },
    ],
    advanced: ['status', 'invoice_type', 'direction', 'company_id', 'project_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
        { key: 'sent', label: 'Sent', query: { where: { status: 'sent' } }, count: true },
        { key: 'partially-paid', label: 'Partial', query: { where: { status: 'partially_paid' } }, count: true },
        { key: 'paid', label: 'Paid', query: { where: { status: 'paid' } } },
        { key: 'overdue', label: 'Overdue', query: { where: { status: 'overdue' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'line-items', label: 'Line Items', content: { type: 'related', entity: 'invoice_line_items', foreignKey: 'invoice_id' } },
        { key: 'payments', label: 'Payments', content: { type: 'related', entity: 'payments', foreignKey: 'invoice_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'total', label: 'Total', value: { type: 'field', field: 'total_amount' }, format: 'currency' },
          { key: 'paid', label: 'Paid', value: { type: 'field', field: 'amount_paid' }, format: 'currency' },
          { key: 'due', label: 'Amount Due', value: { type: 'computed', compute: (r: Record<string, unknown>) => (Number(r.total_amount) || 0) - (Number(r.amount_paid) || 0) }, format: 'currency' },
        ],
        blocks: [
          { key: 'dates', title: 'Dates', content: { type: 'fields', fields: ['issue_date', 'due_date', 'sent_at', 'paid_at'] } },
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['invoice_type', 'direction', 'payment_terms', 'currency'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Invoice Details',
          fields: ['invoice_number', 'invoice_type', 'direction', 'status'],
        },
        {
          key: 'client',
          title: 'Client',
          fields: ['company_id', 'contact_id', 'billing_address'],
        },
        {
          key: 'project',
          title: 'Project / Event',
          fields: ['project_id', 'event_id'],
        },
        {
          key: 'financial',
          title: 'Financial',
          fields: ['subtotal', 'tax_rate', 'tax_amount', 'discount_amount', 'total_amount', 'currency', 'payment_terms'],
        },
        {
          key: 'dates',
          title: 'Dates',
          fields: ['issue_date', 'due_date'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['notes', 'internal_notes'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['invoice_number', 'company_id', 'direction', 'total_amount', 'amount_paid', 'amount_due', 'status', 'issue_date', 'due_date', 'days_overdue'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'draft', label: 'Draft', color: 'gray' },
        { value: 'sent', label: 'Sent', color: 'blue' },
        { value: 'partially_paid', label: 'Partial', color: 'yellow' },
        { value: 'paid', label: 'Paid', color: 'green' },
        { value: 'overdue', label: 'Overdue', color: 'red' },
      ],
      card: {
        title: 'invoice_number',
        subtitle: 'company_id',
        fields: ['total_amount', 'due_date'],
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/invoices/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/invoices/${r.id}/edit` } },
      { key: 'send', label: 'Send', variant: 'primary', handler: { type: 'api', endpoint: '/api/invoices/send', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'draft' },
      { key: 'mark-paid', label: 'Mark Paid', handler: { type: 'api', endpoint: '/api/invoices/mark-paid', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'sent' || r.status === 'overdue' || r.status === 'partially_paid' },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
      { key: 'download-pdf', label: 'Download PDF', handler: { type: 'api', endpoint: '/api/invoices/pdf', method: 'GET' } },
      { key: 'create-credit-note', label: 'Create Credit Note', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.status === 'paid' },
    ],
    bulk: [
      { key: 'send', label: 'Send Selected', handler: { type: 'api', endpoint: '/api/invoices/bulk-send', method: 'POST' } },
      { key: 'export', label: 'Export', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Invoice', variant: 'primary', handler: { type: 'navigate', path: () => '/finance/invoices/new' } },
      { key: 'from-quote', label: 'From Quote', handler: { type: 'function', fn: () => {} } },
      { key: 'from-milestone', label: 'From Milestone', handler: { type: 'function', fn: () => {} } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
