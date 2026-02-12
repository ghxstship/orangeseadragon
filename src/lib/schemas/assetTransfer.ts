import { defineSchema } from '../schema/defineSchema';

/**
 * ASSET TRANSFER ENTITY SCHEMA (SSOT)
 */
export const assetTransferSchema = defineSchema({
  identity: {
    name: 'Asset Transfer',
    namePlural: 'Asset Transfers',
    slug: 'assets/reservations/transfers',
    icon: 'ArrowLeftRight',
    description: 'Asset transfer requests and tracking',
  },

  data: {
    endpoint: '/api/asset-transfers',
    primaryKey: 'id',
    fields: {
      transfer_number: {
        type: 'text',
        label: 'Transfer #',
        inTable: true,
        inDetail: true,
      },
      asset_id: {
        type: 'relation',
        label: 'Asset',
        required: true,
        inTable: true,
        inForm: true,
      },
      from_location_id: {
        type: 'relation',
        label: 'From Location',
        required: true,
        inTable: true,
        inForm: true,
      },
      to_location_id: {
        type: 'relation',
        label: 'To Location',
        required: true,
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Requested', value: 'requested' },
          { label: 'Approved', value: 'approved' },
          { label: 'In Transit', value: 'in_transit' },
          { label: 'Received', value: 'received' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      requested_by: {
        type: 'relation',
        label: 'Requested By',
        inTable: true,
        inDetail: true,
      },
      approved_by: {
        type: 'relation',
        label: 'Approved By',
        inDetail: true,
      },
      requested_date: {
        type: 'date',
        label: 'Requested Date',
        inTable: true,
        sortable: true,
      },
      ship_date: {
        type: 'date',
        label: 'Ship Date',
        inTable: true,
        inForm: true,
      },
      received_date: {
        type: 'date',
        label: 'Received Date',
        inForm: true,
        inDetail: true,
      },
      reason: {
        type: 'textarea',
        label: 'Reason',
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
    title: (record) => record.transfer_number || 'Asset Transfer',
    subtitle: (record) => record.status || '',
    badge: (record) => {
      if (record.status === 'in_transit') return { label: 'In Transit', variant: 'warning' };
      if (record.status === 'received') return { label: 'Received', variant: 'success' };
      if (record.status === 'approved') return { label: 'Approved', variant: 'default' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'requested_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['transfer_number'],
    placeholder: 'Search transfers...',
  },

  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: { in: ['requested', 'approved', 'in_transit'] } } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['status', 'from_location_id', 'to_location_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'pending', label: 'Pending', query: { where: { status: { in: ['requested', 'approved', 'in_transit'] } } } },
        { key: 'all', label: 'All Transfers', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
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
          title: 'Transfer Details',
          fields: ['asset_id', 'status'],
        },
        {
          key: 'locations',
          title: 'Locations',
          fields: ['from_location_id', 'to_location_id'],
        },
        {
          key: 'dates',
          title: 'Dates',
          fields: ['ship_date', 'received_date'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['reason', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'transfer_number',
        { field: 'asset_id', format: { type: 'relation', entityType: 'asset' } },
        { field: 'from_location_id', format: { type: 'relation', entityType: 'location' } },
        { field: 'to_location_id', format: { type: 'relation', entityType: 'location' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        { field: 'requested_date', format: { type: 'date' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/reservations/transfers/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/assets/reservations/transfers/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Transfer', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/reservations/transfers/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
