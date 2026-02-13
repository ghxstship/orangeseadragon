import { defineSchema } from '../schema/defineSchema';

/**
 * CREW CALL ENTITY SCHEMA (SSOT)
 */
export const crewCallSchema = defineSchema({
  identity: {
    name: 'Crew Call',
    namePlural: 'Crew Calls',
    slug: 'operations/events/crew-calls',
    icon: 'Users',
    description: 'Crew call sheets and assignments',
  },

  data: {
    endpoint: '/api/crew-calls',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
      },
      date: {
        type: 'date',
        label: 'Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      call_time: {
        type: 'text',
        label: 'Call Time',
        required: true,
        inTable: true,
        inForm: true,
      },
      end_time: {
        type: 'text',
        label: 'End Time',
        inTable: true,
        inForm: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Active', value: 'active' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      crew_count: {
        type: 'number',
        label: 'Crew Count',
        inTable: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Crew Call',
    subtitle: (record) => record.date || '',
    badge: (record) => {
      if (record.status === 'published') return { label: 'Published', variant: 'success' };
      if (record.status === 'draft') return { label: 'Draft', variant: 'secondary' };
      if (record.status === 'active') return { label: 'Active', variant: 'default' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'location'],
    placeholder: 'Search crew calls...',
  },

  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: {} } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['status', 'event_id', 'date'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Crew Calls', query: { where: {} } },
        { key: 'upcoming', label: 'Upcoming', query: { where: { status: { in: ['draft', 'published', 'confirmed'] } } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'assignments', label: 'Assignments', content: { type: 'related', entity: 'crew_assignments', foreignKey: 'crew_call_id' } },
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
          title: 'Call Details',
          fields: ['name', 'event_id', 'date', 'call_time', 'end_time', 'location', 'status', 'notes'],
        },
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        { field: 'date', format: { type: 'date' } },
        'call_time',
        { field: 'crew_count', format: { type: 'number' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', published: '#3b82f6', confirmed: '#22c55e', active: '#f59e0b', completed: '#6b7280', cancelled: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/operations/events/crew-calls/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/operations/events/crew-calls/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Crew Call', variant: 'primary', handler: { type: 'navigate', path: () => '/operations/events/crew-calls/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
