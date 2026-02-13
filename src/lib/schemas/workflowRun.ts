import { defineSchema } from '../schema/defineSchema';

/**
 * WORKFLOW RUN ENTITY SCHEMA (SSOT)
 */
export const workflowRunSchema = defineSchema({
  identity: {
    name: 'Workflow Run',
    namePlural: 'Workflow Runs',
    slug: 'core/workflows/runs',
    icon: 'Play',
    description: 'Workflow execution history',
  },

  data: {
    endpoint: '/api/workflow_runs',
    primaryKey: 'id',
    fields: {
      workflow_id: {
        type: 'relation',
        label: 'Workflow',
        required: true,
        inTable: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Running', value: 'running' },
          { label: 'Completed', value: 'completed' },
          { label: 'Failed', value: 'failed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      started_at: {
        type: 'datetime',
        label: 'Started At',
        inTable: true,
        sortable: true,
      },
      completed_at: {
        type: 'datetime',
        label: 'Completed At',
        inTable: true,
      },
      duration: {
        type: 'number',
        label: 'Duration (ms)',
        inTable: true,
      },
      triggered_by: {
        type: 'select',
        label: 'Triggered By',
        inTable: true,
        options: [
          { label: 'Manual', value: 'manual' },
          { label: 'Schedule', value: 'schedule' },
          { label: 'Event', value: 'event' },
          { label: 'Webhook', value: 'webhook' },
        ],
      },
      error_message: {
        type: 'textarea',
        label: 'Error Message',
        inDetail: true,
      },
      output: {
        type: 'json',
        label: 'Output',
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => `Run #${record.id}`,
    subtitle: (record) => record.status || '',
    badge: (record) => {
      if (record.status === 'completed') return { label: 'Completed', variant: 'success' };
      if (record.status === 'running') return { label: 'Running', variant: 'primary' };
      if (record.status === 'failed') return { label: 'Failed', variant: 'destructive' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'started_at', direction: 'desc' },
  },

  search: {
    enabled: false,
    fields: [],
    placeholder: '',
  },

  filters: {
    quick: [
      { key: 'failed', label: 'Failed', query: { where: { status: 'failed' } } },
    ],
    advanced: ['status', 'triggered_by'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Runs', query: { where: {} } },
        { key: 'running', label: 'Running', query: { where: { status: 'running' } } },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
        { key: 'failed', label: 'Failed', query: { where: { status: 'failed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'logs', label: 'Logs', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'duration', label: 'Duration', value: { type: 'field', field: 'duration' }, format: 'duration' },
        ],
        blocks: [
          { key: 'error', title: 'Error', content: { type: 'fields', fields: ['error_message'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Run Details',
          fields: ['status'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['status', 'triggered_by', 'started_at', 'completed_at', 'duration'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/workflows/${record.workflow_id}/runs/${record.id}` } },
    ],
    bulk: [],
    global: []
  },
  relationships: {
    belongsTo: [
      { entity: 'workflow', foreignKey: 'workflow_id', label: 'Workflow' },
    ],
  },



  permissions: {
    create: false,
    read: true,
    update: false,
    delete: true,
  }
});
