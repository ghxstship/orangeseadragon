import { defineSchema } from '../schema/defineSchema';

export const paymentSchema = defineSchema({
  identity: { name: 'payment', namePlural: 'Payments', slug: 'modules/finance/payments', icon: 'CreditCard', description: 'Payment records and transactions' },
  data: {
    endpoint: '/api/payments', primaryKey: 'id',
    fields: {
      reference: { type: 'text', label: 'Reference', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      invoiceId: { type: 'select', label: 'Invoice', inTable: true, inForm: true, options: [] },
      amount: { type: 'currency', label: 'Amount', required: true, inTable: true, inForm: true, sortable: true },
      reference_number: { type: 'text', label: 'Reference Number', inTable: true, inForm: true },
      payment_method: { type: 'select', label: 'Method', inTable: true, inForm: true, options: [{ label: 'Bank Transfer', value: 'bank_transfer', color: 'blue' }, { label: 'Credit Card', value: 'credit_card', color: 'purple' }, { label: 'Check', value: 'check', color: 'gray' }, { label: 'Cash', value: 'cash', color: 'green' }] },
      date: { type: 'date', label: 'Date', required: true, inTable: true, inForm: true, sortable: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.reference || 'Untitled'), subtitle: (r: Record<string, unknown>) => `$${r.amount || 0}`, badge: (r: Record<string, unknown>) => ({ label: String(r.payment_method || 'Unknown'), variant: 'secondary' }), defaultSort: { field: 'date', direction: 'desc' } },
  search: { enabled: true, fields: ['reference', 'reference_number'], placeholder: 'Search payments...' },
  filters: { quick: [], advanced: ['payment_method'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'bank-transfer', label: 'Bank Transfer', query: { where: { payment_method: 'bank_transfer' } } }, { key: 'credit-card', label: 'Credit Card', query: { where: { payment_method: 'credit_card' } } }, { key: 'check', label: 'Check', query: { where: { payment_method: 'check' } } }, { key: 'cash', label: 'Cash', query: { where: { payment_method: 'cash' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'amount', label: 'Amount', value: { type: 'field', field: 'amount' }, format: 'currency' }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Payment Details', fields: ['reference', 'invoiceId', 'amount', 'payment_method', 'date', 'reference_number', 'notes'] }] } },
  views: { table: { columns: ['reference', 'invoiceId', 'amount', 'payment_method', 'date'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/payments/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'Record Payment', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
