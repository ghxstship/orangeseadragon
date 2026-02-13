import { defineSchema } from '../schema/defineSchema';

/**
 * CHECKLIST ENTITY SCHEMA (SSOT)
 */
export const checklistSchema = defineSchema({
  identity: {
    name: 'Checklist',
    namePlural: 'Checklists',
    slug: 'core/tasks/checklists',
    icon: 'ListChecks',
    description: 'Manage checklists and checklist items',
  },

  data: {
    endpoint: '/api/checklists',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        placeholder: 'Enter checklist name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Not Started', value: 'not_started' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
        ],
      },
      entity_type: {
        type: 'text',
        label: 'Entity Type',
        inTable: true,
        inForm: true,
      },
      entity_id: {
        type: 'text',
        label: 'Entity ID',
        inForm: true,
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      assigned_to: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inForm: true,
      },
      completed_at: {
        type: 'datetime',
        label: 'Completed At',
        inDetail: true,
      },
      progress_percent: {
        type: 'number',
        label: 'Progress',
        inTable: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Untitled Checklist',
    subtitle: (record) => `${record.progress_percent || 0}% complete`,
    badge: (record) => {
      if (record.status === 'completed') return { label: 'Complete', variant: 'success' };
      if (record.status === 'in_progress') return { label: 'In Progress', variant: 'default' };
      return { label: 'Not Started', variant: 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search checklists...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'active', label: 'Active', query: { where: { status: { neq: 'completed' } } } },
      { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
    ],
    advanced: ['status', 'assigned_to', 'due_date'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Checklists', query: { where: {} } },
        { key: 'active', label: 'Active', query: { where: { status: { neq: 'completed' } } } },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Items', content: { type: 'related', entity: 'checklist_items', foreignKey: 'checklist_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Checklist Details', content: { type: 'fields', fields: ['description', 'due_date', 'status'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Checklist Details',
          fields: ['name', 'description', 'status'],
        },
        {
          key: 'assignment',
          title: 'Assignment',
          fields: ['assigned_to', 'due_date', 'entity_type', 'entity_id'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        { field: 'progress_percent', format: { type: 'percentage' } },
        { field: 'due_date', format: { type: 'date' } },
        { field: 'assigned_to', format: { type: 'relation', entityType: 'person' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/tasks/checklists/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/core/tasks/checklists/${record.id}/edit` } },
    ],
    bulk: [
      { key: 'complete', label: 'Mark Complete', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Checklist', variant: 'primary', handler: { type: 'navigate', path: () => '/core/tasks/checklists/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'assigned_to', label: 'Assigned To' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
