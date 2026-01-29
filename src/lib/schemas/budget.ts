import { defineSchema } from '../schema/defineSchema';

export const budgetSchema = defineSchema({
  identity: { name: 'budget', namePlural: 'Budgets', slug: 'modules/finance/budgets', icon: 'PiggyBank', description: 'Project and event budgets' },
  data: {
    endpoint: '/api/budgets', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Budget Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      projectId: { type: 'select', label: 'Project', inTable: true, inForm: true, options: [] },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      totalAmount: { type: 'currency', label: 'Total Budget', required: true, inTable: true, inForm: true, sortable: true },
      spentAmount: { type: 'currency', label: 'Spent', inTable: true },
      remainingAmount: { type: 'currency', label: 'Remaining', inTable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Active', value: 'active', color: 'green' }, { label: 'Closed', value: 'closed', color: 'blue' }], default: 'draft' },
      startDate: { type: 'date', label: 'Start Date', inTable: true, inForm: true },
      endDate: { type: 'date', label: 'End Date', inTable: true, inForm: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled Budget'), subtitle: (r: Record<string, unknown>) => `$${r.totalAmount || 0}`, badge: (r: Record<string, unknown>) => r.status === 'active' ? { label: 'Active', variant: 'success' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search budgets...' },
  filters: { quick: [{ key: 'active', label: 'Active', query: { where: { status: 'active' } } }], advanced: ['status', 'projectId', 'eventId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'total', label: 'Total', value: { type: 'field', field: 'totalAmount' }, format: 'currency' }, { key: 'spent', label: 'Spent', value: { type: 'field', field: 'spentAmount' }, format: 'currency' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Budget Details', fields: ['name', 'projectId', 'eventId', 'totalAmount', 'status', 'startDate', 'endDate', 'notes'] }] } },
  views: { table: { columns: ['name', 'projectId', 'totalAmount', 'spentAmount', 'remainingAmount', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/budgets/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Budget', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
