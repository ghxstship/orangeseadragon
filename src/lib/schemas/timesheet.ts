import { defineSchema } from '../schema/defineSchema';

export const timesheetSchema = defineSchema({
  identity: { name: 'timesheet', namePlural: 'Timesheets', slug: 'modules/workforce/timesheets', icon: 'ClockIcon', description: 'Time tracking and timesheets' },
  data: {
    endpoint: '/api/timesheets', primaryKey: 'id',
    fields: {
      user_id: { type: 'select', label: 'Person', required: true, inTable: true, inForm: true, options: [] },
      period_start: { type: 'date', label: 'Period Start', required: true, inTable: true, inForm: true, sortable: true },
      period_end: { type: 'date', label: 'Period End', required: true, inTable: true, inForm: true },
      total_regular_hours: { type: 'number', label: 'Regular Hours', inTable: true },
      total_overtime_hours: { type: 'number', label: 'Overtime Hours', inTable: true },
      total_amount: { type: 'currency', label: 'Total Amount', inTable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Submitted', value: 'submitted', color: 'yellow' }, { label: 'Approved', value: 'approved', color: 'green' }, { label: 'Rejected', value: 'rejected', color: 'red' }, { label: 'Paid', value: 'paid', color: 'blue' }], default: 'draft' },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => `Timesheet - ${r.period_start}`, subtitle: (r: Record<string, unknown>) => `${r.total_regular_hours || 0} hours`, badge: (r: Record<string, unknown>) => r.status === 'approved' ? { label: 'Approved', variant: 'success' } : r.status === 'rejected' ? { label: 'Rejected', variant: 'destructive' } : r.status === 'submitted' ? { label: 'Submitted', variant: 'warning' } : { label: 'Draft', variant: 'secondary' }, defaultSort: { field: 'period_start', direction: 'desc' } },
  search: { enabled: true, fields: [], placeholder: 'Search timesheets...' },
  filters: { quick: [{ key: 'submitted', label: 'Submitted', query: { where: { status: 'submitted' } } }], advanced: ['status'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'submitted', label: 'Submitted', query: { where: { status: 'submitted' } }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'hours', label: 'Hours', value: { type: 'field', field: 'total_regular_hours' } }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Timesheet Details', fields: ['user_id', 'period_start', 'period_end', 'status', 'notes'] }] } },
  views: { table: { columns: ['user_id', 'period_start', 'period_end', 'total_regular_hours', 'total_amount', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/timesheets/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Timesheet', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
