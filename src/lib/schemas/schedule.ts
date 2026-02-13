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
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'active', label: 'Active', query: { where: { startDate: { lte: 'now' }, endDate: { gte: 'now' } } }, count: true }, { key: 'upcoming', label: 'Upcoming', query: { where: { startDate: { gte: 'now' } } }, count: true }, { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true }, { key: 'published', label: 'Published', query: { where: { status: 'published' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Details', fields: ['name', 'eventId', 'startDate', 'endDate', 'status', 'notes'] }] } },
  views: { table: { columns: [
        'name',
        { field: 'eventId', format: { type: 'relation', entityType: 'event' } },
        { field: 'startDate', format: { type: 'date' } },
        { field: 'endDate', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/schedules/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Schedule', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'eventId', label: 'Event' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
