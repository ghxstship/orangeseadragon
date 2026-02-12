import { defineSchema } from '../schema/defineSchema';

/**
 * ACCOMMODATION ENTITY SCHEMA (SSOT)
 */
export const accommodationSchema = defineSchema({
  identity: {
    name: 'Accommodation',
    namePlural: 'Accommodations',
    slug: 'people/travel/accommodations',
    icon: 'Hotel',
    description: 'Hotel and accommodation bookings',
  },

  data: {
    endpoint: '/api/accommodations',
    primaryKey: 'id',
    fields: {
      guest_name: {
        type: 'text',
        label: 'Guest Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      booking_id: {
        type: 'relation',
        label: 'Talent Booking',
        inForm: true,
      },
      hotel_name: {
        type: 'text',
        label: 'Hotel Name',
        required: true,
        inTable: true,
        inForm: true,
      },
      hotel_address: {
        type: 'text',
        label: 'Hotel Address',
        inForm: true,
        inDetail: true,
      },
      hotel_phone: {
        type: 'phone',
        label: 'Hotel Phone',
        inForm: true,
        inDetail: true,
      },
      room_type: {
        type: 'text',
        label: 'Room Type',
        inTable: true,
        inForm: true,
      },
      check_in_date: {
        type: 'date',
        label: 'Check-in Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      check_in_time: {
        type: 'text',
        label: 'Check-in Time',
        inForm: true,
      },
      check_out_date: {
        type: 'date',
        label: 'Check-out Date',
        required: true,
        inTable: true,
        inForm: true,
      },
      check_out_time: {
        type: 'text',
        label: 'Check-out Time',
        inForm: true,
      },
      confirmation_number: {
        type: 'text',
        label: 'Confirmation #',
        inTable: true,
        inForm: true,
      },
      nightly_rate: {
        type: 'currency',
        label: 'Nightly Rate',
        inForm: true,
      },
      total_cost: {
        type: 'currency',
        label: 'Total Cost',
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Booked', value: 'booked' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Checked In', value: 'checked_in' },
          { label: 'Checked Out', value: 'checked_out' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      special_requests: {
        type: 'textarea',
        label: 'Special Requests',
        inForm: true,
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
    title: (record) => record.hotel_name || 'Accommodation',
    subtitle: (record) => record.guest_name || '',
    badge: (record) => {
      if (record.status === 'confirmed') return { label: 'Confirmed', variant: 'success' };
      if (record.status === 'checked_in') return { label: 'Checked In', variant: 'default' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'check_in_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['guest_name', 'hotel_name', 'confirmation_number'],
    placeholder: 'Search accommodations...',
  },

  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: {} } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['status', 'event_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'upcoming', label: 'Upcoming', query: { where: { check_in_date: { gte: 'now' } } }, count: true },
        { key: 'checked-in', label: 'Checked In', query: { where: { status: 'checked_in' } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'checked_out' } } },
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
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'guest',
          title: 'Guest',
          fields: ['guest_name', 'event_id', 'booking_id'],
        },
        {
          key: 'hotel',
          title: 'Hotel',
          fields: ['hotel_name', 'hotel_address', 'hotel_phone', 'room_type'],
        },
        {
          key: 'dates',
          title: 'Dates',
          fields: ['check_in_date', 'check_in_time', 'check_out_date', 'check_out_time'],
        },
        {
          key: 'booking',
          title: 'Booking',
          fields: ['confirmation_number', 'nightly_rate', 'total_cost', 'status'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['special_requests', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'guest_name', 'hotel_name',
        { field: 'check_in_date', format: { type: 'date' } },
        { field: 'check_out_date', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { pending: '#f59e0b', confirmed: '#22c55e', checked_in: '#3b82f6', checked_out: '#6b7280', cancelled: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/people/travel/accommodations/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/people/travel/accommodations/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Accommodation', variant: 'primary', handler: { type: 'navigate', path: () => '/people/travel/accommodations/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
