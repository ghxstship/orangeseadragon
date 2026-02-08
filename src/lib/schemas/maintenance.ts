import { defineSchema } from '../schema/defineSchema';

export const maintenanceSchema = defineSchema({
  identity: {
    name: 'MaintenanceRecord',
    namePlural: 'Maintenance Records',
    slug: 'modules/assets/maintenance',
    icon: 'Wrench',
    description: 'Track asset maintenance and repairs',
  },

  data: {
    endpoint: '/api/maintenance_records',
    primaryKey: 'id',
    fields: {
      asset_id: {
        type: 'relation',
        label: 'Asset',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      description: {
        type: 'text',
        label: 'Description',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      maintenance_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Repair', value: 'repair' },
          { label: 'Preventive', value: 'preventive' },
          { label: 'Inspection', value: 'inspection' },
          { label: 'Upgrade', value: 'upgrade' },
          { label: 'Cleaning', value: 'cleaning' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      scheduled_date: {
        type: 'date',
        label: 'Scheduled Date',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      completed_date: {
        type: 'date',
        label: 'Completed Date',
        inTable: true,
        inForm: true,
      },
      cost_cents: {
        type: 'currency',
        label: 'Cost',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      performed_by: {
        type: 'relation',
        label: 'Performed By',
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
    title: (record) => record.description || 'Untitled Maintenance',
    subtitle: (record) => record.maintenance_type || '',
    badge: (record) => {
      if (record.status === 'completed') return { label: 'Completed', variant: 'success' };
      if (record.status === 'in_progress') return { label: 'In Progress', variant: 'primary' };
      if (record.status === 'scheduled') return { label: 'Scheduled', variant: 'warning' };
      return { label: 'Cancelled', variant: 'secondary' };
    },
    defaultSort: { field: 'scheduled_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['description'],
    placeholder: 'Search maintenance records...',
  },

  layouts: {
    list: {
      defaultView: 'table',
      availableViews: ['table', 'list'],
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'scheduled', label: 'Scheduled', query: { where: { status: 'scheduled' } }, count: true },
        { key: 'in-progress', label: 'In Progress', query: { where: { status: 'in_progress' } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
      ],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'cost', label: 'Cost', value: { type: 'field', field: 'cost_cents' }, format: 'currency' },
        ],
        blocks: [
          { key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description', 'notes'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Maintenance Details',
          fields: ['asset_id', 'description', 'maintenance_type', 'status'],
        },
        {
          key: 'schedule',
          title: 'Schedule & Cost',
          fields: ['scheduled_date', 'completed_date', 'cost_cents', 'performed_by'],
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
      columns: ['asset_id', 'description', 'maintenance_type', 'status', 'scheduled_date', 'cost_cents'],
    },
    list: {
      titleField: 'description',
      subtitleField: 'maintenance_type',
      badgeField: 'status',
      metaFields: ['scheduled_date'],
    },
  },

  filters: {
    quick: [
      { key: 'scheduled', label: 'Scheduled', query: { where: { status: 'scheduled' } } },
    ],
    advanced: ['maintenance_type', 'status', 'asset_id'],
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/maintenance/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Schedule', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/maintenance/new' } },
    ],
  },


  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
