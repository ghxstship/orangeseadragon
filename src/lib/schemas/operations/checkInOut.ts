import { defineSchema } from '../../schema-engine/defineSchema';

export const checkInOutSchema = defineSchema({
  identity: { name: 'checkInOut', namePlural: 'Check In/Out', slug: 'modules/assets/check', icon: 'ClipboardCheck', description: 'Asset check in and check out records' },
  data: {
    endpoint: '/api/asset_check_actions', primaryKey: 'id',
    fields: {
      assetId: { type: 'select', label: 'Asset', required: true, inTable: true, inForm: true, options: [] },
      personId: { type: 'select', label: 'Person', required: true, inTable: true, inForm: true, options: [] },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'Check Out', value: 'check-out', color: 'orange' }, { label: 'Check In', value: 'check-in', color: 'green' }] },
      timestamp: { type: 'datetime', label: 'Timestamp', required: true, inTable: true, inForm: true, sortable: true },
      condition: { type: 'select', label: 'Condition', inTable: true, inForm: true, options: [{ label: 'Good', value: 'good', color: 'green' }, { label: 'Fair', value: 'fair', color: 'yellow' }, { label: 'Poor', value: 'poor', color: 'orange' }, { label: 'Damaged', value: 'damaged', color: 'red' }] },
      photo_before: { type: 'image', label: 'Photo (Before)', inForm: true, inDetail: true },
      photo_after: { type: 'image', label: 'Photo (After)', inForm: true, inDetail: true },
      signature: { type: 'text', label: 'Signature', inForm: true, inDetail: true },
      gps_latitude: { type: 'number', label: 'GPS Latitude', inDetail: true },
      gps_longitude: { type: 'number', label: 'GPS Longitude', inDetail: true },
      offline_sync_status: { type: 'select', label: 'Sync Status', inDetail: true, options: [{ label: 'Synced', value: 'synced', color: 'green' }, { label: 'Pending', value: 'pending', color: 'yellow' }, { label: 'Failed', value: 'failed', color: 'red' }], default: 'synced' },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => `${r.type} - ${r.assetId}`, subtitle: (r: Record<string, unknown>) => String(r.timestamp || ''), badge: (r: Record<string, unknown>) => r.type === 'check-in' ? { label: 'Check In', variant: 'success' } : { label: 'Check Out', variant: 'warning' }, defaultSort: { field: 'timestamp', direction: 'desc' } },
  search: { enabled: true, fields: [], placeholder: 'Search records...' },
  filters: { quick: [], advanced: ['type', 'assetId', 'personId', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'check-out', label: 'Check Out', query: { where: { type: 'check-out' } }, count: true }, { key: 'check-in', label: 'Check In', query: { where: { type: 'check-in' } } }, { key: 'today', label: 'Today', query: { where: { timestamp: { gte: 'today', lt: 'tomorrow' } } }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Check In/Out Details', fields: ['assetId', 'personId', 'eventId', 'type', 'timestamp', 'condition', 'notes'] }] } },
  views: { table: { columns: [
    { field: 'assetId', format: { type: 'relation', entityType: 'asset' } },
    { field: 'personId', format: { type: 'relation', entityType: 'person' } },
    { field: 'type', format: { type: 'badge', colorMap: { 'check-out': '#f59e0b', 'check-in': '#22c55e' } } },
    { field: 'timestamp', format: { type: 'datetime' } },
    { field: 'condition', format: { type: 'badge', colorMap: { good: '#22c55e', fair: '#eab308', poor: '#f59e0b', damaged: '#ef4444' } } },
  ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/check/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Record', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'asset', foreignKey: 'assetId', label: 'Asset' },
      { entity: 'event', foreignKey: 'eventId', label: 'Event' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
