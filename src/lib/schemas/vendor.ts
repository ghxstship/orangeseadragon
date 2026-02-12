import { defineSchema } from '../schema/defineSchema';

export const vendorSchema = defineSchema({
  identity: { name: 'vendor', namePlural: 'Vendor Contacts', slug: 'modules/assets/vendors', icon: 'Building', description: 'Vendor contact relationships' },
  data: {
    endpoint: '/api/vendor_contacts', primaryKey: 'id',
    fields: {
      company_id: { type: 'select', label: 'Company', required: true, inTable: true, inForm: true, options: [] },
      contact_id: { type: 'select', label: 'Contact', required: true, inTable: true, inForm: true, options: [] },
      role: { type: 'text', label: 'Role', inTable: true, inForm: true },
      is_primary: { type: 'checkbox', label: 'Primary Contact', inTable: true, inForm: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.role || 'Vendor Contact'), subtitle: () => '', badge: (r: Record<string, unknown>) => r.is_primary ? { label: 'Primary', variant: 'success' } : undefined, defaultSort: { field: 'created_at', direction: 'desc' } },
  search: { enabled: true, fields: ['role'], placeholder: 'Search vendor contacts...' },
  filters: { quick: [{ key: 'primary', label: 'Primary', query: { where: { is_primary: true } } }], advanced: ['is_primary'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'primary', label: 'Primary', query: { where: { is_primary: true } }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Vendor Contact Details', fields: ['company_id', 'contact_id', 'role', 'is_primary'] }] } },
  views: { table: { columns: [
    { field: 'company_id', format: { type: 'relation', entityType: 'company' } },
    { field: 'contact_id', format: { type: 'relation', entityType: 'person' } },
    'role',
    { field: 'is_primary', format: { type: 'boolean', trueLabel: 'Primary', falseLabel: 'Secondary' } },
  ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/vendors/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Vendor Contact', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
