import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * GUEST LIST ENTITY SCHEMA (SSOT)
 */
export const guestListSchema = defineSchema({
  identity: {
    name: 'Guest List',
    namePlural: 'Guest Lists',
    slug: 'productions/advancing/guest-lists',
    icon: 'Users',
    description: 'Event guest lists and entries',
  },

  data: {
    endpoint: '/api/guest-lists',
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
      list_type: {
        type: 'select',
        label: 'List Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'VIP', value: 'vip' },
          { label: 'Artist', value: 'artist' },
          { label: 'Media', value: 'media' },
          { label: 'Sponsor', value: 'sponsor' },
          { label: 'Staff', value: 'staff' },
          { label: 'Comp', value: 'comp' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Active', value: 'active' },
          { label: 'Closed', value: 'closed' },
        ],
      },
      max_guests: {
        type: 'number',
        label: 'Max Guests',
        inTable: true,
        inForm: true,
      },
      current_count: {
        type: 'number',
        label: 'Current Count',
        inTable: true,
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
    title: (record) => record.name || 'Guest List',
    subtitle: (record) => record.list_type || '',
    badge: (record) => {
      if (record.status === 'active') return { label: 'Active', variant: 'success' };
      if (record.status === 'draft') return { label: 'Draft', variant: 'secondary' };
      return { label: record.status, variant: 'default' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search guest lists...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['list_type', 'status', 'event_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Lists', query: { where: {} } },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'entries', label: 'Entries', content: { type: 'related', entity: 'guest_list_entries', foreignKey: 'guest_list_id' } },
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
          title: 'List Details',
          fields: ['name', 'event_id', 'list_type', 'status', 'max_guests', 'notes'],
        },
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        'list_type',
        { field: 'current_count', format: { type: 'number' } },
        { field: 'max_guests', format: { type: 'number' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/productions/advancing/guest-lists/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/productions/advancing/guest-lists/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Guest List', variant: 'primary', handler: { type: 'navigate', path: () => '/productions/advancing/guest-lists/new' } }
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
