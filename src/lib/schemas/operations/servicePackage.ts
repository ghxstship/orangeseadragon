import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * SERVICE PACKAGE ENTITY SCHEMA (SSOT)
 */
export const servicePackageSchema = defineSchema({
  identity: {
    name: 'Service Package',
    namePlural: 'Service Packages',
    slug: 'business/products/packages',
    icon: 'Package',
    description: 'Bundled service packages',
  },

  data: {
    endpoint: '/api/service-packages',
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
      package_type: {
        type: 'select',
        label: 'Package Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Premium', value: 'premium' },
          { label: 'Enterprise', value: 'enterprise' },
          { label: 'Custom', value: 'custom' },
        ],
      },
      base_price: {
        type: 'currency',
        label: 'Base Price',
        required: true,
        inTable: true,
        inForm: true,
      },
      discount_percent: {
        type: 'number',
        label: 'Discount %',
        inTable: true,
        inForm: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
      },
      valid_from: {
        type: 'date',
        label: 'Valid From',
        inForm: true,
      },
      valid_until: {
        type: 'date',
        label: 'Valid Until',
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Service Package',
    subtitle: (record) => record.package_type || '',
    badge: (record) => {
      if (!record.is_active) return { label: 'Inactive', variant: 'secondary' };
      return undefined;
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search packages...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['package_type', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Packages', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Included Items', content: { type: 'related', entity: 'package_items', foreignKey: 'package_id' } },
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
          title: 'Package Details',
          fields: ['name', 'description', 'package_type'],
        },
        {
          key: 'pricing',
          title: 'Pricing',
          fields: ['base_price', 'discount_percent'],
        },
        {
          key: 'validity',
          title: 'Validity',
          fields: ['is_active', 'valid_from', 'valid_until'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        'package_type',
        { field: 'base_price', format: { type: 'currency' } },
        { field: 'discount_percent', format: { type: 'percentage' } },
        { field: 'is_active', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/products/packages/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/business/products/packages/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Package', variant: 'primary', handler: { type: 'navigate', path: () => '/business/products/packages/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
