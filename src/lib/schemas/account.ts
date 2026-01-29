import { defineSchema } from '../schema/defineSchema';

export const accountSchema = defineSchema({
  identity: { name: 'account', namePlural: 'Accounts', slug: 'modules/finance/accounts', icon: 'Landmark', description: 'Financial accounts and ledgers' },
  data: {
    endpoint: '/api/accounts', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Account Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      code: { type: 'text', label: 'Account Code', required: true, inTable: true, inForm: true },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'Asset', value: 'asset', color: 'green' }, { label: 'Liability', value: 'liability', color: 'red' }, { label: 'Revenue', value: 'revenue', color: 'blue' }, { label: 'Expense', value: 'expense', color: 'orange' }] },
      balance: { type: 'currency', label: 'Balance', inTable: true },
      is_active: { type: 'checkbox', label: 'Active', inTable: true, inForm: true, default: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => String(r.code || ''), badge: (r: Record<string, unknown>) => r.is_active ? { label: 'Active', variant: 'success' } : { label: 'Inactive', variant: 'secondary' }, defaultSort: { field: 'code', direction: 'asc' } },
  search: { enabled: true, fields: ['name', 'code'], placeholder: 'Search accounts...' },
  filters: { quick: [{ key: 'active', label: 'Active', query: { where: { is_active: true } } }], advanced: ['type', 'is_active'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'balance', label: 'Balance', value: { type: 'field', field: 'balance' }, format: 'currency' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Account Details', fields: ['name', 'code', 'type', 'is_active', 'description'] }] } },
  views: { table: { columns: ['name', 'code', 'type', 'balance', 'is_active'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/accounts/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Account', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
