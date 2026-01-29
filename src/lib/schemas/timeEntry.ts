import { defineSchema } from '../schema/defineSchema';

export const timeEntrySchema = defineSchema({
  identity: {
    name: 'Time Entry',
    namePlural: 'Time Entries',
    slug: 'modules/projects/time',
    icon: 'Timer',
    description: 'Project time tracking and logging',
  },
  data: {
    endpoint: '/api/time_entries',
    primaryKey: 'id',
    fields: {
      project_id: {
        type: 'relation',
        label: 'Project',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'project', display: 'name' },
      },
      task_id: {
        type: 'relation',
        label: 'Task',
        inTable: true,
        inForm: true,
        relation: { entity: 'task', display: 'name' },
      },
      user_id: {
        type: 'relation',
        label: 'User',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      date: {
        type: 'date',
        label: 'Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      hours: {
        type: 'number',
        label: 'Hours',
        required: true,
        inTable: true,
        inForm: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      billable: {
        type: 'switch',
        label: 'Billable',
        inTable: true,
        inForm: true,
        default: true,
      },
      hourly_rate: {
        type: 'currency',
        label: 'Hourly Rate',
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
          { label: 'Draft', value: 'draft' },
          { label: 'Submitted', value: 'submitted' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Invoiced', value: 'invoiced' },
        ],
        default: 'draft',
      },
      approved_by_id: {
        type: 'relation',
        label: 'Approved By',
        inDetail: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      approved_at: {
        type: 'datetime',
        label: 'Approved At',
        inDetail: true,
      },
      invoice_id: {
        type: 'relation',
        label: 'Invoice',
        inDetail: true,
        relation: { entity: 'invoice', display: 'invoice_number' },
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const project = r.project as Record<string, unknown> | undefined;
      return project ? String(project.name || 'Time Entry') : 'Time Entry';
    },
    subtitle: (r: Record<string, unknown>) => `${r.hours || 0} hours`,
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        submitted: 'warning',
        approved: 'success',
        rejected: 'destructive',
        invoiced: 'default',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'date', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['description'],
    placeholder: 'Search time entries...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending Approval', query: { where: { status: 'submitted' } } },
      { key: 'billable', label: 'Billable', query: { where: { billable: true } } },
    ],
    advanced: ['project_id', 'user_id', 'status', 'billable'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'submitted' } }, count: true },
        { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } }, count: true },
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
          { key: 'hours', label: 'Hours', value: { type: 'field', field: 'hours' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Entry Details', content: { type: 'fields', fields: ['project_id', 'task_id', 'user_id', 'date', 'hours', 'billable', 'status'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Time Entry', fields: ['project_id', 'task_id', 'user_id', 'date'] },
        { key: 'time', title: 'Time', fields: ['hours', 'description'] },
        { key: 'billing', title: 'Billing', fields: ['billable', 'hourly_rate', 'status'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['date', 'project_id', 'user_id', 'hours', 'billable', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/time/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/time_entries', method: 'PATCH' }, condition: (r: Record<string, unknown>) => r.status === 'submitted' },
    ],
    bulk: [
      { key: 'approve', label: 'Approve Selected', handler: { type: 'api', endpoint: '/api/time_entries/bulk-approve', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'Log Time', variant: 'primary', handler: { type: 'navigate', path: '/productions/time/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
