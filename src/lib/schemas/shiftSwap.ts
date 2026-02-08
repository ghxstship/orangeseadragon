import { defineSchema } from '../schema/defineSchema';

export const shiftSwapRequestSchema = defineSchema({
  identity: {
    name: 'Shift Swap Request',
    namePlural: 'Shift Swap Requests',
    slug: 'modules/people/shift-swaps',
    icon: 'ArrowLeftRight',
    description: 'Shift swap and coverage requests',
  },
  data: {
    endpoint: '/api/shift-swap-requests',
    primaryKey: 'id',
    fields: {
      originalShiftId: {
        type: 'relation',
        label: 'Original Shift',
        required: true,
        inTable: true,
        inDetail: true,
        relation: { entity: 'shift', display: 'name' },
      },
      requestingEmployeeId: {
        type: 'relation',
        label: 'Requested By',
        required: true,
        inTable: true,
        inDetail: true,
        relation: { entity: 'employee_profile', display: 'full_name' },
      },
      targetEmployeeId: {
        type: 'relation',
        label: 'Target Employee',
        inTable: true,
        inDetail: true,
        relation: { entity: 'employee_profile', display: 'full_name' },
      },
      swapType: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Swap', value: 'swap', color: 'blue' },
          { label: 'Give Away', value: 'giveaway', color: 'purple' },
          { label: 'Cover', value: 'cover', color: 'green' },
        ],
        default: 'swap',
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Target Accepted', value: 'target_accepted', color: 'blue' },
          { label: 'Approved', value: 'approved', color: 'green' },
          { label: 'Rejected', value: 'rejected', color: 'red' },
          { label: 'Cancelled', value: 'cancelled', color: 'gray' },
          { label: 'Expired', value: 'expired', color: 'gray' },
        ],
        default: 'pending',
      },
      reason: {
        type: 'textarea',
        label: 'Reason',
        inForm: true,
        inDetail: true,
      },
      requesterNotes: {
        type: 'textarea',
        label: 'Requester Notes',
        inForm: true,
        inDetail: true,
      },
      targetNotes: {
        type: 'textarea',
        label: 'Target Notes',
        inDetail: true,
      },
      managerNotes: {
        type: 'textarea',
        label: 'Manager Notes',
        inDetail: true,
      },
      requestedAt: {
        type: 'datetime',
        label: 'Requested At',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      expiresAt: {
        type: 'datetime',
        label: 'Expires At',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => `Swap Request #${String(r.id).slice(0, 8)}`,
    subtitle: (r: Record<string, unknown>) => String(r.swapType || 'swap'),
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        pending: 'warning',
        target_accepted: 'default',
        approved: 'success',
        rejected: 'destructive',
        cancelled: 'secondary',
        expired: 'secondary',
      };
      return { label: String(r.status || 'pending'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'requestedAt', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['reason'],
    placeholder: 'Search swap requests...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
      { key: 'needsApproval', label: 'Needs Approval', query: { where: { status: 'target_accepted' } } },
    ],
    advanced: ['status', 'swapType', 'requestingEmployeeId'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'needsApproval', label: 'Needs Approval', query: { where: { status: 'target_accepted' } }, count: true },
        { key: 'approved', label: 'Approved', query: { where: { status: 'approved' } } },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'request', title: 'Request Details', content: { type: 'fields', fields: ['originalShiftId', 'requestingEmployeeId', 'targetEmployeeId', 'swapType', 'status'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['reason', 'requesterNotes', 'targetNotes', 'managerNotes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'request', title: 'Swap Request', fields: ['targetEmployeeId', 'swapType', 'reason', 'requesterNotes'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['requestingEmployeeId', 'targetEmployeeId', 'swapType', 'status', 'requestedAt'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/shift-swaps/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/shift-swap-requests/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'target_accepted' },
      { key: 'reject', label: 'Reject', variant: 'destructive', handler: { type: 'api', endpoint: '/api/shift-swap-requests/reject', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' || r.status === 'target_accepted' },
    ],
    bulk: [],
    global: [],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});

export const openShiftSchema = defineSchema({
  identity: {
    name: 'Open Shift',
    namePlural: 'Open Shifts',
    slug: 'modules/people/open-shifts',
    icon: 'CalendarPlus',
    description: 'Available shifts for claiming',
  },
  data: {
    endpoint: '/api/open-shifts',
    primaryKey: 'id',
    fields: {
      shiftId: {
        type: 'relation',
        label: 'Shift',
        required: true,
        inTable: true,
        inDetail: true,
        relation: { entity: 'shift', display: 'name' },
      },
      reason: {
        type: 'select',
        label: 'Reason',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Call Out', value: 'callout', color: 'red' },
          { label: 'Understaffed', value: 'understaffed', color: 'orange' },
          { label: 'New Shift', value: 'new_shift', color: 'blue' },
          { label: 'Swap Giveaway', value: 'swap_giveaway', color: 'purple' },
        ],
      },
      priority: {
        type: 'select',
        label: 'Priority',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Low', value: 'low', color: 'gray' },
          { label: 'Normal', value: 'normal', color: 'blue' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Urgent', value: 'urgent', color: 'red' },
        ],
        default: 'normal',
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        options: [
          { label: 'Open', value: 'open', color: 'green' },
          { label: 'Claimed', value: 'claimed', color: 'blue' },
          { label: 'Filled', value: 'filled', color: 'purple' },
          { label: 'Cancelled', value: 'cancelled', color: 'gray' },
          { label: 'Expired', value: 'expired', color: 'gray' },
        ],
        default: 'open',
      },
      bonusAmount: {
        type: 'currency',
        label: 'Bonus',
        inTable: true,
        inForm: true,
      },
      bonusDescription: {
        type: 'text',
        label: 'Bonus Description',
        inForm: true,
        inDetail: true,
      },
      claimedBy: {
        type: 'relation',
        label: 'Claimed By',
        inTable: true,
        inDetail: true,
        relation: { entity: 'employee_profile', display: 'full_name' },
      },
      postedAt: {
        type: 'datetime',
        label: 'Posted At',
        inTable: true,
        sortable: true,
      },
      expiresAt: {
        type: 'datetime',
        label: 'Expires At',
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
    title: () => `Open Shift`,
    subtitle: (r: Record<string, unknown>) => String(r.reason || ''),
    badge: (r: Record<string, unknown>) => {
      if (r.priority === 'urgent') return { label: 'Urgent', variant: 'destructive' };
      if (r.priority === 'high') return { label: 'High Priority', variant: 'warning' };
      const variants: Record<string, string> = {
        open: 'success',
        claimed: 'default',
        filled: 'secondary',
        cancelled: 'outline',
        expired: 'outline',
      };
      return { label: String(r.status || 'open'), variant: variants[String(r.status)] || 'default' };
    },
    defaultSort: { field: 'postedAt', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['notes'],
    placeholder: 'Search open shifts...',
  },
  filters: {
    quick: [
      { key: 'open', label: 'Available', query: { where: { status: 'open' } } },
      { key: 'urgent', label: 'Urgent', query: { where: { priority: 'urgent' } } },
    ],
    advanced: ['status', 'priority', 'reason'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'open', label: 'Available', query: { where: { status: 'open' } }, count: true },
        { key: 'claimed', label: 'Claimed', query: { where: { status: 'claimed' } } },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'claims', label: 'Claim Requests', content: { type: 'related', entity: 'shift_claim_request', foreignKey: 'open_shift_id' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'shift', title: 'Shift Details', content: { type: 'fields', fields: ['shiftId', 'reason', 'priority', 'status'] } },
          { key: 'bonus', title: 'Incentive', content: { type: 'fields', fields: ['bonusAmount', 'bonusDescription'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'shift', title: 'Open Shift', fields: ['shiftId', 'reason', 'priority', 'notes'] },
        { key: 'bonus', title: 'Incentive', fields: ['bonusAmount', 'bonusDescription'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['shiftId', 'reason', 'priority', 'status', 'bonusAmount', 'postedAt'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/open-shifts/${r.id}` } },
      { key: 'claim', label: 'Claim Shift', variant: 'primary', handler: { type: 'api', endpoint: '/api/open-shifts/claim', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'open' },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Post Open Shift', variant: 'primary', handler: { type: 'navigate', path: '/people/open-shifts/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
