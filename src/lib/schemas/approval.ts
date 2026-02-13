import { defineSchema } from '../schema/defineSchema';

/**
 * APPROVAL REQUEST ENTITY SCHEMA (SSOT)
 */
export const approvalSchema = defineSchema({
  identity: {
    name: 'Approval',
    namePlural: 'Approvals',
    slug: 'core/inbox/approvals',
    icon: 'CheckCircle',
    description: 'Approval requests and decisions',
  },

  data: {
    endpoint: '/api/approvals',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inDetail: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inTable: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Escalated', value: 'escalated' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      entity_type: {
        type: 'text',
        label: 'Entity Type',
        inTable: true,
        inDetail: true,
      },
      entity_id: {
        type: 'text',
        label: 'Entity ID',
        inDetail: true,
      },
      requested_by: {
        type: 'relation',
        label: 'Requested By',
        inTable: true,
        inDetail: true,
      },
      assigned_to: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inDetail: true,
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      decided_at: {
        type: 'datetime',
        label: 'Decided At',
        inDetail: true,
      },
      decision_notes: {
        type: 'textarea',
        label: 'Decision Notes',
        inDetail: true,
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Approval Request',
    subtitle: (record) => record.entity_type || '',
    badge: (record) => {
      if (record.status === 'pending') return { label: 'Pending', variant: 'warning' };
      if (record.status === 'approved') return { label: 'Approved', variant: 'success' };
      if (record.status === 'rejected') return { label: 'Rejected', variant: 'destructive' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description'],
    placeholder: 'Search approvals...',
  },

  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'decided', label: 'Decided', query: { where: { status: { in: ['approved', 'rejected'] } } } },
    ],
    advanced: ['status', 'entity_type', 'assigned_to'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } } },
        { key: 'rejected', label: 'Rejected', query: { where: { status: 'rejected' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Request Details', content: { type: 'fields', fields: ['description', 'entity_type', 'due_date'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'decision',
          title: 'Decision',
          fields: ['status', 'decision_notes'],
        },
      ]
    }
  },

  views: {
    table: {
      columns: [
        'title',
        { field: 'entity_type', format: { type: 'badge', colorMap: { budget: '#3b82f6', expense: '#8b5cf6', invoice: '#f59e0b', contract: '#22c55e', timesheet: '#ec4899' } } },
        { field: 'status', format: { type: 'badge', colorMap: { pending: '#eab308', approved: '#22c55e', rejected: '#ef4444', escalated: '#f59e0b' } } },
        { field: 'requested_by', format: { type: 'relation', entityType: 'person' } },
        { field: 'due_date', format: { type: 'date' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/inbox/approvals/${record.id}` } },
      { key: 'approve', label: 'Approve', handler: { type: 'function', fn: () => {} } },
      { key: 'reject', label: 'Reject', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: []
  },
  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'assigned_to', label: 'Assigned To' },
    ],
  },



  permissions: {
    create: false,
    read: true,
    update: true,
    delete: false,
  }
});
