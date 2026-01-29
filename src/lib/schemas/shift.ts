import { defineSchema } from '../schema/defineSchema';

export const shiftSchema = defineSchema({
  identity: { name: 'shift', namePlural: 'Shifts', slug: 'modules/workforce/shifts', icon: 'Clock', description: 'Work shifts and time slots' },
  data: {
    endpoint: '/api/shifts', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Shift Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      scheduleId: { type: 'select', label: 'Schedule', inTable: true, inForm: true, options: [] },
      personId: { type: 'select', label: 'Assigned To', inTable: true, inForm: true, options: [] },
      positionId: { type: 'select', label: 'Position', inTable: true, inForm: true, options: [] },
      startTime: { type: 'datetime', label: 'Start Time', required: true, inTable: true, inForm: true, sortable: true },
      endTime: { type: 'datetime', label: 'End Time', required: true, inTable: true, inForm: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Scheduled', value: 'scheduled', color: 'blue' }, { label: 'Confirmed', value: 'confirmed', color: 'green' }, { label: 'Completed', value: 'completed', color: 'gray' }, { label: 'Cancelled', value: 'cancelled', color: 'red' }], default: 'scheduled' },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled Shift'), subtitle: (r: Record<string, unknown>) => String(r.startTime || ''), badge: (r: Record<string, unknown>) => r.status === 'confirmed' ? { label: 'Confirmed', variant: 'success' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'startTime', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search shifts...' },
  filters: { quick: [{ key: 'scheduled', label: 'Scheduled', query: { where: { status: 'scheduled' } } }], advanced: ['status', 'scheduleId', 'positionId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table', 'calendar'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Shift Details', fields: ['name', 'scheduleId', 'personId', 'positionId', 'startTime', 'endTime', 'status', 'notes'] }] } },
  views: { table: { columns: ['name', 'personId', 'positionId', 'startTime', 'endTime', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/shifts/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Shift', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
