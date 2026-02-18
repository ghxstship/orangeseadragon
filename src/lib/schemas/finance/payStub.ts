import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * PAY STUB ENTITY SCHEMA (SSOT)
 */
export const payStubSchema = defineSchema({
  identity: {
    name: 'Pay Stub',
    namePlural: 'Pay Stubs',
    slug: 'modules/finance/pay-stubs',
    icon: 'FileText',
    description: 'Individual employee pay stubs for each payroll run',
  },

  data: {
    endpoint: '/api/pay-stubs',
    primaryKey: 'id',
    fields: {
      payroll_run_id: {
        type: 'relation',
        relation: { entity: 'payrollRun', display: 'name', searchable: true },
        label: 'Payroll Run',
        required: true,
        inTable: true,
        inForm: true,
      },
      employee_id: {
        type: 'relation',
        relation: { entity: 'people', display: 'full_name', searchable: true },
        label: 'Employee',
        required: true,
        inTable: true,
        inForm: true,
      },
      gross_pay: {
        type: 'currency',
        label: 'Gross Pay',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      total_deductions: {
        type: 'currency',
        label: 'Total Deductions',
        inTable: true,
        inForm: true,
      },
      net_pay: {
        type: 'currency',
        label: 'Net Pay',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      regular_hours: {
        type: 'number',
        label: 'Regular Hours',
        inForm: true,
        inDetail: true,
      },
      overtime_hours: {
        type: 'number',
        label: 'Overtime Hours',
        inForm: true,
        inDetail: true,
      },
      pay_date: {
        type: 'date',
        label: 'Pay Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Processed', value: 'processed', color: 'blue' },
          { label: 'Paid', value: 'paid', color: 'green' },
          { label: 'Voided', value: 'voided', color: 'red' },
        ],
        default: 'draft',
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
    title: (record) => record.employee_id || 'Pay Stub',
    subtitle: (record) => record.pay_date || '',
    badge: (record) => {
      const colors: Record<string, string> = { draft: 'secondary', processed: 'primary', paid: 'success', voided: 'destructive' };
      return { label: record.status || 'Draft', variant: colors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'pay_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: [],
    placeholder: 'Search pay stubs...',
  },

  filters: {
    quick: [],
    advanced: ['status', 'payroll_run_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'paid', label: 'Paid', query: { where: { status: 'paid' } }, count: true },
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
          { key: 'gross', label: 'Gross Pay', value: { type: 'field', field: 'gross_pay' }, format: 'currency' },
          { key: 'deductions', label: 'Deductions', value: { type: 'field', field: 'total_deductions' }, format: 'currency' },
          { key: 'net', label: 'Net Pay', value: { type: 'field', field: 'net_pay' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Stub Details', content: { type: 'fields', fields: ['payroll_run_id', 'employee_id', 'pay_date', 'regular_hours', 'overtime_hours'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['payroll_run_id', 'employee_id', 'pay_date', 'status'] },
        { key: 'hours', title: 'Hours', fields: ['regular_hours', 'overtime_hours'] },
        { key: 'pay', title: 'Pay', fields: ['gross_pay', 'total_deductions', 'net_pay'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'employee_id', format: { type: 'relation', entityType: 'people' } },
        { field: 'payroll_run_id', format: { type: 'relation', entityType: 'payrollRun' } },
        { field: 'gross_pay', format: { type: 'currency' } },
        { field: 'total_deductions', format: { type: 'currency' } },
        { field: 'net_pay', format: { type: 'currency' } },
        { field: 'pay_date', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', processed: '#3b82f6', paid: '#22c55e', voided: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [],
    bulk: [],
    global: [],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: false,
  },
});
