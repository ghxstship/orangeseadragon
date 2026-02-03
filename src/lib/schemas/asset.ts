import { defineSchema } from '../schema/defineSchema';

/**
 * ASSET ENTITY SCHEMA (SSOT)
 */
export const assetSchema = defineSchema({
  identity: {
    name: 'Asset',
    namePlural: 'Assets',
    slug: 'modules/assets/inventory',
    icon: 'Package',
    description: 'Manage equipment and inventory assets',
  },

  data: {
    endpoint: '/api/assets',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Asset Name',
        placeholder: 'Enter asset name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      asset_type: {
        type: 'select',
        label: 'Asset Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Equipment', value: 'equipment' },
          { label: 'Vehicle', value: 'vehicle' },
          { label: 'Furniture', value: 'furniture' },
          { label: 'Technology', value: 'technology' },
          { label: 'Consumable', value: 'consumable' },
          { label: 'Other', value: 'other' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Available', value: 'available' },
          { label: 'In Use', value: 'in_use' },
          { label: 'Maintenance', value: 'maintenance' },
          { label: 'Retired', value: 'retired' },
        ],
      },
      serial_number: {
        type: 'text',
        label: 'Serial Number',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      purchase_date: {
        type: 'date',
        label: 'Purchase Date',
        inForm: true,
        inDetail: true,
      },
      purchase_price: {
        type: 'currency',
        label: 'Purchase Price',
        inForm: true,
        inDetail: true,
      },
      current_value: {
        type: 'currency',
        label: 'Current Value',
        inTable: true,
        inDetail: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      assigned_to: {
        type: 'relation',
        label: 'Assigned To',
        inTable: true,
        inForm: true,
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
    title: (record) => record.name || 'Untitled Asset',
    subtitle: (record) => record.asset_type || '',
    badge: (record) => {
      if (record.status === 'available') return { label: 'Available', variant: 'success' };
      if (record.status === 'in_use') return { label: 'In Use', variant: 'primary' };
      if (record.status === 'maintenance') return { label: 'Maintenance', variant: 'warning' };
      return { label: 'Retired', variant: 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'serial_number', 'location'],
    placeholder: 'Search assets...',
  },

  filters: {
    quick: [
      { key: 'available', label: 'Available', query: { where: { status: 'available' } } },
    ],
    advanced: ['asset_type', 'status', 'location'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'available', label: 'Available', query: { where: { status: 'available' } }, count: true },
        { key: 'in-use', label: 'In Use', query: { where: { status: 'in_use' } }, count: true },
        { key: 'maintenance', label: 'Maintenance', query: { where: { status: 'maintenance' } }, count: true },
        { key: 'retired', label: 'Retired', query: { where: { status: 'retired' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid', 'list', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'history', label: 'History', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'value', label: 'Current Value', value: { type: 'field', field: 'current_value' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Asset Details', content: { type: 'fields', fields: ['serial_number', 'purchase_date', 'purchase_price', 'location'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['name', 'asset_type', 'status', 'serial_number'],
        },
        {
          key: 'financial',
          title: 'Financial',
          fields: ['purchase_date', 'purchase_price', 'current_value'],
        },
        {
          key: 'assignment',
          title: 'Assignment',
          fields: ['location', 'assigned_to'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'asset_type', 'status', 'serial_number', 'location', 'current_value'],
    },
    list: {
      titleField: 'name',
      subtitleField: 'asset_type',
      metaFields: ['serial_number', 'location'],
      showChevron: true,
    },
    grid: {
      titleField: 'name',
      subtitleField: 'asset_type',
      badgeField: 'status',
      cardFields: ['serial_number', 'location', 'current_value'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'available', label: 'Available', color: 'green' },
        { value: 'in_use', label: 'In Use', color: 'blue' },
        { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
        { value: 'retired', label: 'Retired', color: 'gray' },
      ],
      card: {
        title: 'name',
        subtitle: 'asset_type',
        fields: ['serial_number', 'location'],
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/inventory/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Asset', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/inventory/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
