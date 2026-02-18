import { defineSchema } from '../schema/defineSchema';

export const trainingAssignmentSchema = defineSchema({
  identity: {
    name: 'Training Assignment',
    namePlural: 'Training Assignments',
    slug: 'modules/workforce/training/assignments',
    icon: 'ClipboardCheck',
    description: 'Employee training assignments and progress',
  },
  data: {
    endpoint: '/api/training_assignments',
    primaryKey: 'id',
    fields: {
      program_id: {
        type: 'relation',
        label: 'Training Program',
        required: true,
        inTable: true,
        inForm: true,
      },
      user_id: {
        type: 'relation',
        label: 'Employee',
        required: true,
        inTable: true,
        inForm: true,
      },
      assigned_by: {
        type: 'relation',
        label: 'Assigned By',
        inTable: true,
        inDetail: true,
        relation: { entity: 'user', display: 'full_name' },
      },
      assigned_at: {
        type: 'datetime',
        label: 'Assigned At',
        inDetail: true,
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Assigned', value: 'assigned' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Expired', value: 'expired' },
          { label: 'Waived', value: 'waived' },
        ],
        default: 'assigned',
      },
      started_at: {
        type: 'datetime',
        label: 'Started At',
        inDetail: true,
      },
      completed_at: {
        type: 'datetime',
        label: 'Completed At',
        inTable: true,
        inDetail: true,
      },
      score: {
        type: 'number',
        label: 'Score',
        inTable: true,
        inDetail: true,
        helpText: 'Score achieved (0-100)',
      },
      passed: {
        type: 'switch',
        label: 'Passed',
        inTable: true,
        inDetail: true,
      },
      attempts: {
        type: 'number',
        label: 'Attempts',
        inDetail: true,
        default: 0,
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
    title: (r: Record<string, unknown>) => {
      const program = r.program as Record<string, unknown> | undefined;
      const user = r.user as Record<string, unknown> | undefined;
      if (program && user) {
        return `${user.full_name} - ${program.name}`;
      }
      return 'Training Assignment';
    },
    subtitle: (r: Record<string, unknown>) => {
      if (r.due_date) {
        return `Due: ${new Date(String(r.due_date)).toLocaleDateString()}`;
      }
      return '';
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        assigned: 'secondary',
        in_progress: 'warning',
        completed: 'success',
        expired: 'destructive',
        waived: 'outline',
      };
      return { label: String(r.status || 'assigned'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'due_date', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['user_id', 'program_id'],
    placeholder: 'Search assignments...',
  },
  filters: {
    quick: [
      { key: 'overdue', label: 'Overdue', query: { where: { status: ['assigned', 'in_progress'], due_date: { lt: 'now' } } } },
      { key: 'in_progress', label: 'In Progress', query: { where: { status: 'in_progress' } } },
      { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
    ],
    advanced: ['status', 'program_id', 'user_id', 'passed'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: ['assigned', 'in_progress'] } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } }, count: true },
        { key: 'overdue', label: 'Overdue', query: { where: { status: ['assigned', 'in_progress'], due_date: { lt: 'now' } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'score', label: 'Score', value: { type: 'field', field: 'score' }, format: 'number' },
          { key: 'attempts', label: 'Attempts', value: { type: 'field', field: 'attempts' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Assignment Details', content: { type: 'fields', fields: ['program_id', 'user_id', 'status', 'due_date'] } },
          { key: 'progress', title: 'Progress', content: { type: 'fields', fields: ['started_at', 'completed_at', 'score', 'passed'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Assignment Details', fields: ['program_id', 'user_id', 'due_date', 'status'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['user_id', 'program_id', 'status', 'due_date', 'score', 'passed'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/training/assignments/${r.id}` } },
      { key: 'mark_complete', label: 'Mark Complete', handler: { type: 'api', endpoint: '/api/training_assignments/{id}/complete', method: 'POST' } },
    ],
    bulk: [
      { key: 'remind', label: 'Send Reminder', handler: { type: 'api', endpoint: '/api/training_assignments/{id}/remind', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'New Assignment', variant: 'primary', handler: { type: 'navigate', path: '/people/training/assignments/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'user_id', label: 'User' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
