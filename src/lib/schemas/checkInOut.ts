import { defineSchema } from '../schema/defineSchema';

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
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => `${r.type} - ${r.assetId}`, subtitle: (r: Record<string, unknown>) => String(r.timestamp || ''), badge: (r: Record<string, unknown>) => r.type === 'check-in' ? { label: 'Check In', variant: 'success' } : { label: 'Check Out', variant: 'warning' }, defaultSort: { field: 'timestamp', direction: 'desc' } },
  search: { enabled: true, fields: [], placeholder: 'Search records...' },
  filters: { quick: [], advanced: ['type', 'assetId', 'personId', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Check In/Out Details', fields: ['assetId', 'personId', 'eventId', 'type', 'timestamp', 'condition', 'notes'] }] } },
  views: { table: { columns: ['assetId', 'personId', 'type', 'timestamp', 'condition'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/check/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Record', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
