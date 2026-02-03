import { defineSchema } from '../schema/defineSchema';

export const companySchema = defineSchema({
  identity: { name: 'company', namePlural: 'Companies', slug: 'modules/business/companies', icon: 'Building2', description: 'Companies and organizations' },
  data: {
    endpoint: '/api/companies', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Company Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      company_type: { type: 'select', label: 'Type', inTable: true, inForm: true, options: [{ label: 'Client', value: 'client', color: 'blue' }, { label: 'Vendor', value: 'vendor', color: 'green' }, { label: 'Partner', value: 'partner', color: 'purple' }, { label: 'Sponsor', value: 'sponsor', color: 'yellow' }] },
      industry: { type: 'select', label: 'Industry', inTable: true, inForm: true, options: [{ label: 'Entertainment', value: 'entertainment', color: 'purple' }, { label: 'Corporate', value: 'corporate', color: 'blue' }, { label: 'Non-Profit', value: 'non-profit', color: 'green' }, { label: 'Government', value: 'government', color: 'gray' }, { label: 'Other', value: 'other', color: 'orange' }] },
      website: { type: 'url', label: 'Website', inTable: true, inForm: true },
      phone: { type: 'phone', label: 'Phone', inTable: true, inForm: true },
      email: { type: 'email', label: 'Email', inTable: true, inForm: true },
      address: { type: 'textarea', label: 'Address', inForm: true, inDetail: true },
      contactCount: { type: 'number', label: 'Contacts', inTable: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => String(r.industry || ''), defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search companies...' },
  filters: { quick: [], advanced: ['industry', 'company_type'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'clients', label: 'Clients', query: { where: { company_type: 'client' } }, count: true }, { key: 'vendors', label: 'Vendors', query: { where: { company_type: 'vendor' } }, count: true }, { key: 'partners', label: 'Partners', query: { where: { company_type: 'partner' } } }, { key: 'sponsors', label: 'Sponsors', query: { where: { company_type: 'sponsor' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'contacts', label: 'Contacts', value: { type: 'field', field: 'contactCount' } }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Company Details', fields: ['name', 'company_type', 'industry', 'website', 'phone', 'email', 'address', 'notes'] }] } },
  views: { table: { columns: ['name', 'company_type', 'industry', 'website', 'phone', 'contactCount'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/companies/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Company', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
