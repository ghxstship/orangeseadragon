import { defineSchema } from '../schema/defineSchema';

/**
 * BUDGET LINE ITEM ENTITY SCHEMA (SSOT)
 *
 * Individual line items within a budget.
 */
export const budgetLineItemSchema = defineSchema({
  identity: {
    name: 'Budget Line Item',
    namePlural: 'Budget Line Items',
    slug: 'modules/finance/budget-line-items',
    icon: 'ListOrdered',
    description: 'Individual cost or revenue items within a budget',
  },

  data: {
    endpoint: '/api/budget-line-items',
    primaryKey: 'id',
    fields: {
      description: {
        type: 'text',
        label: 'Description',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      budget_id: {
        type: 'relation',
        relation: { entity: 'budget', display: 'name', searchable: true },
        label: 'Budget',
        required: true,
        inTable: true,
        inForm: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Labor', value: 'labor', color: 'blue' },
          { label: 'Equipment', value: 'equipment', color: 'purple' },
          { label: 'Venue', value: 'venue', color: 'green' },
          { label: 'Travel', value: 'travel', color: 'orange' },
          { label: 'Catering', value: 'catering', color: 'yellow' },
          { label: 'Materials', value: 'materials', color: 'cyan' },
          { label: 'Subcontractor', value: 'subcontractor', color: 'red' },
          { label: 'Other', value: 'other', color: 'gray' },
        ],
      },
      estimated_amount: {
        type: 'currency',
        label: 'Estimated',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      actual_amount: {
        type: 'currency',
        label: 'Actual',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      variance: {
        type: 'currency',
        label: 'Variance',
        inTable: true,
        readOnly: true,
      },
      quantity: {
        type: 'number',
        label: 'Quantity',
        inForm: true,
        inDetail: true,
      },
      unit_cost: {
        type: 'currency',
        label: 'Unit Cost',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Planned', value: 'planned', color: 'gray' },
          { label: 'Committed', value: 'committed', color: 'blue' },
          { label: 'Spent', value: 'spent', color: 'green' },
          { label: 'Over Budget', value: 'over_budget', color: 'red' },
        ],
        default: 'planned',
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
    title: (record) => record.description || 'Untitled Line Item',
    subtitle: (record) => record.category || '',
    defaultSort: { field: 'description', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['description'],
    placeholder: 'Search line items...',
  },

  filters: {
    quick: [],
    advanced: ['category', 'status', 'budget_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'estimated', label: 'Estimated', value: { type: 'field', field: 'estimated_amount' }, format: 'currency' },
          { key: 'actual', label: 'Actual', value: { type: 'field', field: 'actual_amount' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['budget_id', 'category', 'quantity', 'unit_cost', 'status'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['description', 'budget_id', 'category', 'status'] },
        { key: 'amounts', title: 'Amounts', fields: ['estimated_amount', 'actual_amount', 'quantity', 'unit_cost'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'description',
        { field: 'category', format: { type: 'badge', colorMap: { labor: '#3b82f6', equipment: '#8b5cf6', venue: '#22c55e', travel: '#f59e0b', catering: '#eab308', materials: '#06b6d4', subcontractor: '#ef4444', other: '#6b7280' } } },
        { field: 'estimated_amount', format: { type: 'currency' } },
        { field: 'actual_amount', format: { type: 'currency' } },
        { field: 'status', format: { type: 'badge', colorMap: { planned: '#6b7280', committed: '#3b82f6', spent: '#22c55e', over_budget: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [],
    bulk: [],
    global: [
      { key: 'create', label: 'New Line Item', variant: 'primary', handler: { type: 'navigate', path: () => '/finance/budgets/line-items/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
