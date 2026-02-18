import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * VENUE ENTITY SCHEMA (SSOT)
 */
export const venueSchema = defineSchema({
  identity: {
    name: 'Venue',
    namePlural: 'Venues',
    slug: 'modules/operations/venues',
    icon: 'MapPin',
    description: 'Manage event venues and locations',
  },

  data: {
    endpoint: '/api/locations',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Venue Name',
        placeholder: 'Enter venue name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      venue_type: {
        type: 'select',
        label: 'Venue Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Indoor', value: 'indoor' },
          { label: 'Outdoor', value: 'outdoor' },
          { label: 'Hybrid', value: 'hybrid' },
          { label: 'Virtual', value: 'virtual' },
        ],
      },
      capacity: {
        type: 'number',
        label: 'Capacity',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      legacy_address: {
        type: 'text',
        label: 'Address',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      legacy_city: {
        type: 'text',
        label: 'City',
        inTable: true,
        inForm: true,
      },
      legacy_state: {
        type: 'text',
        label: 'State/Province',
        inForm: true,
      },
      legacy_country: {
        type: 'text',
        label: 'Country',
        inForm: true,
      },
      contact_name: {
        type: 'text',
        label: 'Contact Name',
        inForm: true,
        inDetail: true,
      },
      contact_email: {
        type: 'email',
        label: 'Contact Email',
        inForm: true,
        inDetail: true,
      },
      contact_phone: {
        type: 'phone',
        label: 'Contact Phone',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      location_type: {
        type: 'text',
        label: 'Location Type',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Untitled Venue',
    subtitle: (record) => record.legacy_city || record.venue_type || '',
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'legacy_address', 'legacy_city'],
    placeholder: 'Search venues...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['venue_type', 'legacy_city', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Venues', query: { where: { location_type: 'venue' } } },
        { key: 'active', label: 'Active', query: { where: { location_type: 'venue', is_active: true } } },
        { key: 'indoor', label: 'Indoor', query: { where: { location_type: 'venue', venue_type: 'indoor' } } },
        { key: 'outdoor', label: 'Outdoor', query: { where: { location_type: 'venue', venue_type: 'outdoor' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid', 'map', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'events', label: 'Events', content: { type: 'related', entity: 'events', foreignKey: 'venue_id' } },
      ],
      overview: {
        stats: [
          { key: 'capacity', label: 'Capacity', value: { type: 'field', field: 'capacity' }, format: 'number' },
        ],
        blocks: [
          { key: 'contact', title: 'Contact Information', content: { type: 'fields', fields: ['contact_name', 'contact_email', 'contact_phone'] } },
          { key: 'location', title: 'Location', content: { type: 'fields', fields: ['legacy_address', 'legacy_city', 'legacy_state', 'legacy_country'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['name', 'venue_type', 'capacity', 'is_active'],
        },
        {
          key: 'location',
          title: 'Location',
          fields: ['legacy_address', 'legacy_city', 'legacy_state', 'legacy_country'],
        },
        {
          key: 'contact',
          title: 'Contact',
          fields: ['contact_name', 'contact_email', 'contact_phone'],
        },
        {
          key: 'notes',
          title: 'Additional Information',
          fields: ['notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'venue_type', 'capacity', 'legacy_city', 'is_active'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/operations/venues/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Venue', variant: 'primary', handler: { type: 'navigate', path: () => '/operations/venues/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
