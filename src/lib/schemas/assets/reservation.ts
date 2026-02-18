import { defineSchema } from '../../schema-engine/defineSchema';

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
      conflict_checked: { type: 'checkbox', label: 'Conflict Checked', inDetail: true, default: false },
      has_conflicts: { type: 'checkbox', label: 'Has Conflicts', inDetail: true, default: false },
      conflict_details: { type: 'json', label: 'Conflict Details', inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => `Reservation - ${r.assetId}`, subtitle: (r: Record<string, unknown>) => `${r.startDate} - ${r.endDate}`, badge: (r: Record<string, unknown>) => r.status === 'approved' ? { label: 'Approved', variant: 'success' } : r.status === 'rejected' ? { label: 'Rejected', variant: 'destructive' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'startDate', direction: 'desc' } },
  search: { enabled: true, fields: [], placeholder: 'Search reservations...' },
  filters: { quick: [{ key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } }], advanced: ['status', 'assetId', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true }, { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } }, count: true }, { key: 'checked-out', label: 'Checked Out', query: { where: { status: 'checked_out' } } }, { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } }], defaultView: 'table', availableViews: ['table', 'calendar'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Reservation Details', fields: ['assetId', 'eventId', 'requestedBy', 'startDate', 'endDate', 'status', 'notes'] }] } },
  views: { table: { columns: [
    { field: 'assetId', format: { type: 'relation', entityType: 'asset' } },
    { field: 'eventId', format: { type: 'relation', entityType: 'event' } },
    { field: 'requestedBy', format: { type: 'relation', entityType: 'person' } },
    { field: 'startDate', format: { type: 'datetime' } },
    { field: 'endDate', format: { type: 'datetime' } },
    { field: 'status', format: { type: 'badge', colorMap: { pending: '#eab308', approved: '#22c55e', rejected: '#ef4444', completed: '#6b7280' } } },
  ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/reservations/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Reservation', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'asset', foreignKey: 'assetId', label: 'Asset' },
      { entity: 'event', foreignKey: 'eventId', label: 'Event' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
