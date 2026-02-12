import { defineSchema } from '../schema/defineSchema';

/**
 * TALENT BOOKING ENTITY SCHEMA (SSOT)
 */
export const talentBookingSchema = defineSchema({
  identity: {
    name: 'Talent Booking',
    namePlural: 'Talent Bookings',
    slug: 'operations/events/talent-bookings',
    icon: 'Star',
    description: 'Artist and performer bookings',
  },

  data: {
    endpoint: '/api/talent-bookings',
    primaryKey: 'id',
    fields: {
      booking_code: {
        type: 'text',
        label: 'Booking Code',
        inTable: true,
        inDetail: true,
      },
      talent_id: {
        type: 'relation',
        label: 'Talent',
        required: true,
        inTable: true,
        inForm: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
      },
      stage_id: {
        type: 'relation',
        label: 'Stage',
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Inquiry', value: 'inquiry' },
          { label: 'Negotiating', value: 'negotiating' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Contracted', value: 'contracted' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Completed', value: 'completed' },
        ],
      },
      set_time: {
        type: 'datetime',
        label: 'Set Time',
        inTable: true,
        inForm: true,
      },
      set_length_minutes: {
        type: 'number',
        label: 'Set Length (min)',
        inTable: true,
        inForm: true,
      },
      fee_amount: {
        type: 'currency',
        label: 'Fee Amount',
        inTable: true,
        inForm: true,
      },
      deposit_amount: {
        type: 'currency',
        label: 'Deposit',
        inForm: true,
        inDetail: true,
      },
      deposit_paid: {
        type: 'switch',
        label: 'Deposit Paid',
        inForm: true,
        inDetail: true,
      },
      contract_id: {
        type: 'relation',
        label: 'Contract',
        inForm: true,
        inDetail: true,
      },
      rider_id: {
        type: 'relation',
        label: 'Rider',
        inForm: true,
        inDetail: true,
      },
      travel_required: {
        type: 'switch',
        label: 'Travel Required',
        inForm: true,
      },
      accommodation_required: {
        type: 'switch',
        label: 'Accommodation Required',
        inForm: true,
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
    title: (record) => record.booking_code || 'Talent Booking',
    subtitle: (record) => record.status || '',
    badge: (record) => {
      if (record.status === 'confirmed') return { label: 'Confirmed', variant: 'success' };
      if (record.status === 'contracted') return { label: 'Contracted', variant: 'success' };
      if (record.status === 'inquiry') return { label: 'Inquiry', variant: 'secondary' };
      if (record.status === 'negotiating') return { label: 'Negotiating', variant: 'warning' };
      return { label: record.status, variant: 'default' };
    },
    defaultSort: { field: 'set_time', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['booking_code'],
    placeholder: 'Search bookings...',
  },

  filters: {
    quick: [
      { key: 'confirmed', label: 'Confirmed', query: { where: { status: { in: ['confirmed', 'contracted'] } } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['status', 'event_id', 'talent_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Bookings', query: { where: {} } },
        { key: 'confirmed', label: 'Confirmed', query: { where: { status: { in: ['confirmed', 'contracted'] } } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'rider', label: 'Rider', content: { type: 'related', entity: 'riders', foreignKey: 'booking_id' } },
        { key: 'travel', label: 'Travel', content: { type: 'related', entity: 'travel_bookings', foreignKey: 'booking_id' } },
      ],
      overview: {
        stats: [],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Booking Details',
          fields: ['talent_id', 'event_id', 'stage_id', 'status'],
        },
        {
          key: 'performance',
          title: 'Performance',
          fields: ['set_time', 'set_length_minutes'],
        },
        {
          key: 'financial',
          title: 'Financial',
          fields: ['fee_amount', 'deposit_amount', 'deposit_paid', 'contract_id'],
        },
        {
          key: 'logistics',
          title: 'Logistics',
          fields: ['rider_id', 'travel_required', 'accommodation_required', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        { field: 'talent_id', format: { type: 'relation', entityType: 'person' } },
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        { field: 'set_time', format: { type: 'datetime' } },
        { field: 'set_length_minutes', format: { type: 'number' } },
        { field: 'fee_amount', format: { type: 'currency' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/operations/events/talent-bookings/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/operations/events/talent-bookings/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Booking', variant: 'primary', handler: { type: 'navigate', path: () => '/operations/events/talent-bookings/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
