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
      condition: {
        type: 'select',
        label: 'Condition',
        required: true,
        inForm: true,
        inDetail: true,
        options: [
          { label: 'New', value: 'new' },
          { label: 'Good', value: 'good' },
          { label: 'Fair', value: 'fair' },
          { label: 'Poor', value: 'poor' },
          { label: 'Broken', value: 'broken' },
        ],
      },
      serial_number: {
        type: 'text',
        label: 'Serial Number',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      barcode: {
        type: 'text',
        label: 'Barcode',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
        placeholder: 'Scan or enter barcode',
      },
      qr_code_url: {
        type: 'text',
        label: 'QR Code',
        inDetail: true,
        readOnly: true,
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
      depreciation_method: {
        type: 'select',
        label: 'Depreciation Method',
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Straight Line', value: 'straight_line' },
          { label: 'Declining Balance', value: 'declining_balance' },
          { label: 'Sum of Years', value: 'sum_of_years' },
          { label: 'Units of Production', value: 'units_of_production' },
        ],
      },
      useful_life_months: {
        type: 'number',
        label: 'Useful Life (months)',
        inForm: true,
        inDetail: true,
      },
      salvage_value: {
        type: 'currency',
        label: 'Salvage Value',
        inForm: true,
        inDetail: true,
      },
      book_value: {
        type: 'currency',
        label: 'Book Value',
        inTable: true,
        inDetail: true,
        readOnly: true,
      },
      accumulated_depreciation: {
        type: 'currency',
        label: 'Accumulated Depreciation',
        inDetail: true,
        readOnly: true,
      },
      warranty_expiry: {
        type: 'date',
        label: 'Warranty Expiry',
        inForm: true,
        inDetail: true,
      },
      warranty_provider: {
        type: 'text',
        label: 'Warranty Provider',
        inForm: true,
        inDetail: true,
      },
      warranty_terms: {
        type: 'textarea',
        label: 'Warranty Terms',
        inForm: true,
        inDetail: true,
      },
      insurance_policy_id: {
        type: 'relation',
        relation: { entity: 'insurancePolicy', display: 'policy_number' },
        label: 'Insurance Policy',
        inForm: true,
        inDetail: true,
      },
      insured_value: {
        type: 'currency',
        label: 'Insured Value',
        inForm: true,
        inDetail: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      warehouse_location_id: {
        type: 'relation',
        label: 'Warehouse Bin',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      assigned_to: {
        type: 'relation',
        label: 'Assigned To',
        inTable: true,
        inForm: true,
        relation: { entity: 'user', display: 'full_name', searchable: true },
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      images: {
        type: 'image',
        label: 'Images',
        required: false,
        inForm: true,
        inDetail: true,
        inTable: false,
      },
      specifications: {
        type: 'json',
        label: 'Specifications',
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
    fields: ['name', 'serial_number', 'barcode', 'location'],
    placeholder: 'Search or scan barcode...',
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
        { key: 'maintenance', label: 'Maintenance', content: { type: 'related', entity: 'maintenance', foreignKey: 'asset_id', defaultView: 'table', allowCreate: true } },
        { key: 'reservations', label: 'Reservations', content: { type: 'related', entity: 'reservation', foreignKey: 'asset_id', defaultView: 'table', allowCreate: true } },
        { key: 'check-history', label: 'Check In/Out', content: { type: 'related', entity: 'checkInOut', foreignKey: 'asset_id', defaultView: 'table' } },
        { key: 'depreciation', label: 'Depreciation', content: { type: 'fields', fields: ['depreciation_method', 'useful_life_months', 'salvage_value', 'book_value', 'accumulated_depreciation'], editable: true } },
        { key: 'warranty', label: 'Warranty', content: { type: 'fields', fields: ['warranty_expiry', 'warranty_provider', 'warranty_terms', 'insurance_policy_id', 'insured_value'], editable: true } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
        { key: 'history', label: 'History', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'value', label: 'Current Value', value: { type: 'field', field: 'current_value' }, format: 'currency' },
          { key: 'purchase', label: 'Purchase Price', value: { type: 'field', field: 'purchase_price' }, format: 'currency' },
          { key: 'book', label: 'Book Value', value: { type: 'field', field: 'book_value' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Asset Details', content: { type: 'fields', fields: ['serial_number', 'barcode', 'purchase_date', 'location'] } },
          { key: 'specs', title: 'Specifications', content: { type: 'fields', fields: ['specifications'] } },
        ]
      },
      sidebar: {
        width: 300,
        collapsible: true,
        defaultState: 'open',
        sections: [
          { key: 'properties', title: 'Properties', content: { type: 'stats', stats: ['asset_type', 'status', 'condition', 'location'] } },
          { key: 'financial', title: 'Financial', content: { type: 'stats', stats: ['current_value', 'purchase_price'] } },
          { key: 'recent_activity', title: 'Recent Activity', content: { type: 'activity', limit: 5 }, collapsible: true },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['name', 'asset_type', 'status', 'condition', 'serial_number', 'barcode'],
        },
        {
          key: 'financial',
          title: 'Financial',
          fields: ['purchase_date', 'purchase_price', 'current_value'],
        },
        {
          key: 'depreciation',
          title: 'Depreciation',
          fields: ['depreciation_method', 'useful_life_months', 'salvage_value', 'book_value', 'accumulated_depreciation'],
        },
        {
          key: 'warranty',
          title: 'Warranty & Insurance',
          fields: ['warranty_expiry', 'warranty_provider', 'warranty_terms', 'insurance_policy_id', 'insured_value'],
        },
        {
          key: 'assignment',
          title: 'Assignment',
          fields: ['location', 'assigned_to'],
        },
        {
          key: 'specs',
          title: 'Specifications',
          fields: ['specifications'],
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
      columns: [
        'name',
        { field: 'asset_type', format: { type: 'badge', colorMap: { audio: '#3b82f6', lighting: '#eab308', video: '#8b5cf6', staging: '#f59e0b', rigging: '#ef4444', power: '#22c55e', comms: '#06b6d4', other: '#6b7280' } } },
        { field: 'status', format: { type: 'badge', colorMap: { available: '#22c55e', in_use: '#3b82f6', maintenance: '#eab308', retired: '#6b7280', lost: '#ef4444' } } },
        'serial_number',
        'location',
        { field: 'current_value', format: { type: 'currency' } },
      ],
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

  relationships: {
    belongsTo: [
      { entity: 'storageBin', foreignKey: 'warehouse_location_id', label: 'Warehouse Bin' },
      { entity: 'user', foreignKey: 'assigned_to', label: 'Assigned To' },
      { entity: 'catalogItem', foreignKey: 'catalog_item_id', label: 'Catalog Item' },
    ],
    hasMany: [
      { entity: 'assetMaintenance', foreignKey: 'asset_id', label: 'Maintenance Records', cascade: 'delete' },
      { entity: 'reservation', foreignKey: 'asset_id', label: 'Reservations', cascade: 'nullify' },
      { entity: 'checkInOut', foreignKey: 'asset_id', label: 'Check In/Out History', cascade: 'delete' },
      { entity: 'assetTransfer', foreignKey: 'asset_id', label: 'Transfers', cascade: 'restrict' },
      { entity: 'assetAuditLog', foreignKey: 'asset_id', label: 'Audit Log', cascade: 'restrict' },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
