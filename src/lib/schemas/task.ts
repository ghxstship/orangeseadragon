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
      importance: {
        type: 'number',
        label: 'Importance',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 10,
        default: 5,
      },
      urgency: {
        type: 'number',
        label: 'Urgency',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 10,
        default: 5,
      },
      eisenhower_quadrant: {
        type: 'number',
        label: 'Quadrant',
        inTable: true,
        readOnly: true,
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
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'todo', label: 'To Do', query: { where: { status: 'todo' } }, count: true },
        { key: 'in-progress', label: 'In Progress', query: { where: { status: 'in_progress' } }, count: true },
        { key: 'in-review', label: 'In Review', query: { where: { status: 'in_review' } }, count: true },
        { key: 'done', label: 'Done', query: { where: { status: 'done' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'list', 'calendar', 'matrix'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'subtasks', label: 'Subtasks', content: { type: 'related', entity: 'tasks', foreignKey: 'parent_id' } },
        { key: 'comments', label: 'Comments', content: { type: 'related', entity: 'comments', foreignKey: 'task_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Task Details', content: { type: 'fields', fields: ['description', 'due_date', 'priority'] } },
          { key: 'dependencies', title: 'Dependencies', content: { type: 'custom', component: 'TaskDependencies' } },
          { key: 'checklists', title: 'Checklists', content: { type: 'custom', component: 'TaskChecklists' } },
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
    list: {
      titleField: 'title',
      subtitleField: 'project_id',
      metaFields: ['due_date', 'assignee_id'],
      showChevron: true,
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
    calendar: {
      titleField: 'title',
      startField: 'due_date',
      colorField: 'priority',
    },
    matrix: {
      type: 'eisenhower',
      xAxis: 'urgency',
      yAxis: 'importance',
      quadrants: [
        { id: 1, label: 'Do First', description: 'Urgent & Important', color: 'red' },
        { id: 2, label: 'Schedule', description: 'Important but Not Urgent', color: 'blue' },
        { id: 3, label: 'Delegate', description: 'Urgent but Not Important', color: 'yellow' },
        { id: 4, label: 'Eliminate', description: 'Neither Urgent nor Important', color: 'gray' },
      ]
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/tasks/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/core/tasks/${record.id}/edit` } },
    ],
    bulk: [
      { key: 'complete', label: 'Mark Complete', handler: { type: 'function', fn: () => { } } },
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
