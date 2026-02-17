import { defineSchema } from '../schema/defineSchema';

/**
 * PAYROLL RATE ENTITY SCHEMA (SSOT)
 */
export const payrollRateSchema = defineSchema({
  identity: {
    name: 'Pay Rate',
    namePlural: 'Pay Rates',
    slug: 'modules/finance/payroll-rates',
    icon: 'TrendingUp',
    description: 'Employee pay rates and compensation structures',
  },

  data: {
    endpoint: '/api/payroll-rates',
    primaryKey: 'id',
    fields: {
      employee_id: {
        type: 'relation',
        relation: { entity: 'people', display: 'full_name', searchable: true },
        label: 'Employee',
        required: true,
        inTable: true,
        inForm: true,
      },
      rate_type: {
        type: 'select',
        label: 'Rate Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Hourly', value: 'hourly', color: 'blue' },
          { label: 'Daily', value: 'daily', color: 'green' },
          { label: 'Weekly', value: 'weekly', color: 'purple' },
          { label: 'Salary', value: 'salary', color: 'orange' },
          { label: 'Per Diem', value: 'per_diem', color: 'cyan' },
        ],
      },
      base_rate: {
        type: 'currency',
        label: 'Base Rate',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      overtime_rate: {
        type: 'currency',
        label: 'Overtime Rate',
        inTable: true,
        inForm: true,
      },
      double_time_rate: {
        type: 'currency',
        label: 'Double Time Rate',
        inForm: true,
        inDetail: true,
      },
      effective_date: {
        type: 'date',
        label: 'Effective Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        inForm: true,
        inDetail: true,
      },
      department: {
        type: 'text',
        label: 'Department',
        inTable: true,
        inForm: true,
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
    title: (record) => record.employee_id || 'Untitled Rate',
    subtitle: (record) => record.rate_type || '',
    defaultSort: { field: 'effective_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['department'],
    placeholder: 'Search pay rates...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['rate_type', 'is_active'],
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
          { key: 'base', label: 'Base Rate', value: { type: 'field', field: 'base_rate' }, format: 'currency' },
          { key: 'overtime', label: 'Overtime', value: { type: 'field', field: 'overtime_rate' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Rate Details', content: { type: 'fields', fields: ['employee_id', 'rate_type', 'department', 'effective_date', 'end_date'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['employee_id', 'rate_type', 'department', 'is_active'] },
        { key: 'rates', title: 'Rates', fields: ['base_rate', 'overtime_rate', 'double_time_rate'] },
        { key: 'dates', title: 'Effective Period', fields: ['effective_date', 'end_date'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'employee_id', format: { type: 'relation', entityType: 'people' } },
        { field: 'rate_type', format: { type: 'badge', colorMap: { hourly: '#3b82f6', daily: '#22c55e', weekly: '#8b5cf6', salary: '#f59e0b', per_diem: '#06b6d4' } } },
        { field: 'base_rate', format: { type: 'currency' } },
        { field: 'overtime_rate', format: { type: 'currency' } },
        { field: 'effective_date', format: { type: 'date' } },
        'is_active',
      ],
    },
  },

  actions: {
    row: [],
    bulk: [],
    global: [
      { key: 'create', label: 'New Rate', variant: 'primary', handler: { type: 'navigate', path: () => '/finance/payroll/rates/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
