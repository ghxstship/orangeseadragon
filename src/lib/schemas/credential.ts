import { defineSchema } from '../schema/defineSchema';

export const credentialSchema = defineSchema({
  identity: { name: 'credential', namePlural: 'Credentials', slug: 'modules/workforce/credentials', icon: 'KeyRound', description: 'Staff credentials and passes' },
  data: {
    endpoint: '/api/credentials', primaryKey: 'id',
    fields: {
      personId: { type: 'select', label: 'Person', required: true, inTable: true, inForm: true, options: [] },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'All Access', value: 'all-access', color: 'purple' }, { label: 'Backstage', value: 'backstage', color: 'blue' }, { label: 'Staff', value: 'staff', color: 'green' }, { label: 'Vendor', value: 'vendor', color: 'gray' }] },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Active', value: 'active', color: 'green' }, { label: 'Revoked', value: 'revoked', color: 'red' }, { label: 'Expired', value: 'expired', color: 'gray' }], default: 'active' },
      issuedAt: { type: 'datetime', label: 'Issued At', inTable: true, inForm: true },
      expiresAt: { type: 'datetime', label: 'Expires At', inTable: true, inForm: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.type || 'Credential'), subtitle: (r: Record<string, unknown>) => String(r.personId || ''), badge: (r: Record<string, unknown>) => r.status === 'active' ? { label: 'Active', variant: 'success' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'issuedAt', direction: 'desc' } },
  search: { enabled: true, fields: [], placeholder: 'Search credentials...' },
  filters: { quick: [{ key: 'active', label: 'Active', query: { where: { status: 'active' } } }], advanced: ['type', 'status', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Credential Details', fields: ['personId', 'eventId', 'type', 'status', 'issuedAt', 'expiresAt', 'notes'] }] } },
  views: { table: { columns: ['personId', 'eventId', 'type', 'status', 'expiresAt'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/credentials/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'Issue Credential', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
