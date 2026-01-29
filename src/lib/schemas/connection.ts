import { defineSchema } from '../schema/defineSchema';

/**
 * CONNECTION ENTITY SCHEMA (SSOT)
 */
export const connectionSchema = defineSchema({
  identity: {
    name: 'Connection',
    namePlural: 'Connections',
    slug: 'network/connections',
    icon: 'Link',
    description: 'Network connections and contacts',
  },

  data: {
    endpoint: '/api/connections',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      company: {
        type: 'text',
        label: 'Company',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      role: {
        type: 'text',
        label: 'Role/Title',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      connection_type: {
        type: 'select',
        label: 'Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Client', value: 'client' },
          { label: 'Vendor', value: 'vendor' },
          { label: 'Partner', value: 'partner' },
          { label: 'Colleague', value: 'colleague' },
          { label: 'Other', value: 'other' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Pending', value: 'pending' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
      email: {
        type: 'email',
        label: 'Email',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      phone: {
        type: 'phone',
        label: 'Phone',
        inForm: true,
        inDetail: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      last_contacted: {
        type: 'date',
        label: 'Last Contacted',
        inTable: true,
        inForm: true,
        sortable: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Unknown Contact',
    subtitle: (record) => record.company || record.role || '',
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'company', 'email'],
    placeholder: 'Search connections...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['connection_type', 'status'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'clients', label: 'Clients', query: { where: { connection_type: 'client' } } },
        { key: 'vendors', label: 'Vendors', query: { where: { connection_type: 'vendor' } } },
        { key: 'partners', label: 'Partners', query: { where: { connection_type: 'partner' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'contact', title: 'Contact Information', content: { type: 'fields', fields: ['email', 'phone', 'location'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['name', 'company', 'role', 'connection_type', 'status'],
        },
        {
          key: 'contact',
          title: 'Contact',
          fields: ['email', 'phone', 'location'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['notes', 'last_contacted'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'company', 'connection_type', 'email', 'status', 'last_contacted'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/connections/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Connection', variant: 'primary', handler: { type: 'navigate', path: () => '/network/connections/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
