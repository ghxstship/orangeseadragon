import { defineSchema } from '../schema/defineSchema';

export const invoiceSchema = defineSchema({
  identity: { name: 'invoice', namePlural: 'Invoices', slug: 'modules/finance/invoices', icon: 'Receipt', description: 'Invoices and billing' },
  data: {
    endpoint: '/api/invoices', primaryKey: 'id',
    fields: {
      invoiceNumber: { type: 'text', label: 'Invoice #', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      clientId: { type: 'select', label: 'Client', required: true, inTable: true, inForm: true, options: [] },
      projectId: { type: 'select', label: 'Project', inTable: true, inForm: true, options: [] },
      amount: { type: 'currency', label: 'Amount', required: true, inTable: true, inForm: true, sortable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Sent', value: 'sent', color: 'blue' }, { label: 'Paid', value: 'paid', color: 'green' }, { label: 'Overdue', value: 'overdue', color: 'red' }], default: 'draft' },
      issueDate: { type: 'date', label: 'Issue Date', required: true, inTable: true, inForm: true, sortable: true },
      dueDate: { type: 'date', label: 'Due Date', required: true, inTable: true, inForm: true, sortable: true },
      paidDate: { type: 'date', label: 'Paid Date', inTable: true, inForm: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.invoiceNumber || 'Untitled'), subtitle: (r: Record<string, unknown>) => `$${r.amount || 0}`, badge: (r: Record<string, unknown>) => r.status === 'paid' ? { label: 'Paid', variant: 'success' } : r.status === 'overdue' ? { label: 'Overdue', variant: 'destructive' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'issueDate', direction: 'desc' } },
  search: { enabled: true, fields: ['invoiceNumber'], placeholder: 'Search invoices...' },
  filters: { quick: [{ key: 'unpaid', label: 'Unpaid', query: { where: { status: 'sent' } } }, { key: 'overdue', label: 'Overdue', query: { where: { status: 'overdue' } } }], advanced: ['status', 'clientId', 'projectId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'unpaid', label: 'Unpaid', query: { where: { status: 'sent' } }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'amount', label: 'Amount', value: { type: 'field', field: 'amount' }, format: 'currency' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Invoice Details', fields: ['invoiceNumber', 'clientId', 'projectId', 'amount', 'status', 'issueDate', 'dueDate', 'paidDate', 'notes'] }] } },
  views: { table: { columns: ['invoiceNumber', 'clientId', 'amount', 'status', 'issueDate', 'dueDate'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/invoices/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Invoice', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
