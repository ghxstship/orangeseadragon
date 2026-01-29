import { defineSchema } from '../schema/defineSchema';

export const productionSchema = defineSchema({
  identity: {
    name: 'production',
    namePlural: 'Productions',
    slug: 'modules/production/productions',
    icon: 'Clapperboard',
    description: 'Stage, scenic, and touring productions',
  },

  data: {
    endpoint: '/api/productions',
    primaryKey: 'id',
    fields: {
      production_code: {
        type: 'text',
        label: 'Production Code',
        placeholder: 'e.g., PROD-2026-001',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      name: {
        type: 'text',
        label: 'Production Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      production_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Stage', value: 'stage' },
          { label: 'Scenic', value: 'scenic' },
          { label: 'Touring', value: 'touring' },
          { label: 'Installation', value: 'installation' },
          { label: 'Activation', value: 'activation' },
          { label: 'Hybrid', value: 'hybrid' },
        ],
        default: 'stage',
      },
      client_id: {
        type: 'select',
        label: 'Client',
        inTable: true,
        inForm: true,
        options: [],
      },
      venue_id: {
        type: 'select',
        label: 'Venue',
        inTable: true,
        inForm: true,
        options: [],
      },
      project_id: {
        type: 'select',
        label: 'Project',
        inForm: true,
        options: [],
      },
      project_manager_id: {
        type: 'select',
        label: 'Project Manager',
        inTable: true,
        inForm: true,
        options: [],
      },
      account_executive_id: {
        type: 'select',
        label: 'Account Executive',
        inForm: true,
        options: [],
      },
      facility: {
        type: 'text',
        label: 'Facility',
        inForm: true,
        inDetail: true,
      },
      event_start: {
        type: 'date',
        label: 'Event Start',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      event_end: {
        type: 'date',
        label: 'Event End',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      load_in_date: {
        type: 'date',
        label: 'Load-In Date',
        inForm: true,
        inDetail: true,
      },
      strike_date: {
        type: 'date',
        label: 'Strike Date',
        inForm: true,
        inDetail: true,
      },
      contract_value: {
        type: 'currency',
        label: 'Contract Value',
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
          { label: 'Intake', value: 'intake', color: 'gray' },
          { label: 'Scoping', value: 'scoping', color: 'blue' },
          { label: 'Proposal', value: 'proposal', color: 'purple' },
          { label: 'Awarded', value: 'awarded', color: 'green' },
          { label: 'Design', value: 'design', color: 'cyan' },
          { label: 'Fabrication', value: 'fabrication', color: 'orange' },
          { label: 'Deployment', value: 'deployment', color: 'yellow' },
          { label: 'Installation', value: 'installation', color: 'amber' },
          { label: 'Show', value: 'show', color: 'emerald' },
          { label: 'Strike', value: 'strike', color: 'red' },
          { label: 'Closeout', value: 'closeout', color: 'slate' },
          { label: 'Archived', value: 'archived', color: 'zinc' },
        ],
        default: 'intake',
      },
      health: {
        type: 'select',
        label: 'Health',
        inTable: true,
        inForm: true,
        options: [
          { label: 'On Track', value: 'on_track', color: 'green' },
          { label: 'At Risk', value: 'at_risk', color: 'yellow' },
          { label: 'Critical', value: 'critical', color: 'red' },
          { label: 'Blocked', value: 'blocked', color: 'gray' },
        ],
        default: 'on_track',
      },
      drive_folder_url: {
        type: 'url',
        label: 'Drive Folder',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record: any) => record.name || 'Untitled Production',
    subtitle: (record: any) => record.production_code || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        intake: 'secondary', scoping: 'primary', proposal: 'primary',
        awarded: 'success', design: 'primary', fabrication: 'warning',
        deployment: 'warning', installation: 'warning', show: 'success',
        strike: 'destructive', closeout: 'secondary', archived: 'secondary',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'event_start', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'production_code', 'description'],
    placeholder: 'Search productions...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: { notIn: ['archived', 'closeout'] } } } },
      { key: 'at-risk', label: 'At Risk', query: { where: { health: { in: ['at_risk', 'critical', 'blocked'] } } } },
    ],
    advanced: ['status', 'production_type', 'health', 'client_id', 'project_manager_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Productions', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: { notIn: ['archived', 'closeout'] } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'shipments', label: 'Shipments', content: { type: 'related', entity: 'shipments', foreignKey: 'production_id' } },
        { key: 'work-orders', label: 'Work Orders', content: { type: 'related', entity: 'work_orders', foreignKey: 'production_id' } },
        { key: 'permits', label: 'Permits', content: { type: 'related', entity: 'permits', foreignKey: 'production_id' } },
      ],
      overview: {
        stats: [
          { key: 'contract_value', label: 'Contract Value', value: { type: 'field', field: 'contract_value' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Production Details', content: { type: 'fields', fields: ['description', 'facility'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['production_code', 'name', 'description', 'production_type'] },
        { key: 'relationships', title: 'Relationships', fields: ['client_id', 'venue_id', 'project_id', 'project_manager_id', 'account_executive_id'] },
        { key: 'schedule', title: 'Schedule', fields: ['event_start', 'event_end', 'load_in_date', 'strike_date'] },
        { key: 'status', title: 'Status & Financial', fields: ['status', 'health', 'contract_value'] },
        { key: 'resources', title: 'Resources', fields: ['facility', 'drive_folder_url'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['production_code', 'name', 'client_id', 'status', 'health', 'event_start', 'contract_value'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'planning', label: 'Planning', color: 'blue' },
        { value: 'pre_production', label: 'Pre-Production', color: 'cyan' },
        { value: 'in_production', label: 'In Production', color: 'yellow' },
        { value: 'load_in', label: 'Load In', color: 'orange' },
        { value: 'show', label: 'Show', color: 'green' },
        { value: 'load_out', label: 'Load Out', color: 'purple' },
        { value: 'wrap', label: 'Wrap', color: 'gray' },
      ],
      card: {
        title: 'name',
        subtitle: (record: any) => record.client_id || '',
        fields: ['event_start', 'health'],
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/modules/production/productions/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Production', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Production') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
