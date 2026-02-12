import { defineSchema } from '../schema/defineSchema';

/**
 * INSURANCE POLICY ENTITY SCHEMA (SSOT)
 */
export const insuranceSchema = defineSchema({
  identity: {
    name: 'Insurance Policy',
    namePlural: 'Insurance Policies',
    slug: 'productions/compliance/insurance',
    icon: 'Shield',
    description: 'Insurance policies and certificates',
  },

  data: {
    endpoint: '/api/certificates-of-insurance',
    primaryKey: 'id',
    fields: {
      policy_number: {
        type: 'text',
        label: 'Policy Number',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      policy_type: {
        type: 'select',
        label: 'Policy Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'General Liability', value: 'general_liability' },
          { label: 'Workers Comp', value: 'workers_comp' },
          { label: 'Property', value: 'property' },
          { label: 'Auto', value: 'auto' },
          { label: 'Umbrella', value: 'umbrella' },
          { label: 'Event Cancellation', value: 'event_cancellation' },
        ],
      },
      provider: {
        type: 'text',
        label: 'Provider',
        inTable: true,
        inForm: true,
      },
      coverage_amount: {
        type: 'currency',
        label: 'Coverage Amount',
        inTable: true,
        inForm: true,
      },
      premium: {
        type: 'currency',
        label: 'Premium',
        inForm: true,
        inDetail: true,
      },
      start_date: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        required: true,
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Expired', value: 'expired' },
          { label: 'Pending', value: 'pending' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      document_url: {
        type: 'file',
        label: 'Policy Document',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.name || record.policy_number || 'Insurance Policy',
    subtitle: (record) => record.policy_type || '',
    badge: (record) => {
      if (record.status === 'active') return { label: 'Active', variant: 'success' };
      if (record.status === 'expired') return { label: 'Expired', variant: 'destructive' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'end_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'policy_number', 'provider'],
    placeholder: 'Search insurance policies...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'expiring', label: 'Expiring Soon', query: { where: {} } },
    ],
    advanced: ['policy_type', 'status', 'provider'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
        { key: 'all', label: 'All Policies', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'documents', label: 'Documents', content: { type: 'related', entity: 'documents', foreignKey: 'insurance_id' } },
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
          title: 'Policy Details',
          fields: ['name', 'policy_number', 'policy_type', 'provider', 'status'],
        },
        {
          key: 'coverage',
          title: 'Coverage',
          fields: ['coverage_amount', 'premium', 'start_date', 'end_date'],
        },
        {
          key: 'documents',
          title: 'Documents',
          fields: ['document_url', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        'policy_type',
        'provider',
        { field: 'coverage_amount', format: { type: 'currency' } },
        { field: 'end_date', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/productions/compliance/insurance/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/productions/compliance/insurance/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Policy', variant: 'primary', handler: { type: 'navigate', path: () => '/productions/compliance/insurance/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
