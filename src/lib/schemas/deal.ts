import { defineSchema } from '../schema/defineSchema';

export const dealSchema = defineSchema({
  identity: { name: 'deal', namePlural: 'Deals', slug: 'modules/business/deals', icon: 'Handshake', description: 'Sales deals and opportunities' },
  data: {
    endpoint: '/api/deals', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Deal Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      contactId: { type: 'select', label: 'Contact', inTable: true, inForm: true, options: [] },
      companyId: { type: 'select', label: 'Company', inTable: true, inForm: true, options: [] },
      value: { type: 'currency', label: 'Value', required: true, inTable: true, inForm: true, sortable: true },
      stage: { type: 'select', label: 'Stage', required: true, inTable: true, inForm: true, options: [{ label: 'Prospecting', value: 'prospecting', color: 'gray' }, { label: 'Qualification', value: 'qualification', color: 'blue' }, { label: 'Proposal', value: 'proposal', color: 'yellow' }, { label: 'Negotiation', value: 'negotiation', color: 'orange' }, { label: 'Closed Won', value: 'closed-won', color: 'green' }, { label: 'Closed Lost', value: 'closed-lost', color: 'red' }], default: 'prospecting' },
      probability: { type: 'number', label: 'Probability %', inTable: true, inForm: true },
      closeDate: { type: 'date', label: 'Expected Close', inTable: true, inForm: true, sortable: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => `$${r.value || 0}`, badge: (r: Record<string, unknown>) => r.stage === 'closed-won' ? { label: 'Won', variant: 'success' } : r.stage === 'closed-lost' ? { label: 'Lost', variant: 'destructive' } : { label: String(r.stage), variant: 'secondary' }, defaultSort: { field: 'closeDate', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search deals...' },
  filters: { quick: [{ key: 'open', label: 'Open', query: { where: {} } }], advanced: ['stage', 'companyId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table', 'kanban'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'value', label: 'Value', value: { type: 'field', field: 'value' }, format: 'currency' }, { key: 'prob', label: 'Probability', value: { type: 'field', field: 'probability' }, format: 'percentage' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Deal Details', fields: ['name', 'contactId', 'companyId', 'value', 'stage', 'probability', 'closeDate', 'notes'] }] } },
  views: { table: { columns: ['name', 'companyId', 'value', 'stage', 'probability', 'closeDate'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/deals/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Deal', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
