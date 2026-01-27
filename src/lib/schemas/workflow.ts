import { defineSchema } from '../schema/defineSchema';

/**
 * WORKFLOW ENTITY SCHEMA (SSOT)
 */
export const workflowSchema = defineSchema({
  identity: {
    name: 'Workflow',
    namePlural: 'Workflows',
    slug: 'core/workflows',
    icon: '⚡',
    description: 'Automation workflows and processes',
  },

  data: {
    endpoint: '/api/workflow_templates',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
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
      is_active: {
        type: 'checkbox',
        label: 'Active',
        inTable: true,
        inForm: true,
      },
      is_system: {
        type: 'checkbox',
        label: 'System Workflow',
        inTable: true,
      },
      trigger_type: {
        type: 'select',
        label: 'Trigger',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Manual', value: 'manual' },
          { label: 'Schedule', value: 'schedule' },
          { label: 'Event', value: 'event' },
          { label: 'Webhook', value: 'webhook' },
        ],
      },
      schedule: {
        type: 'text',
        label: 'Schedule (cron)',
        inForm: true,
        inDetail: true,
      },
      last_run: {
        type: 'datetime',
        label: 'Last Run',
        inTable: true,
        sortable: true,
      },
      next_run: {
        type: 'datetime',
        label: 'Next Run',
        inTable: true,
      },
      run_count: {
        type: 'number',
        label: 'Total Runs',
        inTable: true,
      },
      success_count: {
        type: 'number',
        label: 'Successful Runs',
        inDetail: true,
      },
      failure_count: {
        type: 'number',
        label: 'Failed Runs',
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Untitled Workflow',
    subtitle: (record) => record.trigger_type || '',
    badge: (record) => {
      if (record.is_active) return { label: 'Active', variant: 'success' };
      return { label: 'Inactive', variant: 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search workflows...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['is_active', 'trigger_type'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'active', label: 'Active', query: { where: { is_active: true } } },
        { key: 'inactive', label: 'Inactive', query: { where: { is_active: false } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'runs', label: 'Runs', content: { type: 'related', entity: 'workflow_runs', foreignKey: 'workflow_id' } },
        { key: 'logs', label: 'Logs', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'runs', label: 'Total Runs', value: { type: 'field', field: 'run_count' }, format: 'number' },
          { key: 'success', label: 'Success Rate', value: { type: 'field', field: 'success_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'schedule'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Workflow Details',
          fields: ['name', 'description', 'is_active'],
        },
        {
          key: 'trigger',
          title: 'Trigger',
          fields: ['trigger_type', 'schedule'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'is_active', 'trigger_type', 'last_run', 'run_count'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/workflows/${record.id}` } },
      { key: 'run', label: 'Run Now', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Workflow', variant: 'primary', handler: { type: 'navigate', path: () => '/core/workflows/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
