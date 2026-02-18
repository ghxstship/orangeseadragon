import { defineSchema } from '../../schema-engine/defineSchema';

export const fiscalYearSchema = defineSchema({
  identity: {
    name: 'Fiscal Year',
    namePlural: 'Fiscal Years',
    slug: 'finance/fiscal-years',
    icon: 'Calendar',
    description: 'Fiscal year configuration and financial period management',
  },

  data: {
    endpoint: '/api/fiscal-years',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        placeholder: 'FY 2026',
        searchable: true,
      },
      start_date: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        required: true,
        inTable: true,
        inForm: true,
      },
      is_current: {
        type: 'switch',
        label: 'Current Year',
        inTable: true,
        inForm: true,
        default: false,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Open', value: 'open', color: 'green' },
          { label: 'Closed', value: 'closed', color: 'yellow' },
          { label: 'Locked', value: 'locked', color: 'red' },
        ],
        default: 'open',
      },
    },
  },

  relationships: {
    hasMany: [
      { entity: 'financial_periods', foreignKey: 'fiscal_year_id', label: 'Periods' },
    ],
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Fiscal Year'),
    subtitle: (r: Record<string, unknown>) => `${r.start_date} — ${r.end_date}`,
    badge: (r: Record<string, unknown>) => {
      if (r.is_current) return { label: 'Current', variant: 'default' };
      if (r.status === 'locked') return { label: 'Locked', variant: 'destructive' };
      if (r.status === 'closed') return { label: 'Closed', variant: 'warning' };
      return { label: 'Open', variant: 'success' };
    },
    defaultSort: { field: 'start_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search fiscal years...',
  },

  filters: {
    quick: [
      { key: 'current', label: 'Current', query: { where: { is_current: true } } },
    ],
    advanced: ['status'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'open', label: 'Open', query: { where: { status: 'open' } }, count: true },
        { key: 'closed', label: 'Closed', query: { where: { status: 'closed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'periods', label: 'Periods', content: { type: 'related', entity: 'financial_periods', foreignKey: 'fiscal_year_id' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Fiscal Year Details', content: { type: 'fields', fields: ['name', 'start_date', 'end_date', 'is_current', 'status'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Fiscal Year', fields: ['name', 'start_date', 'end_date', 'is_current', 'status'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'start_date', format: { type: 'date' } },
        { field: 'end_date', format: { type: 'date' } },
        { field: 'is_current', format: { type: 'boolean' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/fiscal-years/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Fiscal Year', variant: 'primary', handler: { type: 'navigate', path: () => '/finance/fiscal-years/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
