import { defineSchema } from '../schema/defineSchema';

export const payrollRunSchema = defineSchema({
  identity: {
    name: 'Payroll Run',
    namePlural: 'Payroll Runs',
    slug: 'modules/workforce/payroll',
    icon: 'DollarSign',
    description: 'Payroll processing and payment runs',
  },
  data: {
    endpoint: '/api/payroll_runs',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Run Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      pay_period_start: {
        type: 'date',
        label: 'Period Start',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      pay_period_end: {
        type: 'date',
        label: 'Period End',
        required: true,
        inTable: true,
        inForm: true,
      },
      pay_date: {
        type: 'date',
        label: 'Pay Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      payroll_type: {
        type: 'select',
        label: 'Payroll Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Regular', value: 'regular' },
          { label: 'Bonus', value: 'bonus' },
          { label: 'Commission', value: 'commission' },
          { label: 'Off-Cycle', value: 'off_cycle' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Processing', value: 'processing' },
          { label: 'Pending Approval', value: 'pending_approval' },
          { label: 'Approved', value: 'approved' },
          { label: 'Paid', value: 'paid' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        default: 'draft',
      },
      employee_count: {
        type: 'number',
        label: 'Employees',
        inTable: true,
        inDetail: true,
      },
      gross_pay: {
        type: 'currency',
        label: 'Gross Pay',
        inTable: true,
        inDetail: true,
      },
      total_deductions: {
        type: 'currency',
        label: 'Deductions',
        inDetail: true,
      },
      net_pay: {
        type: 'currency',
        label: 'Net Pay',
        inTable: true,
        inDetail: true,
      },
      approved_by_id: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name' },
        label: 'Approved By',
        inDetail: true,
      },
      approved_at: {
        type: 'datetime',
        label: 'Approved At',
        inDetail: true,
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
    title: (r: Record<string, unknown>) => String(r.name || 'New Payroll Run'),
    subtitle: (r: Record<string, unknown>) => {
      const start = r.pay_period_start ? new Date(String(r.pay_period_start)).toLocaleDateString() : '';
      const end = r.pay_period_end ? new Date(String(r.pay_period_end)).toLocaleDateString() : '';
      return `${start} - ${end}`;
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        processing: 'warning',
        pending_approval: 'default',
        approved: 'success',
        paid: 'success',
        cancelled: 'destructive',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'pay_date', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search payroll runs...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending Approval', query: { where: { status: 'pending_approval' } } },
    ],
    advanced: ['payroll_type', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending_approval' } }, count: true },
        { key: 'paid', label: 'Paid', query: { where: { status: 'paid' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Pay Items', content: { type: 'related', entity: 'payroll_item', foreignKey: 'payroll_run_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'employees', label: 'Employees', value: { type: 'field', field: 'employee_count' }, format: 'number' },
          { key: 'gross', label: 'Gross Pay', value: { type: 'field', field: 'gross_pay' }, format: 'currency' },
          { key: 'net', label: 'Net Pay', value: { type: 'field', field: 'net_pay' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Payroll Details', content: { type: 'fields', fields: ['name', 'payroll_type', 'pay_period_start', 'pay_period_end', 'pay_date', 'status'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Payroll Details', fields: ['name', 'payroll_type', 'status'] },
        { key: 'period', title: 'Pay Period', fields: ['pay_period_start', 'pay_period_end', 'pay_date'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        'name',
        { field: 'pay_period_start', format: { type: 'date' } },
        { field: 'pay_date', format: { type: 'date' } },
        { field: 'employee_count', format: { type: 'number' } },
        { field: 'net_pay', format: { type: 'currency' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', processing: '#3b82f6', completed: '#22c55e', failed: '#ef4444' } } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/payroll/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/payroll-runs/{id}/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending_approval' },
      { key: 'process', label: 'Process', handler: { type: 'api', endpoint: '/api/payroll-runs/{id}/process', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'approved' },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Payroll Run', variant: 'primary', handler: { type: 'navigate', path: '/people/payroll/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'approved_by_id', label: 'Approved By' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
