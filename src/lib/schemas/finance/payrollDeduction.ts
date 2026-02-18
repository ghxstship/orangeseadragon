import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * PAYROLL DEDUCTION ENTITY SCHEMA (SSOT)
 */
export const payrollDeductionSchema = defineSchema({
  identity: {
    name: 'Payroll Deduction',
    namePlural: 'Payroll Deductions',
    slug: 'modules/finance/payroll-deductions',
    icon: 'MinusCircle',
    description: 'Payroll deductions such as taxes, benefits, and garnishments',
  },

  data: {
    endpoint: '/api/payroll-deductions',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Deduction Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      deduction_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Tax', value: 'tax', color: 'red' },
          { label: 'Benefits', value: 'benefits', color: 'blue' },
          { label: 'Retirement', value: 'retirement', color: 'green' },
          { label: 'Insurance', value: 'insurance', color: 'purple' },
          { label: 'Garnishment', value: 'garnishment', color: 'orange' },
          { label: 'Other', value: 'other', color: 'gray' },
        ],
      },
      calculation_method: {
        type: 'select',
        label: 'Calculation',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Percentage', value: 'percentage' },
          { label: 'Fixed Amount', value: 'fixed' },
        ],
      },
      rate: {
        type: 'number',
        label: 'Rate (%)',
        inTable: true,
        inForm: true,
      },
      fixed_amount: {
        type: 'currency',
        label: 'Fixed Amount',
        inTable: true,
        inForm: true,
      },
      is_pre_tax: {
        type: 'switch',
        label: 'Pre-Tax',
        inTable: true,
        inForm: true,
      },
      is_employer_match: {
        type: 'switch',
        label: 'Employer Match',
        inForm: true,
        inDetail: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
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
    title: (record) => record.name || 'Untitled Deduction',
    subtitle: (record) => record.deduction_type || '',
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search deductions...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['deduction_type', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
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
          { key: 'rate', label: 'Rate', value: { type: 'field', field: 'rate' }, format: 'number' },
          { key: 'fixed', label: 'Fixed Amount', value: { type: 'field', field: 'fixed_amount' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Deduction Details', content: { type: 'fields', fields: ['deduction_type', 'calculation_method', 'is_pre_tax', 'is_employer_match'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['name', 'deduction_type', 'is_active'] },
        { key: 'calculation', title: 'Calculation', fields: ['calculation_method', 'rate', 'fixed_amount', 'is_pre_tax', 'is_employer_match'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'deduction_type', format: { type: 'badge', colorMap: { tax: '#ef4444', benefits: '#3b82f6', retirement: '#22c55e', insurance: '#8b5cf6', garnishment: '#f59e0b', other: '#6b7280' } } },
        'calculation_method',
        'rate',
        { field: 'fixed_amount', format: { type: 'currency' } },
        'is_active',
      ],
    },
  },

  actions: {
    row: [],
    bulk: [],
    global: [
      { key: 'create', label: 'New Deduction', variant: 'primary', handler: { type: 'navigate', path: () => '/finance/payroll/deductions/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
