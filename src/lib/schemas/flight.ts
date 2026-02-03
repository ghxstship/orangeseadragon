import { defineSchema } from '../schema/defineSchema';

/**
 * FLIGHT ENTITY SCHEMA (SSOT)
 */
export const flightSchema = defineSchema({
  identity: {
    name: 'Flight',
    namePlural: 'Flights',
    slug: 'people/travel/flights',
    icon: 'Plane',
    description: 'Flight bookings and itineraries',
  },

  data: {
    endpoint: '/api/flights',
    primaryKey: 'id',
    fields: {
      passenger_name: {
        type: 'text',
        label: 'Passenger Name',
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
      airline: {
        type: 'text',
        label: 'Airline',
        inTable: true,
        inForm: true,
      },
      flight_number: {
        type: 'text',
        label: 'Flight Number',
        inTable: true,
        inForm: true,
      },
      departure_airport: {
        type: 'text',
        label: 'Departure Airport',
        inTable: true,
        inForm: true,
      },
      departure_time: {
        type: 'datetime',
        label: 'Departure Time',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      arrival_airport: {
        type: 'text',
        label: 'Arrival Airport',
        inTable: true,
        inForm: true,
      },
      arrival_time: {
        type: 'datetime',
        label: 'Arrival Time',
        inTable: true,
        inForm: true,
      },
      seat_class: {
        type: 'select',
        label: 'Class',
        inForm: true,
        options: [
          { label: 'Economy', value: 'economy' },
          { label: 'Premium Economy', value: 'premium_economy' },
          { label: 'Business', value: 'business' },
          { label: 'First', value: 'first' },
        ],
      },
      seat_number: {
        type: 'text',
        label: 'Seat Number',
        inForm: true,
        inDetail: true,
      },
      confirmation_number: {
        type: 'text',
        label: 'Confirmation #',
        inTable: true,
        inForm: true,
      },
      cost: {
        type: 'currency',
        label: 'Cost',
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
    title: (record) => `${record.departure_airport} → ${record.arrival_airport}` || 'Flight',
    subtitle: (record) => record.passenger_name || '',
    defaultSort: { field: 'departure_time', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['passenger_name', 'flight_number', 'confirmation_number'],
    placeholder: 'Search flights...',
  },

  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: {} } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['event_id', 'airline'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Flights', query: { where: {} } },
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
          key: 'passenger',
          title: 'Passenger',
          fields: ['passenger_name', 'event_id', 'booking_id'],
        },
        {
          key: 'flight',
          title: 'Flight Details',
          fields: ['airline', 'flight_number', 'seat_class', 'seat_number'],
        },
        {
          key: 'departure',
          title: 'Departure',
          fields: ['departure_airport', 'departure_time'],
        },
        {
          key: 'arrival',
          title: 'Arrival',
          fields: ['arrival_airport', 'arrival_time'],
        },
        {
          key: 'booking',
          title: 'Booking',
          fields: ['confirmation_number', 'cost', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['passenger_name', 'flight_number', 'departure_airport', 'arrival_airport', 'departure_time'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/people/travel/flights/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/people/travel/flights/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Flight', variant: 'primary', handler: { type: 'navigate', path: () => '/people/travel/flights/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
