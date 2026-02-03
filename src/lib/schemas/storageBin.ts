import { defineSchema } from '../schema/defineSchema';

/**
 * STORAGE BIN ENTITY SCHEMA (SSOT)
 */
export const storageBinSchema = defineSchema({
  identity: {
    name: 'Storage Bin',
    namePlural: 'Storage Bins',
    slug: 'assets/locations/bins',
    icon: 'Box',
    description: 'Storage bins and locations',
  },

  data: {
    endpoint: '/api/storage-bins',
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
      code: {
        type: 'text',
        label: 'Bin Code',
        required: true,
        inTable: true,
        inForm: true,
      },
      warehouse_id: {
        type: 'relation',
        label: 'Warehouse',
        required: true,
        inTable: true,
        inForm: true,
      },
      zone: {
        type: 'text',
        label: 'Zone',
        inTable: true,
        inForm: true,
      },
      aisle: {
        type: 'text',
        label: 'Aisle',
        inTable: true,
        inForm: true,
      },
      rack: {
        type: 'text',
        label: 'Rack',
        inForm: true,
      },
      shelf: {
        type: 'text',
        label: 'Shelf',
        inForm: true,
      },
      bin_type: {
        type: 'select',
        label: 'Bin Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Bulk', value: 'bulk' },
          { label: 'High Value', value: 'high_value' },
          { label: 'Hazmat', value: 'hazmat' },
          { label: 'Cold Storage', value: 'cold_storage' },
        ],
      },
      capacity: {
        type: 'number',
        label: 'Capacity',
        inForm: true,
      },
      current_count: {
        type: 'number',
        label: 'Current Count',
        inTable: true,
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
    title: (record) => record.code || record.name || 'Storage Bin',
    subtitle: (record) => record.zone ? `Zone ${record.zone}` : '',
    badge: (record) => {
      if (!record.is_active) return { label: 'Inactive', variant: 'secondary' };
      return undefined;
    },
    defaultSort: { field: 'code', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'code'],
    placeholder: 'Search bins...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['warehouse_id', 'bin_type', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Bins', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'contents', label: 'Contents', content: { type: 'related', entity: 'assets', foreignKey: 'bin_id' } },
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
          title: 'Bin Details',
          fields: ['name', 'code', 'warehouse_id', 'bin_type', 'is_active'],
        },
        {
          key: 'location',
          title: 'Location',
          fields: ['zone', 'aisle', 'rack', 'shelf'],
        },
        {
          key: 'capacity',
          title: 'Capacity',
          fields: ['capacity'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['code', 'name', 'warehouse_id', 'zone', 'bin_type', 'current_count'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/locations/bins/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/assets/locations/bins/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Bin', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/locations/bins/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
