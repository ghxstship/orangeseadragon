import { defineSchema } from '../../schema-engine/defineSchema';

export const bankConnectionSchema = defineSchema({
  identity: {
    name: 'Bank Connection',
    namePlural: 'Bank Connections',
    slug: 'modules/finance/bank-connections',
    icon: 'Building2',
    description: 'Connected bank accounts for transaction import',
  },
  data: {
    endpoint: '/api/bank-connections',
    primaryKey: 'id',
    fields: {
      institutionName: {
        type: 'text',
        label: 'Institution',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      accountName: {
        type: 'text',
        label: 'Account Name',
        required: true,
        inTable: true,
        inDetail: true,
        searchable: true,
      },
      accountMask: {
        type: 'text',
        label: 'Account #',
        inTable: true,
        inDetail: true,
      },
      accountType: {
        type: 'select',
        label: 'Account Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Checking', value: 'checking', color: 'blue' },
          { label: 'Savings', value: 'savings', color: 'green' },
          { label: 'Credit Card', value: 'credit', color: 'purple' },
          { label: 'Loan', value: 'loan', color: 'orange' },
          { label: 'Investment', value: 'investment', color: 'teal' },
        ],
      },
      provider: {
        type: 'select',
        label: 'Provider',
        inDetail: true,
        options: [
          { label: 'Plaid', value: 'plaid' },
          { label: 'Yodlee', value: 'yodlee' },
          { label: 'Manual', value: 'manual' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        options: [
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Error', value: 'error', color: 'red' },
          { label: 'Disconnected', value: 'disconnected', color: 'gray' },
          { label: 'Pending', value: 'pending', color: 'yellow' },
        ],
        default: 'pending',
      },
      lastSyncAt: {
        type: 'datetime',
        label: 'Last Synced',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      lastSyncError: {
        type: 'text',
        label: 'Last Error',
        inDetail: true,
      },
      bankAccountId: {
        type: 'relation',
        relation: { entity: 'bankAccount', display: 'name' },
        label: 'Linked Account',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.accountName || 'Bank Account'),
    subtitle: (r: Record<string, unknown>) => `${r.institutionName || ''} ****${r.accountMask || ''}`,
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        active: 'success',
        error: 'destructive',
        disconnected: 'secondary',
        pending: 'warning',
      };
      return { label: String(r.status || 'pending'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'institutionName', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['accountName', 'institutionName'],
    placeholder: 'Search bank accounts...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'error', label: 'Needs Attention', query: { where: { status: 'error' } } },
    ],
    advanced: ['status', 'accountType'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'error', label: 'Errors', query: { where: { status: 'error' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'transactions', label: 'Transactions', content: { type: 'related', entity: 'imported_transaction', foreignKey: 'bank_connection_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'lastSync', label: 'Last Sync', value: { type: 'field', field: 'lastSyncAt' }, format: 'relative' },
        ],
        blocks: [
          { key: 'account', title: 'Account Details', content: { type: 'fields', fields: ['institutionName', 'accountName', 'accountMask', 'accountType', 'status'] } },
          { key: 'sync', title: 'Sync Status', content: { type: 'fields', fields: ['lastSyncAt', 'lastSyncError', 'provider'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'account', title: 'Account Details', fields: ['institutionName', 'accountName', 'accountType', 'bankAccountId'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['institutionName', 'accountName', 'accountMask', 'accountType', 'status', 'lastSyncAt'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/banking/${r.id}` } },
      { key: 'sync', label: 'Sync Now', variant: 'default', handler: { type: 'api', endpoint: '/api/bank-connections/{id}/sync', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'active' },
      { key: 'reconnect', label: 'Reconnect', variant: 'warning', handler: { type: 'modal', component: 'BankReconnectModal' }, condition: (r: Record<string, unknown>) => r.status === 'error' || r.status === 'disconnected' },
      { key: 'disconnect', label: 'Disconnect', variant: 'destructive', handler: { type: 'api', endpoint: '/api/bank-connections/{id}', method: 'DELETE' }, confirm: { title: 'Disconnect Bank Account', message: 'Are you sure you want to disconnect this bank account? Transaction history will be preserved.' } },
    ],
    bulk: [],
    global: [
      { key: 'connect', label: 'Connect Bank', variant: 'primary', handler: { type: 'modal', component: 'BankConnectModal' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'bankAccount', foreignKey: 'bankAccountId', label: 'Bank Account' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
