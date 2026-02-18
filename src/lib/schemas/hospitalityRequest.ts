import { defineSchema } from '../schema/defineSchema';

export const hospitalityRequestSchema = defineSchema({
  identity: {
    name: 'Hospitality Request',
    namePlural: 'Hospitality Requests',
    slug: 'modules/production/hospitality',
    icon: 'UtensilsCrossed',
    description: 'Catering, accommodation, and transport requests for events',
  },
  data: {
    endpoint: '/api/hospitality_requests',
    primaryKey: 'id',
    fields: {
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      request_type: {
        type: 'select',
        label: 'Request Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Catering', value: 'catering' },
          { label: 'Accommodation', value: 'accommodation' },
          { label: 'Transport', value: 'transport' },
          { label: 'Green Room', value: 'green_room' },
          { label: 'VIP Services', value: 'vip' },
          { label: 'Other', value: 'other' },
        ],
      },
      requester_type: {
        type: 'select',
        label: 'Requester Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Talent', value: 'talent' },
          { label: 'Partner/Sponsor', value: 'partner' },
          { label: 'Staff', value: 'staff' },
          { label: 'VIP Guest', value: 'vip_guest' },
          { label: 'General', value: 'general' },
        ],
      },
      contact_id: {
        type: 'relation',
        relation: { entity: 'contact', display: 'full_name', searchable: true },
        label: 'Contact',
        inTable: true,
        inForm: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
      },
      quantity: {
        type: 'number',
        label: 'Quantity/Headcount',
        inTable: true,
        inForm: true,
        default: 1,
      },
      requested_date: {
        type: 'date',
        label: 'Requested Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      requested_time: {
        type: 'time',
        label: 'Requested Time',
        inForm: true,
      },
      dietary_requirements: {
        type: 'textarea',
        label: 'Dietary Requirements',
        inForm: true,
        inDetail: true,
      },
      special_instructions: {
        type: 'textarea',
        label: 'Special Instructions',
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
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Fulfilled', value: 'fulfilled' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        default: 'pending',
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
        inForm: true,
      },
      vendor_id: {
        type: 'relation',
        relation: { entity: 'company', display: 'name', searchable: true },
        label: 'Vendor',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const types: Record<string, string> = {
        catering: 'Catering',
        accommodation: 'Accommodation',
        transport: 'Transport',
        green_room: 'Green Room',
        vip: 'VIP Services',
        other: 'Other',
      };
      return types[String(r.request_type)] || 'Hospitality Request';
    },
    subtitle: (r: Record<string, unknown>) => {
      const event = r.event as Record<string, unknown> | undefined;
      return event ? String(event.name || '') : '';
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        pending: 'warning',
        approved: 'default',
        in_progress: 'default',
        fulfilled: 'success',
        cancelled: 'destructive',
      };
      return { label: String(r.status || 'pending'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'requested_date', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['description'],
    placeholder: 'Search requests...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
      { key: 'catering', label: 'Catering', query: { where: { request_type: 'catering' } } },
    ],
    advanced: ['event_id', 'request_type', 'requester_type', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'fulfilled', label: 'Fulfilled', query: { where: { status: 'fulfilled' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'cost', label: 'Estimated Cost', value: { type: 'field', field: 'estimated_cost' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Request Details', content: { type: 'fields', fields: ['event_id', 'request_type', 'requester_type', 'contact_id', 'quantity'] } },
          { key: 'schedule', title: 'Schedule', content: { type: 'fields', fields: ['requested_date', 'requested_time'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Request Details', fields: ['event_id', 'request_type', 'requester_type', 'contact_id', 'status'] },
        { key: 'details', title: 'Details', fields: ['description', 'quantity', 'requested_date', 'requested_time'] },
        { key: 'requirements', title: 'Requirements', fields: ['dietary_requirements', 'special_instructions'] },
        { key: 'costs', title: 'Costs', fields: ['estimated_cost', 'actual_cost', 'vendor_id'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['event_id', 'request_type', 'requester_type', 'requested_date', 'quantity', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/hospitality/${r.id}` } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/hospitality_requests/{id}/approve', method: 'PATCH' }, condition: (r: Record<string, unknown>) => r.status === 'pending' },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Request', variant: 'primary', handler: { type: 'navigate', path: '/productions/hospitality/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'contact', foreignKey: 'contact_id', label: 'Contact' },
      { entity: 'company', foreignKey: 'vendor_id', label: 'Vendor' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
