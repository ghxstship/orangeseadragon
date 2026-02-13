import { defineSchema } from '../schema/defineSchema';

/**
 * STAGE ENTITY SCHEMA (SSOT)
 */
export const stageSchema = defineSchema({
  identity: {
    name: 'Stage',
    namePlural: 'Stages',
    slug: 'productions/stages',
    icon: 'Theater',
    description: 'Event stages and performance areas',
  },

  data: {
    endpoint: '/api/stages',
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
      capacity: {
        type: 'number',
        label: 'Capacity',
        inTable: true,
        inForm: true,
      },
      dimensions: {
        type: 'text',
        label: 'Dimensions',
        inForm: true,
        inDetail: true,
      },
      power_specs: {
        type: 'textarea',
        label: 'Power Specs',
        inForm: true,
        inDetail: true,
      },
      rigging_specs: {
        type: 'textarea',
        label: 'Rigging Specs',
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
    title: (record) => record.name || 'Untitled Stage',
    subtitle: (record) => record.capacity ? `Capacity: ${record.capacity}` : '',
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search stages...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['event_id', 'venue_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Stages', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'runsheets', label: 'Runsheets', content: { type: 'related', entity: 'runsheets', foreignKey: 'stage_id' } },
        { key: 'bookings', label: 'Bookings', content: { type: 'related', entity: 'talent_bookings', foreignKey: 'stage_id' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'specs', title: 'Technical Specs', content: { type: 'fields', fields: ['dimensions', 'power_specs', 'rigging_specs'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Stage Details',
          fields: ['name', 'description', 'event_id', 'venue_id', 'capacity'],
        },
        {
          key: 'specs',
          title: 'Technical Specifications',
          fields: ['dimensions', 'power_specs', 'rigging_specs', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        { field: 'venue_id', format: { type: 'relation', entityType: 'venue' } },
        { field: 'capacity', format: { type: 'number' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/productions/stages/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/productions/stages/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Stage', variant: 'primary', handler: { type: 'navigate', path: () => '/productions/stages/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'venue', foreignKey: 'venue_id', label: 'Venue' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
