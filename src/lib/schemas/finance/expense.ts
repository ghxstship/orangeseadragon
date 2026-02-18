import { defineSchema } from '../../schema-engine/defineSchema';

export const expenseSchema = defineSchema({
  identity: { name: 'expense', namePlural: 'Expenses', slug: 'modules/finance/expenses', icon: 'Receipt', description: 'Expense tracking and reimbursements' },
  data: {
    endpoint: '/api/expenses', primaryKey: 'id',
    fields: {
      description: { type: 'text', label: 'Description', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      amount: { type: 'currency', label: 'Amount', required: true, inTable: true, inForm: true, sortable: true },
      category: { type: 'select', label: 'Category', required: true, inTable: true, inForm: true, options: [{ label: 'Travel', value: 'travel', color: 'blue' }, { label: 'Equipment', value: 'equipment', color: 'purple' }, { label: 'Supplies', value: 'supplies', color: 'green' }, { label: 'Services', value: 'services', color: 'orange' }, { label: 'Other', value: 'other', color: 'gray' }] },
      projectId: { type: 'select', label: 'Project', inTable: true, inForm: true, options: [] },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      submittedBy: { type: 'select', label: 'Submitted By', required: true, inTable: true, inForm: true, options: [] },
      date: { type: 'date', label: 'Date', required: true, inTable: true, inForm: true, sortable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Pending', value: 'pending', color: 'yellow' }, { label: 'Approved', value: 'approved', color: 'green' }, { label: 'Rejected', value: 'rejected', color: 'red' }, { label: 'Reimbursed', value: 'reimbursed', color: 'blue' }], default: 'pending' },
      receipt: { type: 'file', label: 'Receipt', inForm: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.description || 'Untitled'), subtitle: (r: Record<string, unknown>) => `$${r.amount || 0}`, badge: (r: Record<string, unknown>) => r.status === 'approved' ? { label: 'Approved', variant: 'success' } : r.status === 'rejected' ? { label: 'Rejected', variant: 'destructive' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'date', direction: 'desc' } },
  search: { enabled: true, fields: ['description'], placeholder: 'Search expenses...' },
  filters: { quick: [{ key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } }], advanced: ['status', 'category', 'projectId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true }, { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } } }, { key: 'rejected', label: 'Rejected', query: { where: { status: 'rejected' } } }, { key: 'reimbursed', label: 'Reimbursed', query: { where: { status: 'reimbursed' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'amount', label: 'Amount', value: { type: 'field', field: 'amount' }, format: 'currency' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Expense Details', fields: ['description', 'amount', 'category', 'projectId', 'eventId', 'submittedBy', 'date', 'status', 'receipt', 'notes'] }] } },
  views: { table: { columns: [
    'description',
    { field: 'amount', format: { type: 'currency' } },
    { field: 'category', format: { type: 'badge', colorMap: { travel: '#3b82f6', equipment: '#8b5cf6', supplies: '#22c55e', services: '#f59e0b', other: '#6b7280' } } },
    { field: 'submittedBy', format: { type: 'relation', entityType: 'person' } },
    { field: 'date', format: { type: 'date' } },
    { field: 'status', format: { type: 'badge', colorMap: { pending: '#eab308', approved: '#22c55e', rejected: '#ef4444', reimbursed: '#3b82f6' } } },
  ] } },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/expenses/${r.id}` } },
      { key: 'submit', label: 'Submit', variant: 'primary', handler: { type: 'api', endpoint: '/api/expenses/{id}/submit', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/expenses/{id}/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'submitted' },
    ],
    bulk: [],
    global: [{ key: 'create', label: 'New Expense', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  relationships: {
    belongsTo: [
      { entity: 'project', foreignKey: 'projectId', label: 'Project' },
      { entity: 'event', foreignKey: 'eventId', label: 'Event' },
    ],
  },


  stateMachine: {
    field: 'status',
    initial: 'pending',
    terminal: ['reimbursed'],
    transitions: [
      { from: 'pending', to: 'submitted', label: 'Submit' },
      { from: 'submitted', to: 'approved', label: 'Approve', roles: ['admin', 'finance_manager'] },
      { from: 'submitted', to: 'rejected', label: 'Reject', roles: ['admin', 'finance_manager'] },
      { from: 'approved', to: 'reimbursed', label: 'Reimburse', roles: ['admin', 'finance_manager'] },
      { from: 'rejected', to: 'pending', label: 'Revise' },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
