import { defineSchema } from '../schema/defineSchema';

/**
 * CONNECTION ENTITY SCHEMA (SSOT)
 * Enhanced with request/approval workflow for network connections
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
      // Connection request workflow fields
      requester_id: {
        type: 'relation',
        label: 'Requester',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      requestee_id: {
        type: 'relation',
        label: 'Requestee',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      request_message: {
        type: 'textarea',
        label: 'Connection Message',
        placeholder: 'Add a personal note to your connection request...',
        inForm: true,
        inDetail: true,
        maxLength: 500,
      },
      request_status: {
        type: 'select',
        label: 'Request Status',
        required: true,
        inTable: true,
        inForm: true,
        default: 'pending',
        options: [
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Accepted', value: 'accepted', color: 'green' },
          { label: 'Declined', value: 'declined', color: 'red' },
          { label: 'Blocked', value: 'blocked', color: 'gray' },
        ],
      },
      requested_at: {
        type: 'datetime',
        label: 'Requested At',
        inTable: true,
        sortable: true,
      },
      responded_at: {
        type: 'datetime',
        label: 'Responded At',
        inTable: true,
      },
      // Mutual connections count (computed on read)
      mutual_connections_count: {
        type: 'number',
        label: 'Mutual Connections',
        inTable: true,
        inDetail: true,
        default: 0,
      },
      // Legacy fields for backward compatibility
      name: {
        type: 'text',
        label: 'Name',
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
        { key: 'all', label: 'All Connections', query: { where: { request_status: 'accepted' } } },
        { key: 'pending', label: 'Pending Requests', query: { where: { request_status: 'pending' } }, count: true },
        { key: 'sent', label: 'Sent Requests', query: { where: { request_status: 'pending' } } },
        { key: 'clients', label: 'Clients', query: { where: { connection_type: 'client', request_status: 'accepted' } } },
        { key: 'vendors', label: 'Vendors', query: { where: { connection_type: 'vendor', request_status: 'accepted' } } },
        { key: 'partners', label: 'Partners', query: { where: { connection_type: 'partner', request_status: 'accepted' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
        { key: 'messages', label: 'Messages', content: { type: 'related', entity: 'conversation', foreignKey: 'participant_ids' } },
      ],
      overview: {
        stats: [
          { key: 'mutual', label: 'Mutual Connections', value: { type: 'field', field: 'mutual_connections_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'contact', title: 'Contact Information', content: { type: 'fields', fields: ['email', 'phone', 'location'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
          { key: 'request', title: 'Connection Request', content: { type: 'fields', fields: ['request_message', 'requested_at', 'responded_at'] } },
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
      { key: 'accept', label: 'Accept', variant: 'primary', condition: (record) => record.request_status === 'pending', handler: { type: 'api', endpoint: '/api/connections/{id}/accept', method: 'POST' }, successMessage: 'Connection accepted!' },
      { key: 'decline', label: 'Decline', variant: 'secondary', condition: (record) => record.request_status === 'pending', handler: { type: 'api', endpoint: '/api/connections/{id}/decline', method: 'POST' } },
      { key: 'message', label: 'Message', condition: (record) => record.request_status === 'accepted', handler: { type: 'navigate', path: (record) => `/network/messages/new?recipient=${record.requestee_id}` } },
    ],
    bulk: [
      { key: 'accept-all', label: 'Accept All', variant: 'primary', handler: { type: 'api', endpoint: '/api/connections/bulk-accept', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'New Connection', variant: 'primary', handler: { type: 'navigate', path: () => '/network/connections/new' } },
      { key: 'find', label: 'Find People', handler: { type: 'navigate', path: () => '/network/discover' } },
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
