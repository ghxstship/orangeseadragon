import { defineSchema } from '../schema/defineSchema';

/**
 * GROUND TRANSPORT ENTITY SCHEMA (SSOT)
 */
export const groundTransportSchema = defineSchema({
  identity: {
    name: 'Ground Transport',
    namePlural: 'Ground Transport',
    slug: 'people/travel/ground-transport',
    icon: 'Car',
    description: 'Ground transportation bookings',
  },

  data: {
    endpoint: '/api/ground-transport',
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
        relation: { entity: 'resourceBooking', display: 'name' },
        label: 'Talent Booking',
        inForm: true,
      },
      transport_type: {
        type: 'select',
        label: 'Transport Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Car Service', value: 'car_service' },
          { label: 'Shuttle', value: 'shuttle' },
          { label: 'Rental Car', value: 'rental_car' },
          { label: 'Taxi', value: 'taxi' },
          { label: 'Rideshare', value: 'rideshare' },
          { label: 'Bus', value: 'bus' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Booked', value: 'booked' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'In Transit', value: 'in_transit' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      passenger_count: {
        type: 'number',
        label: 'Passengers',
        inForm: true,
      },
      pickup_location: {
        type: 'text',
        label: 'Pickup Location',
        required: true,
        inTable: true,
        inForm: true,
      },
      pickup_time: {
        type: 'datetime',
        label: 'Pickup Time',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      dropoff_location: {
        type: 'text',
        label: 'Dropoff Location',
        required: true,
        inTable: true,
        inForm: true,
      },
      dropoff_time: {
        type: 'datetime',
        label: 'Dropoff Time',
        inForm: true,
      },
      vehicle_type: {
        type: 'text',
        label: 'Vehicle Type',
        inForm: true,
      },
      driver_name: {
        type: 'text',
        label: 'Driver Name',
        inForm: true,
        inDetail: true,
      },
      driver_phone: {
        type: 'phone',
        label: 'Driver Phone',
        inForm: true,
        inDetail: true,
      },
      confirmation_number: {
        type: 'text',
        label: 'Confirmation #',
        inForm: true,
        inDetail: true,
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
    title: (record) => `${record.pickup_location} → ${record.dropoff_location}` || 'Transport',
    subtitle: (record) => record.passenger_name || '',
    badge: (record) => {
      if (record.status === 'confirmed') return { label: 'Confirmed', variant: 'success' };
      if (record.status === 'in_transit') return { label: 'In Transit', variant: 'default' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'pickup_time', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['passenger_name', 'pickup_location', 'dropoff_location'],
    placeholder: 'Search transport...',
  },

  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: {} } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['transport_type', 'status', 'event_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Transport', query: { where: {} } },
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
          fields: ['passenger_name', 'passenger_count', 'event_id', 'booking_id'],
        },
        {
          key: 'transport',
          title: 'Transport',
          fields: ['transport_type', 'vehicle_type', 'status'],
        },
        {
          key: 'pickup',
          title: 'Pickup',
          fields: ['pickup_location', 'pickup_time'],
        },
        {
          key: 'dropoff',
          title: 'Dropoff',
          fields: ['dropoff_location', 'dropoff_time'],
        },
        {
          key: 'driver',
          title: 'Driver',
          fields: ['driver_name', 'driver_phone'],
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
      columns: [
        'passenger_name',
        'transport_type',
        'pickup_location',
        'dropoff_location',
        { field: 'pickup_time', format: { type: 'datetime' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/people/travel/ground-transport/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/people/travel/ground-transport/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Transport', variant: 'primary', handler: { type: 'navigate', path: () => '/people/travel/ground-transport/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'resourceBooking', foreignKey: 'booking_id', label: 'Booking' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
