import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * WORKFLOW TRIGGER ENTITY SCHEMA (SSOT)
 */
export const workflowTriggerSchema = defineSchema({
  identity: {
    name: 'Workflow Trigger',
    namePlural: 'Workflow Triggers',
    slug: 'core/workflows/triggers',
    icon: 'Zap',
    description: 'Automation triggers for workflows',
  },

  data: {
    endpoint: '/api/workflow-triggers',
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
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      trigger_type: {
        type: 'select',
        label: 'Trigger Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Schedule', value: 'schedule' },
          { label: 'Event', value: 'event' },
          { label: 'Webhook', value: 'webhook' },
          { label: 'Manual', value: 'manual' },
          { label: 'Record Change', value: 'record_change' },
        ],
      },
      workflow_id: {
        type: 'relation',
        relation: { entity: 'workflow', display: 'name' },
        label: 'Workflow',
        required: true,
        inTable: true,
        inForm: true,
      },
      config: {
        type: 'json',
        label: 'Configuration',
        inForm: true,
        inDetail: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
      },
      last_triggered_at: {
        type: 'datetime',
        label: 'Last Triggered',
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Untitled Trigger',
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
    placeholder: 'Search triggers...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['trigger_type', 'is_active', 'workflow_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Triggers', query: { where: {} } },
        { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'history', label: 'Run History', content: { type: 'related', entity: 'workflow_runs', foreignKey: 'trigger_id' } },
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
          title: 'Trigger Details',
          fields: ['name', 'description', 'trigger_type', 'workflow_id', 'is_active'],
        },
        {
          key: 'config',
          title: 'Configuration',
          fields: ['config'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        'trigger_type',
        { field: 'workflow_id', format: { type: 'relation', entityType: 'workflow' } },
        { field: 'is_active', format: { type: 'boolean' } },
        { field: 'last_triggered_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/workflows/triggers/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/core/workflows/triggers/${record.id}/edit` } },
      { key: 'test', label: 'Test', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Trigger', variant: 'primary', handler: { type: 'navigate', path: () => '/core/workflows/triggers/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'workflow', foreignKey: 'workflow_id', label: 'Workflow' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
