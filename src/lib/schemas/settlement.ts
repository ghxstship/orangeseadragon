import { defineSchema } from '../schema/defineSchema';

export const settlementSchema = defineSchema({
  identity: { name: 'settlement', namePlural: 'Settlements', slug: 'modules/finance/settlements', icon: 'Calculator', description: 'Event settlements and reconciliation' },
  data: {
    endpoint: '/api/settlements', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Settlement Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', required: true, inTable: true, inForm: true, options: [] },
      totalRevenue: { type: 'currency', label: 'Total Revenue', inTable: true, inForm: true },
      totalExpenses: { type: 'currency', label: 'Total Expenses', inTable: true, inForm: true },
      netAmount: { type: 'currency', label: 'Net Amount', inTable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Pending', value: 'pending', color: 'yellow' }, { label: 'Approved', value: 'approved', color: 'green' }, { label: 'Finalized', value: 'finalized', color: 'blue' }], default: 'draft' },
      date: { type: 'date', label: 'Settlement Date', inTable: true, inForm: true, sortable: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => `Net: $${r.netAmount || 0}`, badge: (r: Record<string, unknown>) => r.status === 'finalized' ? { label: 'Finalized', variant: 'success' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'date', direction: 'desc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search settlements...' },
  filters: { quick: [{ key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } }], advanced: ['status', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true }, { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true }, { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } } }, { key: 'finalized', label: 'Finalized', query: { where: { status: 'finalized' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'revenue', label: 'Revenue', value: { type: 'field', field: 'totalRevenue' }, format: 'currency' }, { key: 'expenses', label: 'Expenses', value: { type: 'field', field: 'totalExpenses' }, format: 'currency' }, { key: 'net', label: 'Net', value: { type: 'field', field: 'netAmount' }, format: 'currency' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Settlement Details', fields: ['name', 'eventId', 'totalRevenue', 'totalExpenses', 'status', 'date', 'notes'] }] } },
  views: { table: { columns: ['name', 'eventId', 'totalRevenue', 'totalExpenses', 'netAmount', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/settlements/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Settlement', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
