import { defineSchema } from '../schema-engine/defineSchema';

export const proposalSchema = defineSchema({
  identity: { name: 'proposal', namePlural: 'Proposals', slug: 'modules/business/proposals', icon: 'FileSignature', description: 'Business proposals and quotes' },
  data: {
    endpoint: '/api/proposals', primaryKey: 'id',
    fields: {
      title: { type: 'text', label: 'Title', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      dealId: { type: 'select', label: 'Deal', inTable: true, inForm: true, options: [] },
      companyId: { type: 'select', label: 'Company', inTable: true, inForm: true, options: [] },
      amount: { type: 'currency', label: 'Amount', required: true, inTable: true, inForm: true, sortable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Sent', value: 'sent', color: 'blue' }, { label: 'Viewed', value: 'viewed', color: 'yellow' }, { label: 'Accepted', value: 'accepted', color: 'green' }, { label: 'Rejected', value: 'rejected', color: 'red' }], default: 'draft' },
      validUntil: { type: 'date', label: 'Valid Until', inTable: true, inForm: true },
      content: { type: 'textarea', label: 'Content', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.title || 'Untitled'), subtitle: (r: Record<string, unknown>) => `$${r.amount || 0}`, badge: (r: Record<string, unknown>) => r.status === 'accepted' ? { label: 'Accepted', variant: 'success' } : r.status === 'rejected' ? { label: 'Rejected', variant: 'destructive' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'validUntil', direction: 'desc' } },
  search: { enabled: true, fields: ['title'], placeholder: 'Search proposals...' },
  filters: { quick: [{ key: 'sent', label: 'Sent', query: { where: { status: 'sent' } } }], advanced: ['status', 'companyId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true }, { key: 'sent', label: 'Sent', query: { where: { status: 'sent' } }, count: true }, { key: 'viewed', label: 'Viewed', query: { where: { status: 'viewed' } }, count: true }, { key: 'accepted', label: 'Accepted', query: { where: { status: 'accepted' } } }, { key: 'rejected', label: 'Rejected', query: { where: { status: 'rejected' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'amount', label: 'Amount', value: { type: 'field', field: 'amount' }, format: 'currency' }], blocks: [{ key: 'content', title: 'Content', content: { type: 'fields', fields: ['content'] } }] } }, form: { sections: [{ key: 'basic', title: 'Proposal Details', fields: ['title', 'dealId', 'companyId', 'amount', 'status', 'validUntil', 'content'] }] } },
  views: { table: { columns: ['title', 'companyId', 'amount', 'status', 'validUntil'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/proposals/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Proposal', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'deal', foreignKey: 'dealId', label: 'Deal' },
      { entity: 'company', foreignKey: 'companyId', label: 'Company' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
