import { defineSchema } from '../schema/defineSchema';

export const scheduleSchema = defineSchema({
  identity: { name: 'schedule', namePlural: 'Schedules', slug: 'modules/workforce/schedules', icon: 'CalendarRange', description: 'Staff schedules and assignments' },
  data: {
    endpoint: '/api/schedules', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Schedule Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      startDate: { type: 'date', label: 'Start Date', required: true, inTable: true, inForm: true, sortable: true },
      endDate: { type: 'date', label: 'End Date', required: true, inTable: true, inForm: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Published', value: 'published', color: 'green' }, { label: 'Locked', value: 'locked', color: 'blue' }], default: 'draft' },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => `${r.startDate} - ${r.endDate}`, badge: (r: Record<string, unknown>) => r.status === 'published' ? { label: 'Published', variant: 'success' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'startDate', direction: 'desc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search schedules...' },
  filters: { quick: [], advanced: ['status', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Details', fields: ['name', 'eventId', 'startDate', 'endDate', 'status', 'notes'] }] } },
  views: { table: { columns: ['name', 'eventId', 'startDate', 'endDate', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/schedules/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Schedule', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
