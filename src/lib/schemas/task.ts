import { defineSchema } from '../schema/defineSchema';

/**
 * TASK ENTITY SCHEMA (SSOT)
 */
export const taskSchema = defineSchema({
  identity: {
    name: 'Task',
    namePlural: 'Tasks',
    slug: 'core/tasks',
    icon: 'CheckSquare',
    description: 'Manage tasks and to-dos',
  },

  data: {
    endpoint: '/api/tasks',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        placeholder: 'Enter task title',
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
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'To Do', value: 'todo' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'In Review', value: 'in_review' },
          { label: 'Done', value: 'done' },
        ],
      },
      priority: {
        type: 'select',
        label: 'Priority',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
          { label: 'Urgent', value: 'urgent' },
        ],
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      assignee_id: {
        type: 'relation',
        label: 'Assignee',
        inTable: true,
        inForm: true,
      },
      project_id: {
        type: 'relation',
        label: 'Project',
        inTable: true,
        inForm: true,
      },
      list_id: {
        type: 'relation',
        label: 'List',
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Untitled Task',
    subtitle: (record) => record.status || 'No Status',
    badge: (record) => {
      if (record.priority === 'urgent') return { label: 'Urgent', variant: 'destructive' };
      if (record.priority === 'high') return { label: 'High', variant: 'warning' };
      return undefined;
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description'],
    placeholder: 'Search tasks...',
  },

  filters: {
    quick: [
      { key: 'my-tasks', label: 'My Tasks', query: { where: {} } },
      { key: 'overdue', label: 'Overdue', query: { where: { due_date: { lt: 'now' }, status: { neq: 'done' } } } },
    ],
    advanced: ['status', 'priority', 'assignee_id', 'project_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Tasks', query: { where: {} } },
        { key: 'todo', label: 'To Do', query: { where: { status: 'todo' } } },
        { key: 'in-progress', label: 'In Progress', query: { where: { status: 'in_progress' } } },
        { key: 'done', label: 'Done', query: { where: { status: 'done' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'comments', label: 'Comments', content: { type: 'related', entity: 'comments', foreignKey: 'task_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Task Details', content: { type: 'fields', fields: ['description', 'due_date', 'priority'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Task Details',
          fields: ['title', 'description', 'status', 'priority'],
        },
        {
          key: 'assignment',
          title: 'Assignment',
          fields: ['assignee_id', 'project_id', 'list_id', 'due_date'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['title', 'status', 'priority', 'due_date', 'assignee_id'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'todo', label: 'To Do', color: 'gray' },
        { value: 'in_progress', label: 'In Progress', color: 'blue' },
        { value: 'in_review', label: 'In Review', color: 'yellow' },
        { value: 'done', label: 'Done', color: 'green' },
      ],
      card: {
        title: 'title',
        subtitle: 'project_id',
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/tasks/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/core/tasks/${record.id}/edit` } },
    ],
    bulk: [
      { key: 'complete', label: 'Mark Complete', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Task', variant: 'primary', handler: { type: 'navigate', path: () => '/core/tasks/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
