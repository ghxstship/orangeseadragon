import { defineSchema } from '../schema/defineSchema';

export const leaveRequestSchema = defineSchema({
  identity: {
    name: 'Leave Request',
    namePlural: 'Leave Requests',
    slug: 'modules/workforce/leave',
    icon: 'Palmtree',
    description: 'Employee leave and time-off requests',
  },
  data: {
    endpoint: '/api/leave-requests',
    primaryKey: 'id',
    fields: {
      staff_member_id: {
        type: 'relation',
        label: 'Employee',
        required: true,
        inTable: true,
        inForm: true,
      },
      leave_type_id: {
        type: 'relation',
        label: 'Leave Type',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'leave_type', display: 'name' },
      },
      start_date: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      start_half_day: {
        type: 'select',
        label: 'Start',
        inForm: true,
        options: [
          { label: 'Full Day', value: 'full' },
          { label: 'Morning Only', value: 'morning' },
          { label: 'Afternoon Only', value: 'afternoon' },
        ],
        default: 'full',
      },
      end_half_day: {
        type: 'select',
        label: 'End',
        inForm: true,
        options: [
          { label: 'Full Day', value: 'full' },
          { label: 'Morning Only', value: 'morning' },
          { label: 'Afternoon Only', value: 'afternoon' },
        ],
        default: 'full',
      },
      reason: {
        type: 'textarea',
        label: 'Reason',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        default: 'pending',
      },
      approver_id: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name' },
        label: 'Approver',
        inTable: true,
        inDetail: true,
      },
      approved_at: {
        type: 'datetime',
        label: 'Approved At',
        inDetail: true,
      },
      rejection_reason: {
        type: 'textarea',
        label: 'Rejection Reason',
        inDetail: true,
      },
      attachment_url: {
        type: 'file',
        label: 'Attachment',
        inForm: true,
        inDetail: true,
        helpText: 'Supporting documentation (e.g., medical certificate)',
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const staff = r.staff_member as Record<string, unknown> | undefined;
      return staff ? String(staff.full_name || 'Employee') : 'Leave Request';
    },
    subtitle: (r: Record<string, unknown>) => {
      const leaveType = r.leave_type as Record<string, unknown> | undefined;
      return `${leaveType?.name || 'Leave'} • ${r.start_date} to ${r.end_date}`;
    },
    badge: (r: Record<string, unknown>) => {
      const status = String(r.status || 'pending');
      const variants: Record<string, string> = {
        pending: 'warning',
        approved: 'default',
        rejected: 'destructive',
        cancelled: 'secondary',
      };
      return { label: status.charAt(0).toUpperCase() + status.slice(1), variant: variants[status] || 'secondary' };
    },
    defaultSort: { field: 'start_date', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['reason'],
    placeholder: 'Search leave requests...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
      { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } } },
    ],
    advanced: ['staff_member_id', 'leave_type_id', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } }, count: true },
        { key: 'rejected', label: 'Rejected', query: { where: { status: 'rejected' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'dates', title: 'Leave Period', content: { type: 'fields', fields: ['start_date', 'end_date', 'start_half_day', 'end_half_day'] } },
          { key: 'approval', title: 'Approval', content: { type: 'fields', fields: ['status', 'approver_id', 'approved_at', 'rejection_reason'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Request Info', fields: ['staff_member_id', 'leave_type_id'] },
        { key: 'dates', title: 'Leave Period', fields: ['start_date', 'start_half_day', 'end_date', 'end_half_day'] },
        { key: 'details', title: 'Details', fields: ['reason', 'attachment_url'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        { field: 'staff_member_id', format: { type: 'relation', entityType: 'person' } },
        { field: 'leave_type_id', format: { type: 'relation', entityType: 'leave_type' } },
        { field: 'start_date', format: { type: 'date' } },
        { field: 'end_date', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        { field: 'approver_id', format: { type: 'relation', entityType: 'person' } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/leave/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/leave-requests/{id}/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' },
      { key: 'reject', label: 'Reject', variant: 'destructive', handler: { type: 'api', endpoint: '/api/leave-requests/{id}/reject', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' },
      { key: 'cancel', label: 'Cancel', handler: { type: 'api', endpoint: '/api/leave-requests/{id}/cancel', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' || r.status === 'approved' },
    ],
    bulk: [
      { key: 'bulk_approve', label: 'Approve Selected', handler: { type: 'api', endpoint: '/api/leave-requests/bulk-approve', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'New Request', variant: 'primary', handler: { type: 'navigate', path: '/people/leave/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'staffMember', foreignKey: 'staff_member_id', label: 'Employee' },
      { entity: 'leaveType', foreignKey: 'leave_type_id', label: 'Leave Type' },
      { entity: 'staffMember', foreignKey: 'approver_id', label: 'Approver' },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: false },
});
