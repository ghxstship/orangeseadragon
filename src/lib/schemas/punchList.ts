import { defineSchema } from '../schema/defineSchema';

/**
 * PUNCH LIST ENTITY SCHEMA (SSOT)
 */
export const punchListSchema = defineSchema({
  identity: {
    name: 'Punch List',
    namePlural: 'Punch Lists',
    slug: 'operations/incidents/punch-lists',
    icon: 'ClipboardList',
    description: 'Deficiency and fix items',
  },

  data: {
    endpoint: '/api/punch-lists',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      venue_id: {
        type: 'relation',
        relation: { entity: 'venue', display: 'name', searchable: true },
        label: 'Venue',
        inTable: true,
        inForm: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      priority: {
        type: 'select',
        label: 'Priority',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Critical', value: 'critical' },
          { label: 'High', value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low', value: 'low' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Open', value: 'open' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Verified', value: 'verified' },
          { label: 'Deferred', value: 'deferred' },
        ],
      },
      assigned_to: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inForm: true,
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
      },
      resolved_at: {
        type: 'datetime',
        label: 'Resolved At',
        inDetail: true,
      },
      photos: {
        type: 'file',
        label: 'Photos',
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
    title: (record) => record.title || 'Punch List Item',
    subtitle: (record) => record.location || '',
    badge: (record) => {
      if (record.priority === 'critical') return { label: 'Critical', variant: 'destructive' };
      if (record.priority === 'high') return { label: 'High', variant: 'warning' };
      if (record.status === 'resolved') return { label: 'Resolved', variant: 'success' };
      return { label: record.status, variant: 'default' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description', 'location'],
    placeholder: 'Search punch lists...',
  },

  filters: {
    quick: [
      { key: 'open', label: 'Open', query: { where: { status: 'open' } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['status', 'priority', 'assigned_to', 'event_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'open', label: 'Open', query: { where: { status: { in: ['open', 'in_progress'] } } } },
        { key: 'all', label: 'All Items', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
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
          title: 'Item Details',
          fields: ['title', 'description', 'event_id', 'venue_id', 'location'],
        },
        {
          key: 'assignment',
          title: 'Assignment',
          fields: ['priority', 'status', 'assigned_to', 'due_date'],
        },
        {
          key: 'documentation',
          title: 'Documentation',
          fields: ['photos', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'title',
        'location',
        { field: 'priority', format: { type: 'badge', colorMap: { urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', critical: '#ef4444', none: '#6b7280' } } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        { field: 'assigned_to', format: { type: 'relation', entityType: 'person' } },
        { field: 'due_date', format: { type: 'date' } },
      ],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'open', label: 'Open', color: 'gray' },
        { value: 'in_progress', label: 'In Progress', color: 'blue' },
        { value: 'resolved', label: 'Resolved', color: 'green' },
        { value: 'verified', label: 'Verified', color: 'purple' },
      ],
      card: {
        title: 'title',
        subtitle: 'location',
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/operations/incidents/punch-lists/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/operations/incidents/punch-lists/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Item', variant: 'primary', handler: { type: 'navigate', path: () => '/operations/incidents/punch-lists/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'venue', foreignKey: 'venue_id', label: 'Venue' },
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
