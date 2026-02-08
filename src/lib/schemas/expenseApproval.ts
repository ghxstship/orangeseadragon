import { defineSchema } from '../schema/defineSchema';

export const expenseApprovalPolicySchema = defineSchema({
  identity: {
    name: 'Approval Policy',
    namePlural: 'Approval Policies',
    slug: 'settings/expense-approval-policies',
    icon: 'Shield',
    description: 'Expense approval workflow policies',
  },
  data: {
    endpoint: '/api/expense-approval-policies',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Policy Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      minAmount: {
        type: 'currency',
        label: 'Minimum Amount',
        inTable: true,
        inForm: true,
        inDetail: true,
        default: 0,
        helpText: 'Policy applies to expenses at or above this amount',
      },
      maxAmount: {
        type: 'currency',
        label: 'Maximum Amount',
        inForm: true,
        inDetail: true,
        helpText: 'Leave empty for no upper limit',
      },
      autoApproveBelow: {
        type: 'currency',
        label: 'Auto-Approve Below',
        inTable: true,
        inForm: true,
        inDetail: true,
        helpText: 'Expenses below this amount are auto-approved',
      },
      approvalLevels: {
        type: 'number',
        label: 'Approval Levels',
        required: true,
        inTable: true,
        inForm: true,
        default: 1,
        min: 1,
        max: 5,
      },
      requiresReceipt: {
        type: 'switch',
        label: 'Requires Receipt',
        inForm: true,
        inDetail: true,
        default: true,
      },
      isActive: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Policy'),
    subtitle: (r: Record<string, unknown>) => {
      const min = r.minAmount ? `$${r.minAmount}` : '$0';
      const max = r.maxAmount ? `$${r.maxAmount}` : '∞';
      return `${min} - ${max}`;
    },
    badge: (r: Record<string, unknown>) =>
      r.isActive
        ? { label: 'Active', variant: 'success' }
        : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'minAmount', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search policies...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { isActive: true } } },
    ],
    advanced: ['isActive'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { isActive: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'levels', label: 'Approval Levels', content: { type: 'related', entity: 'expense_approval_level', foreignKey: 'policy_id' } },
      ],
      overview: {
        stats: [
          { key: 'levels', label: 'Levels', value: { type: 'field', field: 'approvalLevels' }, format: 'number' },
        ],
        blocks: [
          { key: 'thresholds', title: 'Amount Thresholds', content: { type: 'fields', fields: ['minAmount', 'maxAmount', 'autoApproveBelow'] } },
          { key: 'settings', title: 'Settings', content: { type: 'fields', fields: ['approvalLevels', 'requiresReceipt', 'isActive'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Policy Details', fields: ['name', 'description'] },
        { key: 'thresholds', title: 'Amount Thresholds', fields: ['minAmount', 'maxAmount', 'autoApproveBelow'] },
        { key: 'workflow', title: 'Workflow Settings', fields: ['approvalLevels', 'requiresReceipt', 'isActive'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'minAmount', 'autoApproveBelow', 'approvalLevels', 'isActive'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/settings/expense-approval-policies/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Policy', variant: 'primary', handler: { type: 'navigate', path: '/settings/expense-approval-policies/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});

export const expenseApprovalRequestSchema = defineSchema({
  identity: {
    name: 'Approval Request',
    namePlural: 'Approval Requests',
    slug: 'modules/finance/expense-approvals',
    icon: 'ClipboardCheck',
    description: 'Pending expense approval requests',
  },
  data: {
    endpoint: '/api/expense-approval-requests',
    primaryKey: 'id',
    fields: {
      expenseId: {
        type: 'relation',
        label: 'Expense',
        required: true,
        inTable: true,
        inDetail: true,
        relation: { entity: 'expense', display: 'description' },
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Approved', value: 'approved', color: 'green' },
          { label: 'Rejected', value: 'rejected', color: 'red' },
          { label: 'Cancelled', value: 'cancelled', color: 'gray' },
        ],
        default: 'pending',
      },
      currentLevel: {
        type: 'number',
        label: 'Current Level',
        inTable: true,
        inDetail: true,
      },
      submittedBy: {
        type: 'relation',
        label: 'Submitted By',
        inTable: true,
        inDetail: true,
        relation: { entity: 'user', display: 'full_name' },
      },
      submittedAt: {
        type: 'datetime',
        label: 'Submitted At',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      completedAt: {
        type: 'datetime',
        label: 'Completed At',
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
    title: (r: Record<string, unknown>) => `Approval #${String(r.id).slice(0, 8)}`,
    subtitle: (r: Record<string, unknown>) => `Level ${r.currentLevel}`,
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'destructive',
        cancelled: 'secondary',
      };
      return { label: String(r.status || 'pending'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'submittedAt', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['notes'],
    placeholder: 'Search approvals...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
      { key: 'myApprovals', label: 'My Queue', query: { where: { status: 'pending' } } },
    ],
    advanced: ['status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } } },
        { key: 'rejected', label: 'Rejected', query: { where: { status: 'rejected' } } },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'history', label: 'Approval History', content: { type: 'related', entity: 'expense_approval_action', foreignKey: 'request_id' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'request', title: 'Request Details', content: { type: 'fields', fields: ['expenseId', 'status', 'currentLevel', 'submittedBy', 'submittedAt'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'submit', title: 'Submit for Approval', fields: ['notes'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['expenseId', 'status', 'currentLevel', 'submittedBy', 'submittedAt'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/expense-approvals/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/expense-approval-requests/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' },
      { key: 'reject', label: 'Reject', variant: 'destructive', handler: { type: 'modal', component: 'RejectExpenseModal' }, condition: (r: Record<string, unknown>) => r.status === 'pending' },
    ],
    bulk: [
      { key: 'bulkApprove', label: 'Approve Selected', variant: 'primary', handler: { type: 'api', endpoint: '/api/expense-approval-requests/bulk-approve', method: 'POST' } },
    ],
    global: [],
  },
  permissions: { create: false, read: true, update: true, delete: false },
});
