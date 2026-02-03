import { defineSchema } from '../schema/defineSchema';

export const leadSchema = defineSchema({
  identity: { name: 'lead', namePlural: 'Leads', slug: 'modules/business/leads', icon: 'Target', description: 'Sales leads and prospects' },
  data: {
    endpoint: '/api/leads', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Lead Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      contactId: { type: 'select', label: 'Contact', inTable: true, inForm: true, options: [] },
      companyId: { type: 'select', label: 'Company', inTable: true, inForm: true, options: [] },
      source: { type: 'select', label: 'Source', inTable: true, inForm: true, options: [{ label: 'Website', value: 'website', color: 'blue' }, { label: 'Referral', value: 'referral', color: 'green' }, { label: 'Event', value: 'event', color: 'purple' }, { label: 'Cold Call', value: 'cold-call', color: 'gray' }, { label: 'Other', value: 'other', color: 'orange' }] },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'New', value: 'new', color: 'blue' }, { label: 'Contacted', value: 'contacted', color: 'yellow' }, { label: 'Qualified', value: 'qualified', color: 'green' }, { label: 'Unqualified', value: 'unqualified', color: 'gray' }, { label: 'Converted', value: 'converted', color: 'purple' }], default: 'new' },
      value: { type: 'currency', label: 'Estimated Value', inTable: true, inForm: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => `$${r.value || 0}`, badge: (r: Record<string, unknown>) => r.status === 'qualified' ? { label: 'Qualified', variant: 'success' } : r.status === 'converted' ? { label: 'Converted', variant: 'secondary' } : { label: String(r.status), variant: 'warning' }, defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search leads...' },
  filters: { quick: [{ key: 'new', label: 'New', query: { where: { status: 'new' } } }, { key: 'qualified', label: 'Qualified', query: { where: { status: 'qualified' } } }], advanced: ['status', 'source'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'new', label: 'New', query: { where: { status: 'new' } }, count: true }, { key: 'contacted', label: 'Contacted', query: { where: { status: 'contacted' } }, count: true }, { key: 'qualified', label: 'Qualified', query: { where: { status: 'qualified' } }, count: true }, { key: 'converted', label: 'Converted', query: { where: { status: 'converted' } } }], defaultView: 'table', availableViews: ['table', 'kanban'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'value', label: 'Value', value: { type: 'field', field: 'value' }, format: 'currency' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Lead Details', fields: ['name', 'contactId', 'companyId', 'source', 'status', 'value', 'notes'] }] } },
  views: { table: { columns: ['name', 'companyId', 'source', 'status', 'value'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/leads/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Lead', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
