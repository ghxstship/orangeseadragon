import { defineSchema } from '../schema/defineSchema';

/**
 * TASK DEPENDENCY ENTITY SCHEMA (SSOT)
 * 
 * Links tasks with predecessor/successor relationships
 * for critical path and dependency management.
 */
export const taskDependencySchema = defineSchema({
  identity: {
    name: 'Task Dependency',
    namePlural: 'Task Dependencies',
    slug: 'core/tasks/dependencies',
    icon: 'GitBranch',
    description: 'Task predecessor and successor relationships',
  },

  data: {
    endpoint: '/api/task-dependencies',
    primaryKey: 'id',
    fields: {
      task_id: {
        type: 'relation',
        label: 'Task',
        required: true,
        inTable: true,
        inForm: true,
      },
      depends_on_task_id: {
        type: 'relation',
        label: 'Depends On',
        required: true,
        inTable: true,
        inForm: true,
      },
      dependency_type: {
        type: 'select',
        label: 'Dependency Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Finish to Start', value: 'finish_to_start' },
          { label: 'Start to Start', value: 'start_to_start' },
          { label: 'Finish to Finish', value: 'finish_to_finish' },
          { label: 'Start to Finish', value: 'start_to_finish' },
        ],
      },
      lag_hours: {
        type: 'number',
        label: 'Lag (hours)',
        inTable: true,
        inForm: true,
        default: 0,
      },
    },
  },

  display: {
    title: () => `Dependency`,
    subtitle: (record) => record.dependency_type || 'finish_to_start',
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: false,
    fields: [],
    placeholder: '',
  },

  filters: {
    quick: [],
    advanced: ['dependency_type'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
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
          title: 'Dependency',
          fields: ['task_id', 'depends_on_task_id', 'dependency_type', 'lag_hours'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['task_id', 'depends_on_task_id', 'dependency_type', 'lag_hours'],
    },
  },

  actions: {
    row: [
      { key: 'delete', label: 'Remove', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: []
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
