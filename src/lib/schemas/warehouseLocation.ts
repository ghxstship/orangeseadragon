import { defineSchema } from '../schema/defineSchema';

/**
 * WAREHOUSE LOCATION SCHEMA (SSOT)
 * Bin/shelf location tracking for warehouse management
 */
export const warehouseLocationSchema = defineSchema({
  identity: {
    name: 'WarehouseLocation',
    namePlural: 'Warehouse Locations',
    slug: 'modules/assets/locations/bins',
    icon: 'Grid3x3',
    description: 'Warehouse bin and shelf locations',
  },

  data: {
    endpoint: '/api/warehouse_locations',
    primaryKey: 'id',
    fields: {
      warehouse_id: {
        type: 'relation',
        label: 'Warehouse',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      location_code: {
        type: 'text',
        label: 'Location Code',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
        sortable: true,
        placeholder: 'e.g., A-01-03-B',
      },
      zone: {
        type: 'text',
        label: 'Zone',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      aisle: {
        type: 'text',
        label: 'Aisle',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      rack: {
        type: 'text',
        label: 'Rack',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      shelf: {
        type: 'text',
        label: 'Shelf',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      bin: {
        type: 'text',
        label: 'Bin',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      barcode: {
        type: 'text',
        label: 'Barcode',
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      location_type: {
        type: 'select',
        label: 'Location Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Storage', value: 'storage', color: 'blue' },
          { label: 'Staging', value: 'staging', color: 'yellow' },
          { label: 'Receiving', value: 'receiving', color: 'green' },
          { label: 'Shipping', value: 'shipping', color: 'purple' },
          { label: 'Quarantine', value: 'quarantine', color: 'red' },
          { label: 'Maintenance', value: 'maintenance', color: 'orange' },
        ],
        default: 'storage',
      },
      capacity_units: {
        type: 'number',
        label: 'Capacity (units)',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      current_units: {
        type: 'number',
        label: 'Current (units)',
        inTable: true,
        inDetail: true,
        readOnly: true,
      },
      max_weight_lbs: {
        type: 'number',
        label: 'Max Weight (lbs)',
        inForm: true,
        inDetail: true,
      },
      dimensions: {
        type: 'text',
        label: 'Dimensions (LxWxH)',
        inForm: true,
        inDetail: true,
        placeholder: 'e.g., 48x40x60 in',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
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
    title: (record) => record.location_code || 'Untitled Location',
    subtitle: (record) => record.location_type || '',
    badge: (record) => {
      const capacity = Number(record.capacity_units) || 0;
      const current = Number(record.current_units) || 0;
      const utilization = capacity > 0 ? (current / capacity) * 100 : 0;
      if (utilization >= 90) return { label: 'Full', variant: 'destructive' };
      if (utilization >= 70) return { label: 'High', variant: 'warning' };
      if (utilization > 0) return { label: 'Available', variant: 'success' };
      return { label: 'Empty', variant: 'secondary' };
    },
    defaultSort: { field: 'location_code', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['location_code', 'barcode', 'zone', 'aisle'],
    placeholder: 'Search locations...',
  },

  filters: {
    quick: [
      { key: 'storage', label: 'Storage', query: { where: { location_type: 'storage' } } },
      { key: 'staging', label: 'Staging', query: { where: { location_type: 'staging' } } },
    ],
    advanced: ['location_type', 'warehouse_id', 'zone', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Locations', query: { where: {} }, count: true },
        { key: 'storage', label: 'Storage', query: { where: { location_type: 'storage' } }, count: true },
        { key: 'staging', label: 'Staging', query: { where: { location_type: 'staging' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'assets', label: 'Assets', content: { type: 'related', entity: 'assets', foreignKey: 'warehouse_location_id' } },
      ],
      overview: {
        stats: [
          { key: 'capacity', label: 'Capacity', value: { type: 'field', field: 'capacity_units' }, format: 'number' },
          { key: 'current', label: 'Current', value: { type: 'field', field: 'current_units' }, format: 'number' },
        ],
        blocks: [
          { key: 'location', title: 'Location Details', content: { type: 'fields', fields: ['zone', 'aisle', 'rack', 'shelf', 'bin'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Location Information',
          fields: ['warehouse_id', 'location_code', 'location_type', 'barcode', 'is_active'],
        },
        {
          key: 'position',
          title: 'Position',
          fields: ['zone', 'aisle', 'rack', 'shelf', 'bin'],
        },
        {
          key: 'capacity',
          title: 'Capacity',
          fields: ['capacity_units', 'max_weight_lbs', 'dimensions'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['notes'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'location_code',
        { field: 'warehouse_id', format: { type: 'relation', entityType: 'warehouse' } },
        'location_type', 'zone', 'aisle',
        { field: 'capacity_units', format: { type: 'number' } },
        { field: 'current_units', format: { type: 'number' } },
        { field: 'is_active', format: { type: 'boolean' } },
      ],
    },
    grid: {
      titleField: 'location_code',
      subtitleField: 'location_type',
      cardFields: ['zone', 'aisle', 'capacity_units'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/locations/bins/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Location', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/locations/bins/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
