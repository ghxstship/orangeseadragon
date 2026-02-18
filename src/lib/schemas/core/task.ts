import { defineSchema } from '../../schema-engine/defineSchema';

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
      start_date: {
        type: 'date',
        label: 'Start Date',
        inTable: false,
        inForm: true,
        sortable: true,
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      estimated_hours: {
        type: 'number',
        label: 'Estimated Hours',
        inForm: true,
        inDetail: true,
        min: 0,
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
        relation: { entity: 'project', display: 'name', searchable: true },
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
        relation: { entity: 'taskList', display: 'name' },
        label: 'List',
        inForm: true,
      },
    },
  },

  relationships: {
    hasMany: [
      { entity: 'task_assignments', foreignKey: 'task_id', label: 'Assignees' },
      { entity: 'task_dependencies', foreignKey: 'task_id', label: 'Dependencies' },
      { entity: 'time_entries', foreignKey: 'task_id', label: 'Time Entries' },
    ],
    belongsTo: [
      { entity: 'projects', foreignKey: 'project_id', label: 'Project' },
      { entity: 'task_lists', foreignKey: 'list_id', label: 'List' },
    ],
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
      availableViews: ['table', 'kanban', 'list', 'calendar', 'matrix', 'timeline'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'subtasks', label: 'Subtasks', content: { type: 'related', entity: 'tasks', foreignKey: 'parent_id', allowCreate: true } },
        {
          key: 'time',
          label: 'Time',
          content: { type: 'related', entity: 'timeEntry', foreignKey: 'task_id', defaultView: 'table', allowCreate: true },
        },
        { key: 'comments', label: 'Comments', content: { type: 'comments' } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          {
            key: 'time_estimated',
            label: 'Estimated',
            value: { type: 'field', field: 'estimated_hours' },
            suffix: 'h',
          },
          {
            key: 'time_logged',
            label: 'Logged',
            value: { type: 'relation-sum', entity: 'timeEntry', foreignKey: 'task_id', field: 'hours' },
            suffix: 'h',
            onClick: { tab: 'time' },
          },
        ],
        blocks: [
          { key: 'details', title: 'Task Details', content: { type: 'fields', fields: ['description', 'due_date', 'priority'] } },
          { key: 'dependencies', title: 'Dependencies', content: { type: 'custom', component: 'TaskDependencies' } },
          { key: 'checklists', title: 'Checklists', content: { type: 'custom', component: 'TaskChecklists' } },
        ]
      },
      sidebar: {
        width: 300,
        collapsible: true,
        defaultState: 'open',
        sections: [
          {
            key: 'properties',
            title: 'Properties',
            content: { type: 'stats', stats: ['status', 'priority', 'assignee_id', 'project_id', 'due_date'] },
          },
          {
            key: 'time_tracking',
            title: 'Time Tracking',
            content: { type: 'stats', stats: ['estimated_hours'] },
          },
          {
            key: 'quick_actions',
            title: 'Quick Actions',
            content: { type: 'quick-actions', actions: ['log-time'] },
          },
          {
            key: 'recent_activity',
            title: 'Recent Activity',
            content: { type: 'activity', limit: 5 },
            collapsible: true,
          },
        ],
      },
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
          fields: ['assignee_id', 'project_id', 'list_id', 'start_date', 'due_date', 'estimated_hours'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'title',
        { field: 'status', format: { type: 'badge', colorMap: { todo: '#6b7280', in_progress: '#3b82f6', in_review: '#eab308', done: '#22c55e' } } },
        { field: 'priority', format: { type: 'badge', colorMap: { low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' } } },
        { field: 'due_date', format: { type: 'date' } },
        { field: 'assignee_id', format: { type: 'relation', entityType: 'person' } },
      ],
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
      startField: 'start_date',
      endField: 'due_date',
      colorField: 'priority',
    },
    timeline: {
      titleField: 'title',
      startField: 'start_date',
      endField: 'due_date',
      groupField: 'assignee_id',
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
