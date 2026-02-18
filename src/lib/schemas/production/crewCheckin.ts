import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * CREW CHECK-IN ENTITY SCHEMA (SSOT)
 * 
 * Tracks crew member check-ins/check-outs for events with support for:
 * - QR code scanning
 * - GPS geofencing validation
 * - Break tracking
 * - Overtime calculations
 */
export const crewCheckinSchema = defineSchema({
  identity: {
    name: 'crew_checkin',
    namePlural: 'Crew Check-ins',
    slug: 'modules/operations/crew-checkins',
    icon: 'UserCheck',
    description: 'Crew member check-in and attendance tracking',
  },

  data: {
    endpoint: '/api/crew-checkins',
    primaryKey: 'id',
    fields: {
      crew_member_id: {
        type: 'relation',
        label: 'Crew Member',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
      },
      shift_id: {
        type: 'relation',
        label: 'Scheduled Shift',
        inTable: true,
        inForm: true,
      },
      department_id: {
        type: 'relation',
        relation: { entity: 'department', display: 'name' },
        label: 'Department',
        inTable: true,
        inForm: true,
      },
      role: {
        type: 'text',
        label: 'Role',
        inTable: true,
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
          { label: 'Checked In', value: 'checked_in', color: 'green' },
          { label: 'On Break', value: 'on_break', color: 'yellow' },
          { label: 'Checked Out', value: 'checked_out', color: 'gray' },
          { label: 'No Show', value: 'no_show', color: 'red' },
          { label: 'Late', value: 'late', color: 'orange' },
        ],
        default: 'checked_in',
      },
      check_in_time: {
        type: 'datetime',
        label: 'Check-in Time',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
      },
      check_out_time: {
        type: 'datetime',
        label: 'Check-out Time',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      scheduled_start: {
        type: 'datetime',
        label: 'Scheduled Start',
        inTable: true,
        inDetail: true,
      },
      scheduled_end: {
        type: 'datetime',
        label: 'Scheduled End',
        inDetail: true,
      },
      check_in_method: {
        type: 'select',
        label: 'Check-in Method',
        inTable: true,
        inDetail: true,
        options: [
          { label: 'QR Code', value: 'qr_code', color: 'blue' },
          { label: 'Manual', value: 'manual', color: 'gray' },
          { label: 'Geofence', value: 'geofence', color: 'purple' },
          { label: 'NFC', value: 'nfc', color: 'cyan' },
          { label: 'Facial Recognition', value: 'facial', color: 'pink' },
        ],
        default: 'manual',
      },
      check_in_location: {
        type: 'json',
        label: 'Check-in Location',
        inDetail: true,
      },
      check_out_location: {
        type: 'json',
        label: 'Check-out Location',
        inDetail: true,
      },
      geofence_valid: {
        type: 'switch',
        label: 'Geofence Valid',
        inTable: true,
        inDetail: true,
      },
      break_start: {
        type: 'datetime',
        label: 'Break Start',
        inDetail: true,
      },
      break_end: {
        type: 'datetime',
        label: 'Break End',
        inDetail: true,
      },
      total_break_minutes: {
        type: 'number',
        label: 'Total Break (min)',
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      verified_by_id: {
        type: 'relation',
        label: 'Verified By',
        inDetail: true,
      },
      photo_url: {
        type: 'text',
        label: 'Check-in Photo',
        inDetail: true,
      },
      device_id: {
        type: 'text',
        label: 'Device ID',
        inDetail: true,
      },
    },
    computed: {
      hours_worked: {
        label: 'Hours Worked',
        computation: {
          type: 'derived',
          compute: (checkin: Record<string, unknown>) => {
            if (!checkin.check_in_time) return null;
            const checkIn = new Date(checkin.check_in_time as string).getTime();
            const checkOut = checkin.check_out_time 
              ? new Date(checkin.check_out_time as string).getTime()
              : Date.now();
            const breakMinutes = (checkin.total_break_minutes as number) || 0;
            const totalMinutes = (checkOut - checkIn) / 60000 - breakMinutes;
            return Math.round(totalMinutes / 60 * 100) / 100;
          },
        },
        inTable: true,
        inDetail: true,
      },
      punctuality: {
        label: 'Punctuality',
        computation: {
          type: 'derived',
          compute: (checkin: Record<string, unknown>) => {
            if (!checkin.check_in_time || !checkin.scheduled_start) return 'N/A';
            const checkIn = new Date(checkin.check_in_time as string).getTime();
            const scheduled = new Date(checkin.scheduled_start as string).getTime();
            const diffMinutes = Math.round((checkIn - scheduled) / 60000);
            if (diffMinutes <= 0) return 'On Time';
            if (diffMinutes <= 5) return 'On Time';
            if (diffMinutes <= 15) return `${diffMinutes}m late`;
            return `${diffMinutes}m late`;
          },
        },
        inTable: true,
        inDetail: true,
      },
      overtime_hours: {
        label: 'Overtime',
        computation: {
          type: 'derived',
          compute: (checkin: Record<string, unknown>) => {
            if (!checkin.check_in_time || !checkin.check_out_time || !checkin.scheduled_end) return 0;
            const checkOut = new Date(checkin.check_out_time as string).getTime();
            const scheduledEnd = new Date(checkin.scheduled_end as string).getTime();
            const overtimeMs = Math.max(0, checkOut - scheduledEnd);
            return Math.round(overtimeMs / 3600000 * 100) / 100;
          },
        },
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.crew_member_id || 'Unknown Crew'),
    subtitle: (r: Record<string, unknown>) => String(r.role || ''),
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        checked_in: { label: 'Checked In', variant: 'primary' },
        on_break: { label: 'On Break', variant: 'warning' },
        checked_out: { label: 'Checked Out', variant: 'secondary' },
        no_show: { label: 'No Show', variant: 'destructive' },
        late: { label: 'Late', variant: 'warning' },
      };
      return statusMap[r.status as string] || { label: 'Unknown', variant: 'secondary' };
    },
    defaultSort: { field: 'check_in_time', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['crew_member_id', 'role', 'notes'],
    placeholder: 'Search check-ins...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Currently On Site', query: { where: { status: 'checked_in' } } },
      { key: 'on_break', label: 'On Break', query: { where: { status: 'on_break' } } },
      { key: 'no_show', label: 'No Shows', query: { where: { status: 'no_show' } } },
    ],
    advanced: ['status', 'event_id', 'department_id', 'check_in_method', 'geofence_valid'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'active', label: 'On Site', query: { where: { status: { in: ['checked_in', 'on_break'] } } }, count: true },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'today', label: 'Today', query: { where: { check_in_time: { gte: 'today' } } }, count: true },
        { key: 'no_show', label: 'No Shows', query: { where: { status: 'no_show' } }, count: true },
        { key: 'late', label: 'Late Arrivals', query: { where: { status: 'late' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'timeline', label: 'Timeline', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'hours', label: 'Hours Worked', value: { type: 'field', field: 'hours_worked' }, format: 'number' },
          { key: 'overtime', label: 'Overtime', value: { type: 'field', field: 'overtime_hours' }, format: 'number' },
        ],
        blocks: [
          { key: 'timing', title: 'Timing', content: { type: 'fields', fields: ['check_in_time', 'check_out_time', 'scheduled_start', 'scheduled_end'] } },
          { key: 'location', title: 'Location', content: { type: 'fields', fields: ['check_in_location', 'geofence_valid'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Check-in Details', fields: ['crew_member_id', 'event_id', 'shift_id', 'department_id', 'role'] },
        { key: 'timing', title: 'Timing', fields: ['check_in_time', 'check_out_time', 'scheduled_start', 'scheduled_end'] },
        { key: 'method', title: 'Method', fields: ['check_in_method', 'status'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['crew_member_id', 'role', 'status', 'check_in_time', 'check_out_time', 'hours_worked', 'punctuality', 'check_in_method'],
    },
    grid: {
      cardFields: ['status', 'check_in_time', 'hours_worked'],
      titleField: 'crew_member_id',
      subtitleField: 'role',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/crew-checkins/${r.id}` } },
      { key: 'checkout', label: 'Check Out', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'break', label: 'Start Break', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'checkout_all', label: 'Check Out Selected', handler: { type: 'function', fn: () => {} } },
      { key: 'export', label: 'Export', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'checkin', label: 'New Check-in', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'scan', label: 'Scan QR', variant: 'secondary', handler: { type: 'function', fn: () => {} } },
      { key: 'kiosk', label: 'Kiosk Mode', handler: { type: 'navigate', path: () => '/operations/crew-checkins/kiosk' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'shift', foreignKey: 'shift_id', label: 'Shift' },
      { entity: 'department', foreignKey: 'department_id', label: 'Department' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
