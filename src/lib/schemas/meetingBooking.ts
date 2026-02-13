import { defineSchema } from '../schema/defineSchema';

/**
 * MEETING BOOKING ENTITY SCHEMA (SSOT)
 * Scheduled meetings from booking links
 */
export const meetingBookingSchema = defineSchema({
  identity: {
    name: 'Meeting',
    namePlural: 'Meetings',
    slug: 'business/meetings',
    icon: 'CalendarCheck',
    description: 'Scheduled meetings and appointments',
  },

  data: {
    endpoint: '/api/meetings',
    primaryKey: 'id',
    fields: {
      guest_name: {
        type: 'text',
        label: 'Guest Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      guest_email: {
        type: 'email',
        label: 'Guest Email',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      guest_phone: {
        type: 'phone',
        label: 'Guest Phone',
        inForm: true,
        inDetail: true,
      },
      meeting_type_id: {
        type: 'relation',
        relation: { entity: 'meetingType', display: 'name' },
        label: 'Meeting Type',
        required: true,
        inTable: true,
        inForm: true,
      },
      starts_at: {
        type: 'datetime',
        label: 'Start Time',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      ends_at: {
        type: 'datetime',
        label: 'End Time',
        required: true,
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Completed', value: 'completed' },
          { label: 'No Show', value: 'no_show' },
        ],
        default: 'confirmed',
      },
      location_type: {
        type: 'select',
        label: 'Location',
        inTable: true,
        inDetail: true,
        options: [
          { label: 'Video Call', value: 'video' },
          { label: 'Phone Call', value: 'phone' },
          { label: 'In Person', value: 'in_person' },
          { label: 'Custom', value: 'custom' },
        ],
      },
      video_link: {
        type: 'url',
        label: 'Video Link',
        inDetail: true,
      },
      contact_id: {
        type: 'relation',
        label: 'Contact',
        inTable: true,
        inForm: true,
      },
      company_id: {
        type: 'relation',
        label: 'Company',
        inForm: true,
      },
      deal_id: {
        type: 'relation',
        relation: { entity: 'deal', display: 'name' },
        label: 'Deal',
        inForm: true,
      },
      host_notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      cancellation_reason: {
        type: 'textarea',
        label: 'Cancellation Reason',
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => `Meeting with ${record.guest_name || 'Guest'}`,
    subtitle: (record) => {
      if (record.starts_at) {
        return new Date(record.starts_at).toLocaleString();
      }
      return '';
    },
    badge: (record) => {
      const variants: Record<string, string> = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'destructive',
        completed: 'secondary',
        no_show: 'destructive',
      };
      return { label: String(record.status || 'confirmed'), variant: variants[String(record.status)] || 'default' };
    },
    defaultSort: { field: 'starts_at', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['guest_name', 'guest_email'],
    placeholder: 'Search meetings...',
  },

  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: { status: { in: ['pending', 'confirmed'] } } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['status', 'meeting_type_id', 'contact_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'upcoming', label: 'Upcoming', query: { where: { status: { in: ['pending', 'confirmed'] } } }, count: true },
        { key: 'past', label: 'Past', query: { where: { status: { in: ['completed', 'no_show'] } } }, count: true },
        { key: 'cancelled', label: 'Cancelled', query: { where: { status: 'cancelled' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'guest', title: 'Guest Info', content: { type: 'fields', fields: ['guest_name', 'guest_email', 'guest_phone'] } },
          { key: 'schedule', title: 'Schedule', content: { type: 'fields', fields: ['starts_at', 'ends_at', 'location_type', 'video_link'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'guest',
          title: 'Guest Information',
          fields: ['guest_name', 'guest_email', 'guest_phone'],
        },
        {
          key: 'schedule',
          title: 'Schedule',
          fields: ['meeting_type_id', 'starts_at', 'ends_at', 'location_type'],
        },
        {
          key: 'associations',
          title: 'Link To',
          fields: ['contact_id', 'company_id', 'deal_id'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['host_notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'guest_name',
        'guest_email',
        { field: 'meeting_type_id', format: { type: 'relation', entityType: 'meeting_type' } },
        { field: 'starts_at', format: { type: 'datetime' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        { field: 'contact_id', format: { type: 'relation', entityType: 'contact' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/meetings/${record.id}` } },
      { key: 'reschedule', label: 'Reschedule', handler: { type: 'function', fn: () => {} } },
      { key: 'cancel', label: 'Cancel', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Schedule Meeting', variant: 'primary', handler: { type: 'navigate', path: () => '/business/meetings/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'meetingType', foreignKey: 'meeting_type_id', label: 'Meeting Type' },
      { entity: 'contact', foreignKey: 'contact_id', label: 'Contact' },
      { entity: 'company', foreignKey: 'company_id', label: 'Company' },
      { entity: 'deal', foreignKey: 'deal_id', label: 'Deal' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
