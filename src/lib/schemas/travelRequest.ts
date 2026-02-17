/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const travelRequestSchema = defineSchema({
  identity: {
    name: 'travel_request',
    namePlural: 'Travel Requests',
    slug: 'modules/workforce/travel-requests',
    icon: 'Plane',
    description: 'Employee travel requests and bookings',
  },

  data: {
    endpoint: '/api/travel-requests',
    primaryKey: 'id',
    fields: {
      request_number: {
        type: 'text',
        label: 'Request #',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
        searchable: true,
      },
      traveler_id: {
        type: 'select',
        label: 'Traveler',
        required: true,
        inTable: true,
        inForm: true,
        options: [],
      },
      production_id: {
        type: 'select',
        label: 'Production',
        inTable: true,
        inForm: true,
        options: [],
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        inForm: true,
      },
      purpose: {
        type: 'textarea',
        label: 'Purpose',
        inForm: true,
        inDetail: true,
      },
      destination: {
        type: 'text',
        label: 'Destination',
        inTable: true,
        inForm: true,
      },
      departure_date: {
        type: 'date',
        label: 'Departure Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      return_date: {
        type: 'date',
        label: 'Return Date',
        required: true,
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
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Submitted', value: 'submitted', color: 'blue' },
          { label: 'Approved', value: 'approved', color: 'green' },
          { label: 'Booked', value: 'booked', color: 'purple' },
          { label: 'In Progress', value: 'in_progress', color: 'yellow' },
          { label: 'Completed', value: 'completed', color: 'emerald' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
        ],
        default: 'draft',
      },
      estimated_cost: {
        type: 'currency',
        label: 'Estimated Cost',
        inTable: true,
        inForm: true,
      },
      actual_cost: {
        type: 'currency',
        label: 'Actual Cost',
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
    title: (record: any) => record.request_number,
    subtitle: (record: any) => record.destination || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        draft: 'secondary', submitted: 'primary', approved: 'success',
        booked: 'primary', in_progress: 'warning', completed: 'success', cancelled: 'destructive',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'departure_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['request_number', 'destination'],
    placeholder: 'Search travel requests...',
  },

  filters: {
    quick: [
      { key: 'pending', label: 'Pending Approval', query: { where: { status: 'submitted' } } },
      { key: 'upcoming', label: 'Upcoming', query: { where: { status: { in: ['approved', 'booked'] } } } },
    ],
    advanced: ['status', 'traveler_id', 'production_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Requests', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'submitted' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'flights', label: 'Flights', content: { type: 'related', entity: 'flights', foreignKey: 'travel_request_id' } },
        { key: 'hotels', label: 'Hotels', content: { type: 'related', entity: 'hotels', foreignKey: 'travel_request_id' } },
        { key: 'transport', label: 'Ground Transport', content: { type: 'related', entity: 'ground_transport', foreignKey: 'travel_request_id' } },
      ],
      overview: {
        stats: [
          { key: 'estimated', label: 'Estimated Cost', value: { type: 'field', field: 'estimated_cost' }, format: 'currency' },
          { key: 'actual', label: 'Actual Cost', value: { type: 'field', field: 'actual_cost' }, format: 'currency' },
        ],
        blocks: [
          { key: 'purpose', title: 'Trip Details', content: { type: 'fields', fields: ['purpose', 'notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['request_number', 'traveler_id', 'status'] },
        { key: 'trip', title: 'Trip Details', fields: ['destination', 'departure_date', 'return_date', 'purpose'] },
        { key: 'relationships', title: 'Relationships', fields: ['production_id', 'event_id'] },
        { key: 'costs', title: 'Costs', fields: ['estimated_cost', 'actual_cost'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['request_number', 'traveler_id', 'destination', 'departure_date', 'return_date', 'status', 'estimated_cost'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/people/travel-requests/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Travel Request', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
