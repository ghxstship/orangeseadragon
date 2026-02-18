import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * SERVICE HISTORY ENTITY SCHEMA (SSOT)
 */
export const serviceHistorySchema = defineSchema({
  identity: {
    name: 'Service History',
    namePlural: 'Service History',
    slug: 'assets/maintenance/history',
    icon: 'History',
    description: 'Asset service and maintenance history',
  },

  data: {
    endpoint: '/api/service-history',
    primaryKey: 'id',
    fields: {
      asset_id: {
        type: 'relation',
        label: 'Asset',
        required: true,
        inTable: true,
        inForm: true,
      },
      service_type: {
        type: 'select',
        label: 'Service Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Preventive', value: 'preventive' },
          { label: 'Repair', value: 'repair' },
          { label: 'Inspection', value: 'inspection' },
          { label: 'Calibration', value: 'calibration' },
          { label: 'Upgrade', value: 'upgrade' },
          { label: 'Replacement', value: 'replacement' },
        ],
      },
      service_date: {
        type: 'date',
        label: 'Service Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
      },
      performed_by: {
        type: 'relation',
        label: 'Performed By',
        inTable: true,
        inForm: true,
      },
      vendor_id: {
        type: 'relation',
        relation: { entity: 'company', display: 'name', searchable: true },
        label: 'Vendor',
        inForm: true,
      },
      labor_hours: {
        type: 'number',
        label: 'Labor Hours',
        inForm: true,
        inDetail: true,
      },
      parts_cost: {
        type: 'currency',
        label: 'Parts Cost',
        inForm: true,
        inDetail: true,
      },
      labor_cost: {
        type: 'currency',
        label: 'Labor Cost',
        inForm: true,
        inDetail: true,
      },
      total_cost: {
        type: 'currency',
        label: 'Total Cost',
        inTable: true,
        inForm: true,
      },
      work_order_id: {
        type: 'relation',
        relation: { entity: 'workOrder', display: 'work_order_number' },
        label: 'Work Order',
        inForm: true,
      },
      next_service_date: {
        type: 'date',
        label: 'Next Service Date',
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
    title: (record) => record.service_type || 'Service Record',
    subtitle: (record) => record.service_date || '',
    defaultSort: { field: 'service_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['description'],
    placeholder: 'Search service history...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['service_type', 'asset_id', 'performed_by'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Records', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
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
          title: 'Service Details',
          fields: ['asset_id', 'service_type', 'service_date', 'description'],
        },
        {
          key: 'personnel',
          title: 'Personnel',
          fields: ['performed_by', 'vendor_id', 'work_order_id'],
        },
        {
          key: 'costs',
          title: 'Costs',
          fields: ['labor_hours', 'parts_cost', 'labor_cost', 'total_cost'],
        },
        {
          key: 'scheduling',
          title: 'Scheduling',
          fields: ['next_service_date', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        { field: 'asset_id', format: { type: 'relation', entityType: 'asset' } },
        'service_type',
        { field: 'service_date', format: { type: 'date' } },
        { field: 'performed_by', format: { type: 'relation', entityType: 'person' } },
        { field: 'total_cost', format: { type: 'currency' } },
        { field: 'next_service_date', format: { type: 'date' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/maintenance/history/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/assets/maintenance/history/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Log Service', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/maintenance/history/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'asset', foreignKey: 'asset_id', label: 'Asset' },
      { entity: 'company', foreignKey: 'vendor_id', label: 'Vendor' },
      { entity: 'workOrder', foreignKey: 'work_order_id', label: 'Work Order' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
