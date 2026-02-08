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
