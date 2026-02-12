import { defineSchema } from '../schema/defineSchema';

export const contractSchema = defineSchema({
  identity: { name: 'contract', namePlural: 'Contracts', slug: 'modules/business/contracts', icon: 'FileCheck', description: 'Business contracts and agreements' },
  data: {
    endpoint: '/api/contracts', primaryKey: 'id',
    fields: {
      title: { type: 'text', label: 'Title', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      companyId: { type: 'select', label: 'Company', required: true, inTable: true, inForm: true, options: [] },
      dealId: { type: 'select', label: 'Deal', inTable: true, inForm: true, options: [] },
      value: { type: 'currency', label: 'Value', required: true, inTable: true, inForm: true, sortable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Pending', value: 'pending', color: 'yellow' }, { label: 'Active', value: 'active', color: 'green' }, { label: 'Expired', value: 'expired', color: 'red' }, { label: 'Terminated', value: 'terminated', color: 'orange' }], default: 'draft' },
      startDate: { type: 'date', label: 'Start Date', required: true, inTable: true, inForm: true, sortable: true },
      endDate: { type: 'date', label: 'End Date', required: true, inTable: true, inForm: true },
      terms: { type: 'textarea', label: 'Terms', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.title || 'Untitled'), subtitle: (r: Record<string, unknown>) => `$${r.value || 0}`, badge: (r: Record<string, unknown>) => r.status === 'active' ? { label: 'Active', variant: 'success' } : r.status === 'expired' ? { label: 'Expired', variant: 'destructive' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'startDate', direction: 'desc' } },
  search: { enabled: true, fields: ['title'], placeholder: 'Search contracts...' },
  filters: { quick: [{ key: 'active', label: 'Active', query: { where: { status: 'active' } } }], advanced: ['status', 'companyId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true }, { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true }, { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true }, { key: 'expiring', label: 'Expiring', query: { where: { status: 'active', endDate: { lte: '{{now + 30d}}' } } }, count: true }, { key: 'expired', label: 'Expired', query: { where: { status: 'expired' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'value', label: 'Value', value: { type: 'field', field: 'value' }, format: 'currency' }], blocks: [{ key: 'terms', title: 'Terms', content: { type: 'fields', fields: ['terms'] } }] } }, form: { sections: [{ key: 'basic', title: 'Contract Details', fields: ['title', 'companyId', 'dealId', 'value', 'status', 'startDate', 'endDate', 'terms'] }] } },
  views: { table: { columns: [
    'title',
    { field: 'companyId', format: { type: 'relation', entityType: 'company' } },
    { field: 'value', format: { type: 'currency' } },
    { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', active: '#22c55e', expired: '#ef4444', cancelled: '#6b7280' } } },
    { field: 'startDate', format: { type: 'date' } },
    { field: 'endDate', format: { type: 'date' } },
  ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/contracts/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Contract', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
