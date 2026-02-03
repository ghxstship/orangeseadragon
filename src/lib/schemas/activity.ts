import { defineSchema } from '../schema/defineSchema';

/**
 * ACTIVITY ENTITY SCHEMA (SSOT)
 */
export const activitySchema = defineSchema({
  identity: {
    name: 'Activity',
    namePlural: 'Activities',
    slug: 'business/pipeline/activities',
    icon: 'Activity',
    description: 'Sales and CRM activities',
  },

  data: {
    endpoint: '/api/activities',
    primaryKey: 'id',
    fields: {
      subject: {
        type: 'text',
        label: 'Subject',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      activity_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Call', value: 'call' },
          { label: 'Email', value: 'email' },
          { label: 'Meeting', value: 'meeting' },
          { label: 'Task', value: 'task' },
          { label: 'Note', value: 'note' },
          { label: 'Follow-up', value: 'follow_up' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Planned', value: 'planned' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      company_id: {
        type: 'relation',
        label: 'Company',
        inTable: true,
        inForm: true,
      },
      contact_id: {
        type: 'relation',
        label: 'Contact',
        inTable: true,
        inForm: true,
      },
      deal_id: {
        type: 'relation',
        label: 'Deal',
        inForm: true,
      },
      assigned_to: {
        type: 'relation',
        label: 'Assigned To',
        inTable: true,
        inForm: true,
      },
      due_date: {
        type: 'datetime',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      completed_at: {
        type: 'datetime',
        label: 'Completed At',
        inDetail: true,
      },
      outcome: {
        type: 'textarea',
        label: 'Outcome',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.subject || 'Activity',
    subtitle: (record) => record.activity_type || '',
    badge: (record) => {
      if (record.status === 'completed') return { label: 'Completed', variant: 'success' };
      if (record.status === 'in_progress') return { label: 'In Progress', variant: 'default' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'due_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['subject', 'description'],
    placeholder: 'Search activities...',
  },

  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: { status: { in: ['planned', 'in_progress'] } } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['activity_type', 'status', 'assigned_to', 'company_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'upcoming', label: 'Upcoming', query: { where: { status: { in: ['planned', 'in_progress'] } } } },
        { key: 'all', label: 'All Activities', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
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
          title: 'Activity Details',
          fields: ['subject', 'activity_type', 'status', 'description'],
        },
        {
          key: 'relations',
          title: 'Related To',
          fields: ['company_id', 'contact_id', 'deal_id'],
        },
        {
          key: 'assignment',
          title: 'Assignment',
          fields: ['assigned_to', 'due_date'],
        },
        {
          key: 'outcome',
          title: 'Outcome',
          fields: ['outcome'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['subject', 'activity_type', 'company_id', 'assigned_to', 'due_date', 'status'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/pipeline/activities/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/business/pipeline/activities/${record.id}/edit` } },
      { key: 'complete', label: 'Complete', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Activity', variant: 'primary', handler: { type: 'navigate', path: () => '/business/pipeline/activities/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
