import { defineSchema } from '../schema/defineSchema';

export const timePunchSchema = defineSchema({
  identity: {
    name: 'Time Punch',
    namePlural: 'Time Punches',
    slug: 'modules/people/time-punches',
    icon: 'Clock',
    description: 'Clock in/out and break records',
  },
  data: {
    endpoint: '/api/time-punches',
    primaryKey: 'id',
    fields: {
      employeeId: {
        type: 'relation',
        label: 'Employee',
        required: true,
        inTable: true,
        inDetail: true,
        relation: { entity: 'employee_profile', display: 'full_name' },
      },
      punchType: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Clock In', value: 'clock_in', color: 'green' },
          { label: 'Clock Out', value: 'clock_out', color: 'red' },
          { label: 'Break Start', value: 'break_start', color: 'yellow' },
          { label: 'Break End', value: 'break_end', color: 'blue' },
        ],
      },
      punchTime: {
        type: 'datetime',
        label: 'Time',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      eventId: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      venueId: {
        type: 'relation',
        label: 'Venue',
        inTable: true,
        inDetail: true,
        relation: { entity: 'venue', display: 'name' },
      },
      isWithinGeofence: {
        type: 'switch',
        label: 'Within Geofence',
        inTable: true,
        inDetail: true,
      },
      distanceFromGeofenceMeters: {
        type: 'number',
        label: 'Distance (m)',
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Approved', value: 'approved', color: 'green' },
          { label: 'Rejected', value: 'rejected', color: 'red' },
          { label: 'Flagged', value: 'flagged', color: 'orange' },
        ],
        default: 'pending',
      },
      photoUrl: {
        type: 'image',
        label: 'Photo',
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      isManualEntry: {
        type: 'switch',
        label: 'Manual Entry',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const types: Record<string, string> = {
        clock_in: 'Clock In',
        clock_out: 'Clock Out',
        break_start: 'Break Start',
        break_end: 'Break End',
      };
      return types[String(r.punchType)] || 'Time Punch';
    },
    subtitle: (r: Record<string, unknown>) => {
      const time = r.punchTime ? new Date(String(r.punchTime)).toLocaleString() : '';
      return time;
    },
    badge: (r: Record<string, unknown>) => {
      if (r.status === 'flagged') return { label: 'Flagged', variant: 'warning' };
      if (r.isWithinGeofence === false) return { label: 'Outside Geofence', variant: 'destructive' };
      return { label: String(r.status || 'pending'), variant: 'secondary' };
    },
    defaultSort: { field: 'punchTime', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['notes'],
    placeholder: 'Search time punches...',
  },
  filters: {
    quick: [
      { key: 'flagged', label: 'Flagged', query: { where: { status: 'flagged' } } },
      { key: 'today', label: 'Today', query: { where: {} } },
    ],
    advanced: ['punchType', 'status', 'employeeId', 'eventId'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'flagged', label: 'Flagged', query: { where: { status: 'flagged' } }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
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
          { key: 'punch', title: 'Punch Details', content: { type: 'fields', fields: ['employeeId', 'punchType', 'punchTime', 'eventId', 'venueId'] } },
          { key: 'location', title: 'Location', content: { type: 'fields', fields: ['isWithinGeofence', 'distanceFromGeofenceMeters'] } },
          { key: 'verification', title: 'Verification', content: { type: 'fields', fields: ['photoUrl', 'status', 'isManualEntry', 'notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'punch', title: 'Time Punch', fields: ['employeeId', 'punchType', 'punchTime', 'eventId', 'notes'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['employeeId', 'punchType', 'punchTime', 'eventId', 'isWithinGeofence', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/time-punches/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/time-punches/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' || r.status === 'flagged' },
      { key: 'reject', label: 'Reject', variant: 'destructive', handler: { type: 'api', endpoint: '/api/time-punches/reject', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending' || r.status === 'flagged' },
    ],
    bulk: [
      { key: 'bulkApprove', label: 'Approve Selected', variant: 'primary', handler: { type: 'api', endpoint: '/api/time-punches/bulk-approve', method: 'POST' } },
    ],
    global: [],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});

export const timeEntrySchema = defineSchema({
  identity: {
    name: 'Time Entry',
    namePlural: 'Time Entries',
    slug: 'modules/people/timekeeping',
    icon: 'Timer',
    description: 'Completed work sessions',
  },
  data: {
    endpoint: '/api/time-entries',
    primaryKey: 'id',
    fields: {
      employeeId: {
        type: 'relation',
        label: 'Employee',
        required: true,
        inTable: true,
        inDetail: true,
      },
      eventId: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inDetail: true,
        relation: { entity: 'event', display: 'name' },
      },
      clockInTime: {
        type: 'datetime',
        label: 'Clock In',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      clockOutTime: {
        type: 'datetime',
        label: 'Clock Out',
        inTable: true,
        inDetail: true,
      },
      totalMinutes: {
        type: 'number',
        label: 'Total Minutes',
        inTable: true,
        inDetail: true,
      },
      breakMinutes: {
        type: 'number',
        label: 'Break Minutes',
        inDetail: true,
      },
      regularMinutes: {
        type: 'number',
        label: 'Regular Minutes',
        inDetail: true,
      },
      overtimeMinutes: {
        type: 'number',
        label: 'Overtime Minutes',
        inDetail: true,
      },
      totalPay: {
        type: 'currency',
        label: 'Total Pay',
        inTable: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        options: [
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Completed', value: 'completed', color: 'blue' },
          { label: 'Approved', value: 'approved', color: 'purple' },
          { label: 'Exported', value: 'exported', color: 'gray' },
        ],
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const date = r.clockInTime ? new Date(String(r.clockInTime)).toLocaleDateString() : 'Time Entry';
      return date;
    },
    subtitle: (r: Record<string, unknown>) => {
      const hours = r.totalMinutes ? Math.round(Number(r.totalMinutes) / 60 * 10) / 10 : 0;
      return `${hours} hours`;
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        active: 'success',
        completed: 'default',
        approved: 'secondary',
        exported: 'outline',
      };
      return { label: String(r.status || 'active'), variant: variants[String(r.status)] || 'default' };
    },
    defaultSort: { field: 'clockInTime', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: [],
    placeholder: 'Search time entries...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
    ],
    advanced: ['status', 'employeeId', 'eventId'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'pending', label: 'Pending Approval', query: { where: { status: 'completed' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'punches', label: 'Punches', content: { type: 'related', entity: 'time_punch', foreignKey: 'time_entry_id' } },
        { key: 'breaks', label: 'Breaks', content: { type: 'related', entity: 'break_record', foreignKey: 'time_entry_id' } },
      ],
      overview: {
        stats: [
          { key: 'hours', label: 'Hours', value: { type: 'field', field: 'totalMinutes' }, format: 'number' },
          { key: 'pay', label: 'Pay', value: { type: 'field', field: 'totalPay' }, format: 'currency' },
        ],
        blocks: [
          { key: 'times', title: 'Times', content: { type: 'fields', fields: ['clockInTime', 'clockOutTime', 'totalMinutes', 'breakMinutes'] } },
          { key: 'pay', title: 'Pay Breakdown', content: { type: 'fields', fields: ['regularMinutes', 'overtimeMinutes', 'totalPay'] } },
        ],
      },
    },
    form: {
      sections: [],
    },
  },
  views: {
    table: {
      columns: ['employeeId', 'eventId', 'clockInTime', 'clockOutTime', 'totalMinutes', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/timekeeping/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/time-entries/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'completed' },
    ],
    bulk: [
      { key: 'bulkApprove', label: 'Approve Selected', variant: 'primary', handler: { type: 'api', endpoint: '/api/time-entries/bulk-approve', method: 'POST' } },
      { key: 'export', label: 'Export to Payroll', variant: 'secondary', handler: { type: 'api', endpoint: '/api/time-entries/export', method: 'POST' } },
    ],
    global: [],
  },
  permissions: { create: false, read: true, update: true, delete: false },
});
