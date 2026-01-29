import { defineSchema } from '../schema/defineSchema';

export const reservationSchema = defineSchema({
  identity: { name: 'reservation', namePlural: 'Reservations', slug: 'modules/assets/reservations', icon: 'CalendarCheck', description: 'Asset reservations and bookings' },
  data: {
    endpoint: '/api/asset_reservations', primaryKey: 'id',
    fields: {
      assetId: { type: 'select', label: 'Asset', required: true, inTable: true, inForm: true, options: [] },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      requestedBy: { type: 'select', label: 'Requested By', required: true, inTable: true, inForm: true, options: [] },
      startDate: { type: 'datetime', label: 'Start', required: true, inTable: true, inForm: true, sortable: true },
      endDate: { type: 'datetime', label: 'End', required: true, inTable: true, inForm: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Pending', value: 'pending', color: 'yellow' }, { label: 'Approved', value: 'approved', color: 'green' }, { label: 'Rejected', value: 'rejected', color: 'red' }, { label: 'Completed', value: 'completed', color: 'gray' }], default: 'pending' },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => `Reservation - ${r.assetId}`, subtitle: (r: Record<string, unknown>) => `${r.startDate} - ${r.endDate}`, badge: (r: Record<string, unknown>) => r.status === 'approved' ? { label: 'Approved', variant: 'success' } : r.status === 'rejected' ? { label: 'Rejected', variant: 'destructive' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'startDate', direction: 'desc' } },
  search: { enabled: true, fields: [], placeholder: 'Search reservations...' },
  filters: { quick: [{ key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } }], advanced: ['status', 'assetId', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true }], defaultView: 'table', availableViews: ['table', 'calendar'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Reservation Details', fields: ['assetId', 'eventId', 'requestedBy', 'startDate', 'endDate', 'status', 'notes'] }] } },
  views: { table: { columns: ['assetId', 'eventId', 'requestedBy', 'startDate', 'endDate', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/reservations/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Reservation', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
