import { defineSchema } from '../schema/defineSchema';

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
      columns: ['name', 'event_id', 'list_type', 'current_count', 'max_guests', 'status'],
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

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
