import { defineSchema } from '../../schema-engine/defineSchema';

export const journalEntrySchema = defineSchema({
  identity: {
    name: 'Journal Entry',
    namePlural: 'Journal Entries',
    slug: 'modules/finance/journal',
    icon: 'BookOpen',
    description: 'General ledger journal entries',
  },
  data: {
    endpoint: '/api/journal-entries',
    primaryKey: 'id',
    fields: {
      entry_number: {
        type: 'text',
        label: 'Entry #',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      entry_date: {
        type: 'date',
        label: 'Entry Date',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
      },
      fiscal_period_id: {
        type: 'relation',
        label: 'Fiscal Period',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'fiscal_period', display: 'name' },
      },
      description: {
        type: 'text',
        label: 'Description',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      reference_type: {
        type: 'select',
        label: 'Reference Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Invoice', value: 'invoice' },
          { label: 'Payment', value: 'payment' },
          { label: 'Expense', value: 'expense' },
          { label: 'Payroll', value: 'payroll' },
          { label: 'Adjustment', value: 'adjustment' },
          { label: 'Opening Balance', value: 'opening' },
          { label: 'Closing', value: 'closing' },
          { label: 'Manual', value: 'manual' },
        ],
      },
      reference_id: {
        type: 'text',
        label: 'Reference ID',
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Posted', value: 'posted' },
          { label: 'Reversed', value: 'reversed' },
        ],
        default: 'draft',
      },
      is_adjusting: {
        type: 'switch',
        label: 'Adjusting Entry',
        inForm: true,
        inDetail: true,
        default: false,
      },
      is_closing: {
        type: 'switch',
        label: 'Closing Entry',
        inForm: true,
        inDetail: true,
        default: false,
      },
      reversal_of_id: {
        type: 'relation',
        label: 'Reversal Of',
        inDetail: true,
      },
      reversed_by_id: {
        type: 'relation',
        label: 'Reversed By',
        inDetail: true,
      },
      posted_at: {
        type: 'datetime',
        label: 'Posted At',
        inDetail: true,
      },
      posted_by_user_id: {
        type: 'relation',
        label: 'Posted By',
        inDetail: true,
        relation: { entity: 'profile', display: 'full_name' },
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.entry_number || 'New Entry'),
    subtitle: (r: Record<string, unknown>) => String(r.description || ''),
    badge: (r: Record<string, unknown>) => {
      const status = String(r.status || 'draft');
      const variants: Record<string, string> = {
        draft: 'warning',
        posted: 'default',
        reversed: 'secondary',
      };
      return { label: status.charAt(0).toUpperCase() + status.slice(1), variant: variants[status] || 'secondary' };
    },
    defaultSort: { field: 'entry_date', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['entry_number', 'description'],
    placeholder: 'Search journal entries...',
  },
  filters: {
    quick: [
      { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } } },
      { key: 'posted', label: 'Posted', query: { where: { status: 'posted' } } },
    ],
    advanced: ['fiscal_period_id', 'reference_type', 'status', 'is_adjusting'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
        { key: 'posted', label: 'Posted', query: { where: { status: 'posted' } }, count: true },
        { key: 'adjusting', label: 'Adjusting', query: { where: { is_adjusting: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'lines', label: 'Lines', content: { type: 'related', entity: 'journal_entry_line', foreignKey: 'journal_entry_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'total_debit', label: 'Total Debit', value: { type: 'computed', compute: (r: Record<string, unknown>) => Number(r.total_debit_cents || 0) / 100 }, format: 'currency' },
          { key: 'total_credit', label: 'Total Credit', value: { type: 'computed', compute: (r: Record<string, unknown>) => Number(r.total_credit_cents || 0) / 100 }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Entry Details', content: { type: 'fields', fields: ['entry_number', 'entry_date', 'fiscal_period_id', 'description', 'reference_type'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Entry Info', fields: ['entry_date', 'fiscal_period_id', 'description', 'reference_type'] },
        { key: 'flags', title: 'Entry Type', fields: ['is_adjusting', 'is_closing'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['entry_number', 'entry_date', 'description', 'reference_type', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/journal/${r.id}` } },
      { key: 'post', label: 'Post', variant: 'primary', handler: { type: 'api', endpoint: '/api/journal-entries/{id}/post', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'draft' },
      { key: 'reverse', label: 'Reverse', variant: 'warning', handler: { type: 'modal', component: 'ReverseEntryModal' }, condition: (r: Record<string, unknown>) => r.status === 'posted' && !r.reversed_by_id },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Entry', variant: 'primary', handler: { type: 'navigate', path: '/finance/journal/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});
