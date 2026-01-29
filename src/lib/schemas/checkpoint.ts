import { defineSchema } from '../schema/defineSchema';

export const checkpointSchema = defineSchema({
  identity: { name: 'checkpoint', namePlural: 'Checkpoints', slug: 'modules/operations/checkpoints', icon: 'ShieldCheck', description: 'Security checkpoints and access points' },
  data: {
    endpoint: '/api/checkpoints', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Checkpoint Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      venueId: { type: 'select', label: 'Venue', required: true, inTable: true, inForm: true, options: [] },
      zoneId: { type: 'select', label: 'Zone', inTable: true, inForm: true, options: [] },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'Entry', value: 'entry', color: 'green' }, { label: 'Exit', value: 'exit', color: 'blue' }, { label: 'Security', value: 'security', color: 'red' }] },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Active', value: 'active', color: 'green' }, { label: 'Inactive', value: 'inactive', color: 'gray' }], default: 'active' },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => String(r.type || ''), badge: (r: Record<string, unknown>) => r.status === 'active' ? { label: 'Active', variant: 'success' } : { label: 'Inactive', variant: 'secondary' }, defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search checkpoints...' },
  filters: { quick: [], advanced: ['type', 'status', 'venueId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Details', fields: ['name', 'venueId', 'zoneId', 'type', 'status', 'notes'] }] } },
  views: { table: { columns: ['name', 'venueId', 'type', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/checkpoints/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Checkpoint', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
