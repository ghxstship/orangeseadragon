import { defineSchema } from '../schema/defineSchema';

export const ticketTypeSchema = defineSchema({
  identity: {
    name: 'ticket_type',
    namePlural: 'Ticket Types',
    slug: 'modules/production/ticketing/types',
    icon: '🎟️',
    description: 'Event ticket types and pricing',
  },
  data: {
    endpoint: '/api/ticket-types',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Ticket Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      price_cents: {
        type: 'currency',
        label: 'Price',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      currency_id: {
        type: 'relation',
        label: 'Currency',
        required: true,
        inForm: true,
        relation: { entity: 'currency', display: 'code' },
      },
      quantity_available: {
        type: 'number',
        label: 'Quantity Available',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      registration_type_id: {
        type: 'relation',
        label: 'Registration Type',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'registration_type', display: 'name' },
      },
      sales_start_at: {
        type: 'datetime',
        label: 'Sales Start',
        inForm: true,
        inDetail: true,
      },
      sales_end_at: {
        type: 'datetime',
        label: 'Sales End',
        inForm: true,
        inDetail: true,
      },
      min_per_order: {
        type: 'number',
        label: 'Min Per Order',
        inForm: true,
        default: 1,
      },
      max_per_order: {
        type: 'number',
        label: 'Max Per Order',
        inForm: true,
      },
      is_visible: {
        type: 'switch',
        label: 'Visible',
        inTable: true,
        inForm: true,
        default: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      sort_order: {
        type: 'number',
        label: 'Sort Order',
        inForm: true,
        default: 0,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled'),
    subtitle: (r: Record<string, unknown>) => {
      const event = r.event as Record<string, unknown> | undefined;
      return event ? String(event.name || '') : '';
    },
    badge: (r: Record<string, unknown>) => {
      if (!r.is_active) return { label: 'Inactive', variant: 'secondary' };
      if (!r.is_visible) return { label: 'Hidden', variant: 'warning' };
      return { label: 'Active', variant: 'default' };
    },
    defaultSort: { field: 'sort_order', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search ticket types...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'visible', label: 'Visible', query: { where: { is_visible: true } } },
    ],
    advanced: ['event_id', 'registration_type_id', 'is_active', 'is_visible'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'sales', label: 'Sales', content: { type: 'related', entity: 'registration_line_item', foreignKey: 'ticket_type_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'sold', label: 'Sold', value: { type: 'relation-count', entity: 'registration_line_item', foreignKey: 'ticket_type_id' }, format: 'number' },
          { key: 'available', label: 'Available', value: { type: 'field', field: 'quantity_available' }, format: 'number' },
          { key: 'price', label: 'Price', value: { type: 'field', field: 'price_cents' }, format: 'currency' },
        ],
        blocks: [],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Ticket Details', fields: ['name', 'event_id', 'description', 'registration_type_id'] },
        { key: 'pricing', title: 'Pricing', fields: ['price_cents', 'currency_id'] },
        { key: 'availability', title: 'Availability', fields: ['quantity_available', 'sales_start_at', 'sales_end_at'] },
        { key: 'limits', title: 'Order Limits', fields: ['min_per_order', 'max_per_order'] },
        { key: 'settings', title: 'Settings', fields: ['is_visible', 'is_active', 'sort_order'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'event_id', 'price_cents', 'quantity_available', 'is_visible', 'is_active'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/production/ticketing/types/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/production/ticketing/types/${r.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Ticket Type', variant: 'primary', handler: { type: 'navigate', path: '/modules/production/ticketing/types/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
