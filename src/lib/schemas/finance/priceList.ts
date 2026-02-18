import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * PRICE LIST ENTITY SCHEMA (SSOT)
 */
export const priceListSchema = defineSchema({
  identity: {
    name: 'Price List',
    namePlural: 'Price Lists',
    slug: 'business/products/pricing',
    icon: 'DollarSign',
    description: 'Product and service pricing',
  },

  data: {
    endpoint: '/api/price-lists',
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
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      currency: {
        type: 'select',
        label: 'Currency',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
          { label: 'CAD', value: 'CAD' },
          { label: 'AUD', value: 'AUD' },
        ],
      },
      effective_date: {
        type: 'date',
        label: 'Effective Date',
        inTable: true,
        inForm: true,
      },
      expiration_date: {
        type: 'date',
        label: 'Expiration Date',
        inTable: true,
        inForm: true,
      },
      is_default: {
        type: 'switch',
        label: 'Default',
        inTable: true,
        inForm: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Price List',
    subtitle: (record) => record.currency || '',
    badge: (record) => {
      if (record.is_default) return { label: 'Default', variant: 'success' };
      if (!record.is_active) return { label: 'Inactive', variant: 'secondary' };
      return undefined;
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search price lists...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['currency', 'is_active', 'is_default'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Price Lists', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Items', content: { type: 'related', entity: 'price_list_items', foreignKey: 'price_list_id' } },
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
          title: 'Price List Details',
          fields: ['name', 'description', 'currency'],
        },
        {
          key: 'dates',
          title: 'Validity',
          fields: ['effective_date', 'expiration_date'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['is_default', 'is_active'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        'currency',
        { field: 'effective_date', format: { type: 'date' } },
        { field: 'expiration_date', format: { type: 'date' } },
        { field: 'is_default', format: { type: 'boolean' } },
        { field: 'is_active', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/products/pricing/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/business/products/pricing/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Price List', variant: 'primary', handler: { type: 'navigate', path: () => '/business/products/pricing/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
