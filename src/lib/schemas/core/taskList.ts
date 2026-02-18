import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * TASK LIST ENTITY SCHEMA (SSOT)
 */
export const taskListSchema = defineSchema({
  identity: {
    name: 'Task List',
    namePlural: 'Task Lists',
    slug: 'core/tasks/lists',
    icon: 'ListChecks',
    description: 'Organize tasks into lists',
  },

  data: {
    endpoint: '/api/task_lists',
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
      color: {
        type: 'select',
        label: 'Color',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Blue', value: 'blue' },
          { label: 'Green', value: 'green' },
          { label: 'Red', value: 'red' },
          { label: 'Yellow', value: 'yellow' },
          { label: 'Purple', value: 'purple' },
          { label: 'Gray', value: 'gray' },
        ],
      },
      icon: {
        type: 'text',
        label: 'Icon',
        inForm: true,
      },
      is_default: {
        type: 'switch',
        label: 'Default List',
        inTable: true,
        inForm: true,
      },
      task_count: {
        type: 'number',
        label: 'Tasks',
        inTable: true,
      },
      completed_count: {
        type: 'number',
        label: 'Completed',
        inTable: true,
      },
      sort_order: {
        type: 'number',
        label: 'Sort Order',
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Untitled List',
    subtitle: (record) => `${record.task_count || 0} tasks`,
    defaultSort: { field: 'sort_order', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search lists...',
  },

  filters: {
    quick: [],
    advanced: [],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Lists', query: { where: {} } },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table'],
    },
    detail: {
      tabs: [
        { key: 'tasks', label: 'Tasks', content: { type: 'related', entity: 'tasks', foreignKey: 'list_id' } },
        { key: 'settings', label: 'Settings', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'tasks', label: 'Total Tasks', value: { type: 'field', field: 'task_count' }, format: 'number' },
          { key: 'completed', label: 'Completed', value: { type: 'field', field: 'completed_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'List Details',
          fields: ['name', 'description', 'color', 'icon'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['is_default', 'sort_order'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'color', 'task_count', 'completed_count', 'is_default'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/tasks/lists/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New List', variant: 'primary', handler: { type: 'navigate', path: () => '/core/tasks/lists/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
