import { defineSchema } from '../schema/defineSchema';

export const clockEntrySchema = defineSchema({
  identity: {
    name: 'Clock Entry',
    namePlural: 'Clock Entries',
    slug: 'modules/workforce/clock',
    icon: 'Clock',
    description: 'Employee clock in/out records for time and attendance',
  },
  data: {
    endpoint: '/api/clock-entries',
    primaryKey: 'id',
    fields: {
      employee_id: {
        type: 'relation',
        label: 'Employee',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'user_profile', display: 'headline' },
      },
      clock_in: {
        type: 'datetime',
        label: 'Clock In',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      clock_out: {
        type: 'datetime',
        label: 'Clock Out',
        inTable: true,
        inForm: true,
      },
      clock_in_location: {
        type: 'text',
        label: 'Clock In Location',
        inDetail: true,
      },
      clock_out_location: {
        type: 'text',
        label: 'Clock Out Location',
        inDetail: true,
      },
      clock_in_lat: {
        type: 'number',
        label: 'Clock In Latitude',
      },
      clock_in_lng: {
        type: 'number',
        label: 'Clock In Longitude',
      },
      clock_out_lat: {
        type: 'number',
        label: 'Clock Out Latitude',
      },
      clock_out_lng: {
        type: 'number',
        label: 'Clock Out Longitude',
      },
      total_hours: {
        type: 'number',
        label: 'Total Hours',
        inTable: true,
        inDetail: true,
      },
      break_minutes: {
        type: 'number',
        label: 'Break (mins)',
        inTable: true,
        inForm: true,
        default: 0,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Clocked In', value: 'clocked_in', color: 'green' },
          { label: 'On Break', value: 'on_break', color: 'yellow' },
          { label: 'Clocked Out', value: 'clocked_out', color: 'gray' },
          { label: 'Approved', value: 'approved', color: 'blue' },
          { label: 'Flagged', value: 'flagged', color: 'red' },
        ],
        default: 'clocked_in',
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      shift_id: {
        type: 'relation',
        label: 'Scheduled Shift',
        inDetail: true,
        relation: { entity: 'shift', display: 'name' },
      },
      approved_by_id: {
        type: 'relation',
        label: 'Approved By',
        inDetail: true,
        relation: { entity: 'user_profile', display: 'headline' },
      },
      approved_at: {
        type: 'datetime',
        label: 'Approved At',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const employee = r.employee as Record<string, unknown> | undefined;
      return employee ? String(employee.headline || 'Clock Entry') : 'Clock Entry';
    },
    subtitle: (r: Record<string, unknown>) => {
      const clockIn = r.clock_in ? new Date(String(r.clock_in)).toLocaleString() : '';
      return clockIn;
    },
    badge: (r: Record<string, unknown>) => {
      const status = String(r.status || 'clocked_out');
      const variants: Record<string, string> = {
        clocked_in: 'success',
        on_break: 'warning',
        clocked_out: 'secondary',
        approved: 'default',
        flagged: 'destructive',
      };
      return { label: status.replace('_', ' ').toUpperCase(), variant: variants[status] || 'secondary' };
    },
    defaultSort: { field: 'clock_in', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['notes'],
    placeholder: 'Search clock entries...',
  },
  filters: {
    quick: [
      { key: 'today', label: 'Today', query: { where: {} } },
      { key: 'flagged', label: 'Flagged', query: { where: { status: 'flagged' } } },
    ],
    advanced: ['employee_id', 'status', 'clock_in'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'clocked_in' } }, count: true },
        { key: 'pending', label: 'Pending Approval', query: { where: { status: 'clocked_out' } }, count: true },
        { key: 'flagged', label: 'Flagged', query: { where: { status: 'flagged' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'breaks', label: 'Breaks', content: { type: 'related', entity: 'break_record', foreignKey: 'clock_entry_id' } },
      ],
      overview: {
        stats: [
          { key: 'hours', label: 'Total Hours', value: { type: 'field', field: 'total_hours' }, format: 'number' },
        ],
        blocks: [
          { key: 'times', title: 'Clock Times', content: { type: 'fields', fields: ['clock_in', 'clock_out', 'total_hours', 'break_minutes'] } },
          { key: 'location', title: 'Location', content: { type: 'fields', fields: ['clock_in_location', 'clock_out_location'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Clock Entry', fields: ['employee_id', 'shift_id'] },
        { key: 'times', title: 'Times', fields: ['clock_in', 'clock_out', 'break_minutes'] },
        { key: 'details', title: 'Details', fields: ['status', 'notes'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        { field: 'employee_id', format: { type: 'relation', entityType: 'employee' } },
        { field: 'clock_in', format: { type: 'datetime' } },
        { field: 'clock_out', format: { type: 'datetime' } },
        { field: 'total_hours', format: { type: 'number' } },
        { field: 'break_minutes', format: { type: 'number' } },
        { field: 'status', format: { type: 'badge', colorMap: { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' } } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/timekeeping/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/clock-entries/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'clocked_out' },
      { key: 'flag', label: 'Flag', variant: 'destructive', handler: { type: 'api', endpoint: '/api/clock-entries/flag', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status !== 'flagged' },
    ],
    bulk: [
      { key: 'bulk_approve', label: 'Approve Selected', handler: { type: 'api', endpoint: '/api/clock-entries/bulk-approve', method: 'POST' } },
    ],
    global: [],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});
