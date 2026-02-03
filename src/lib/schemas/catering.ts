import { defineSchema } from '../schema/defineSchema';

/**
 * CATERING ORDER ENTITY SCHEMA (SSOT)
 */
export const cateringSchema = defineSchema({
  identity: {
    name: 'Catering Order',
    namePlural: 'Catering Orders',
    slug: 'productions/advancing/catering',
    icon: 'UtensilsCrossed',
    description: 'Catering orders and meal planning',
  },

  data: {
    endpoint: '/api/catering-orders',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      order_type: {
        type: 'select',
        label: 'Order Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Greenroom', value: 'greenroom' },
          { label: 'Crew Meal', value: 'crew_meal' },
          { label: 'VIP', value: 'vip' },
          { label: 'Hospitality', value: 'hospitality' },
          { label: 'Concession', value: 'concession' },
        ],
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
      vendor_id: {
        type: 'relation',
        label: 'Vendor',
        inTable: true,
        inForm: true,
      },
      delivery_date: {
        type: 'date',
        label: 'Delivery Date',
        required: true,
        inTable: true,
        inForm: true,
      },
      delivery_time: {
        type: 'text',
        label: 'Delivery Time',
        inTable: true,
        inForm: true,
      },
      delivery_location: {
        type: 'text',
        label: 'Delivery Location',
        inForm: true,
        inDetail: true,
      },
      headcount: {
        type: 'number',
        label: 'Headcount',
        inTable: true,
        inForm: true,
      },
      dietary_requirements: {
        type: 'textarea',
        label: 'Dietary Requirements',
        inForm: true,
        inDetail: true,
      },
      menu_items: {
        type: 'textarea',
        label: 'Menu Items',
        inForm: true,
        inDetail: true,
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
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
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
    title: (record) => record.name || 'Catering Order',
    subtitle: (record) => record.order_type || '',
    badge: (record) => {
      if (record.status === 'confirmed') return { label: 'Confirmed', variant: 'success' };
      if (record.status === 'pending') return { label: 'Pending', variant: 'warning' };
      if (record.status === 'delivered') return { label: 'Delivered', variant: 'default' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'delivery_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'menu_items'],
    placeholder: 'Search catering orders...',
  },

  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['order_type', 'status', 'event_id', 'vendor_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Orders', query: { where: {} } },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
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
          key: 'basic',
          title: 'Order Details',
          fields: ['name', 'order_type', 'event_id', 'booking_id', 'vendor_id', 'status'],
        },
        {
          key: 'delivery',
          title: 'Delivery',
          fields: ['delivery_date', 'delivery_time', 'delivery_location', 'headcount'],
        },
        {
          key: 'menu',
          title: 'Menu',
          fields: ['menu_items', 'dietary_requirements', 'total_cost', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'order_type', 'event_id', 'delivery_date', 'headcount', 'status'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/productions/advancing/catering/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/productions/advancing/catering/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Order', variant: 'primary', handler: { type: 'navigate', path: () => '/productions/advancing/catering/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
