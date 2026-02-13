import { defineSchema } from '../schema/defineSchema';

/**
 * CREDIT NOTE ENTITY SCHEMA (SSOT)
 */
export const creditNoteSchema = defineSchema({
  identity: {
    name: 'Credit Note',
    namePlural: 'Credit Notes',
    slug: 'finance/invoices/credit-notes',
    icon: 'FileText',
    description: 'Invoice credit notes and adjustments',
  },

  data: {
    endpoint: '/api/credit-notes',
    primaryKey: 'id',
    fields: {
      credit_note_number: {
        type: 'text',
        label: 'Credit Note #',
        required: true,
        inTable: true,
        inDetail: true,
        searchable: true,
      },
      invoice_id: {
        type: 'relation',
        relation: { entity: 'invoice', display: 'invoice_number' },
        label: 'Invoice',
        required: true,
        inTable: true,
        inForm: true,
      },
      customer_id: {
        type: 'relation',
        label: 'Customer',
        inTable: true,
        inForm: true,
      },
      issue_date: {
        type: 'date',
        label: 'Issue Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      amount: {
        type: 'currency',
        label: 'Amount',
        required: true,
        inTable: true,
        inForm: true,
      },
      reason: {
        type: 'select',
        label: 'Reason',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Refund', value: 'refund' },
          { label: 'Discount', value: 'discount' },
          { label: 'Error Correction', value: 'error_correction' },
          { label: 'Return', value: 'return' },
          { label: 'Cancellation', value: 'cancellation' },
          { label: 'Other', value: 'other' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Issued', value: 'issued' },
          { label: 'Applied', value: 'applied' },
          { label: 'Voided', value: 'voided' },
        ],
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      applied_date: {
        type: 'date',
        label: 'Applied Date',
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.credit_note_number || 'Credit Note',
    subtitle: (record) => record.reason || '',
    badge: (record) => {
      if (record.status === 'applied') return { label: 'Applied', variant: 'success' };
      if (record.status === 'issued') return { label: 'Issued', variant: 'default' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'issue_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['credit_note_number', 'description'],
    placeholder: 'Search credit notes...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'pending', label: 'Pending', query: { where: { status: { in: ['draft', 'issued'] } } } },
    ],
    advanced: ['status', 'reason', 'customer_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Credit Notes', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Credit Note Details',
          fields: ['invoice_id', 'customer_id', 'issue_date', 'status'],
        },
        {
          key: 'amount',
          title: 'Amount',
          fields: ['amount', 'reason', 'description'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'credit_note_number',
        { field: 'invoice_id', format: { type: 'relation', entityType: 'invoice' } },
        { field: 'customer_id', format: { type: 'relation', entityType: 'customer' } },
        { field: 'amount', format: { type: 'currency' } },
        'reason',
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/finance/invoices/credit-notes/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/finance/invoices/credit-notes/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Credit Note', variant: 'primary', handler: { type: 'navigate', path: () => '/finance/invoices/credit-notes/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'invoice', foreignKey: 'invoice_id', label: 'Invoice' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
