import { defineSchema } from '../schema/defineSchema';

export const bankAccountSchema = defineSchema({
  identity: {
    name: 'bank_account',
    namePlural: 'Bank Accounts',
    slug: 'modules/finance/banking',
    icon: '🏦',
    description: 'Bank accounts and cash management',
  },
  data: {
    endpoint: '/api/bank-accounts',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Account Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      bank_name: {
        type: 'text',
        label: 'Bank Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      account_number_last4: {
        type: 'text',
        label: 'Account (Last 4)',
        inTable: true,
        inDetail: true,
      },
      routing_number: {
        type: 'text',
        label: 'Routing Number',
        inForm: true,
        inDetail: true,
      },
      account_type: {
        type: 'select',
        label: 'Account Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Checking', value: 'checking' },
          { label: 'Savings', value: 'savings' },
          { label: 'Money Market', value: 'money_market' },
          { label: 'Credit Card', value: 'credit_card' },
          { label: 'Line of Credit', value: 'line_of_credit' },
        ],
      },
      currency_id: {
        type: 'relation',
        label: 'Currency',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'currency', display: 'code' },
      },
      gl_account_id: {
        type: 'relation',
        label: 'GL Account',
        required: true,
        inForm: true,
        inDetail: true,
        relation: { entity: 'chart_of_account', display: 'name' },
      },
      is_primary: {
        type: 'switch',
        label: 'Primary Account',
        inTable: true,
        inForm: true,
        default: false,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      last_reconciled_at: {
        type: 'datetime',
        label: 'Last Reconciled',
        inTable: true,
        inDetail: true,
      },
      last_reconciled_balance_cents: {
        type: 'currency',
        label: 'Last Reconciled Balance',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled'),
    subtitle: (r: Record<string, unknown>) => `${r.bank_name} ****${r.account_number_last4}`,
    badge: (r: Record<string, unknown>) => {
      if (!r.is_active) return { label: 'Inactive', variant: 'secondary' };
      if (r.is_primary) return { label: 'Primary', variant: 'default' };
      return { label: 'Active', variant: 'default' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'bank_name'],
    placeholder: 'Search bank accounts...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'checking', label: 'Checking', query: { where: { account_type: 'checking' } } },
    ],
    advanced: ['account_type', 'currency_id', 'is_active'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'transactions', label: 'Transactions', content: { type: 'related', entity: 'bank_transaction', foreignKey: 'bank_account_id' } },
        { key: 'reconciliations', label: 'Reconciliations', content: { type: 'related', entity: 'bank_reconciliation', foreignKey: 'bank_account_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'balance', label: 'Current Balance', value: { type: 'computed', compute: (r: Record<string, unknown>) => Number(r.current_balance_cents || 0) / 100 }, format: 'currency' },
          { key: 'unreconciled', label: 'Unreconciled', value: { type: 'relation-count', entity: 'bank_transaction', foreignKey: 'bank_account_id', filter: { is_reconciled: false } }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Account Details', content: { type: 'fields', fields: ['bank_name', 'account_type', 'currency_id', 'gl_account_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Account Info', fields: ['name', 'bank_name', 'account_type', 'currency_id'] },
        { key: 'numbers', title: 'Account Numbers', fields: ['account_number_last4', 'routing_number'] },
        { key: 'gl', title: 'GL Mapping', fields: ['gl_account_id'] },
        { key: 'settings', title: 'Settings', fields: ['is_primary', 'is_active'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'bank_name', 'account_type', 'currency_id', 'is_primary', 'last_reconciled_at'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/finance/banking/${r.id}` } },
      { key: 'reconcile', label: 'Reconcile', variant: 'primary', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/finance/banking/${r.id}/reconciliation` } },
      { key: 'import', label: 'Import Transactions', handler: { type: 'modal', component: 'ImportTransactionsModal' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Bank Account', variant: 'primary', handler: { type: 'navigate', path: '/modules/finance/banking/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});
