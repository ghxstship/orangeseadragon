import { defineSchema } from '../schema/defineSchema';

export const chartOfAccountsSchema = defineSchema({
  identity: {
    name: 'chart_of_account',
    namePlural: 'Chart of Accounts',
    slug: 'modules/finance/gl-accounts',
    icon: 'FileSpreadsheet',
    description: 'General ledger accounts',
  },
  data: {
    endpoint: '/api/chart-of-accounts',
    primaryKey: 'id',
    fields: {
      account_number: {
        type: 'text',
        label: 'Account Number',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
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
      account_type_id: {
        type: 'relation',
        label: 'Account Type',
        required: true,
        inTable: true,
        inForm: true,
      },
      parent_account_id: {
        type: 'relation',
        label: 'Parent Account',
        inForm: true,
        inDetail: true,
        relation: { entity: 'chart_of_account', display: 'name' },
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      normal_balance: {
        type: 'select',
        label: 'Normal Balance',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Debit', value: 'debit' },
          { label: 'Credit', value: 'credit' },
        ],
      },
      is_header: {
        type: 'switch',
        label: 'Header Account',
        inForm: true,
        inDetail: true,
        helpText: 'Header accounts group sub-accounts and cannot have transactions',
        default: false,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      allow_direct_posting: {
        type: 'switch',
        label: 'Allow Direct Posting',
        inForm: true,
        default: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => `${r.account_number} - ${r.name}`,
    subtitle: (r: Record<string, unknown>) => {
      const accountType = r.account_type as Record<string, unknown> | undefined;
      return accountType ? String(accountType.name || '') : '';
    },
    badge: (r: Record<string, unknown>) => {
      if (!r.is_active) return { label: 'Inactive', variant: 'secondary' };
      if (r.is_header) return { label: 'Header', variant: 'default' };
      return { label: 'Active', variant: 'default' };
    },
    defaultSort: { field: 'account_number', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['account_number', 'name'],
    placeholder: 'Search accounts...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'headers', label: 'Headers', query: { where: { is_header: true } } },
    ],
    advanced: ['account_type_id', 'is_active', 'is_header'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'headers', label: 'Headers', query: { where: { is_header: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'transactions', label: 'Transactions', content: { type: 'related', entity: 'journal_entry_line', foreignKey: 'account_id' } },
        { key: 'sub_accounts', label: 'Sub-Accounts', content: { type: 'related', entity: 'chart_of_account', foreignKey: 'parent_account_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'balance', label: 'Current Balance', value: { type: 'computed', compute: (r: Record<string, unknown>) => Number(r.current_balance || 0) }, format: 'currency' },
          { key: 'transactions', label: 'Transactions', value: { type: 'relation-count', entity: 'journal_entry_line', foreignKey: 'account_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Account Details', content: { type: 'fields', fields: ['account_number', 'name', 'account_type_id', 'parent_account_id', 'description'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Account Info', fields: ['account_number', 'name', 'account_type_id', 'parent_account_id', 'description'] },
        { key: 'settings', title: 'Settings', fields: ['normal_balance', 'is_header', 'allow_direct_posting', 'is_active'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['account_number', 'name', 'account_type_id', 'normal_balance', 'is_active'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/gl-accounts/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/gl-accounts/${r.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Account', variant: 'primary', handler: { type: 'navigate', path: '/finance/gl-accounts/new' } },
      { key: 'import', label: 'Import', handler: { type: 'modal', component: 'ImportModal' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});
