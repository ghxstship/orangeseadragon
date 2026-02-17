import { defineSchema } from '../schema/defineSchema';

/**
 * PRODUCT ENTITY SCHEMA (SSOT)
 *
 * Products and services offered by the organization.
 * Replaces misuse of serviceTicketSchema on business/products pages.
 */
export const productSchema = defineSchema({
  identity: {
    name: 'Product',
    namePlural: 'Products',
    slug: 'modules/business/products',
    icon: 'ShoppingBag',
    description: 'Products and services offered to clients',
  },

  data: {
    endpoint: '/api/products',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Product Name',
        placeholder: 'Enter product name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      product_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Product', value: 'product', color: 'blue' },
          { label: 'Service', value: 'service', color: 'purple' },
          { label: 'Package', value: 'package', color: 'green' },
          { label: 'Subscription', value: 'subscription', color: 'orange' },
        ],
      },
      sku: {
        type: 'text',
        label: 'SKU',
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
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Equipment Rental', value: 'equipment_rental' },
          { label: 'Labor', value: 'labor' },
          { label: 'Production Services', value: 'production_services' },
          { label: 'Venue Services', value: 'venue_services' },
          { label: 'Consulting', value: 'consulting' },
          { label: 'Other', value: 'other' },
        ],
      },
      unit_price: {
        type: 'currency',
        label: 'Unit Price',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
      },
      unit: {
        type: 'select',
        label: 'Unit',
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Each', value: 'each' },
          { label: 'Hour', value: 'hour' },
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
          { label: 'Project', value: 'project' },
        ],
      },
      cost: {
        type: 'currency',
        label: 'Cost',
        inForm: true,
        inDetail: true,
      },
      tax_rate: {
        type: 'number',
        label: 'Tax Rate (%)',
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
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Archived', value: 'archived', color: 'red' },
        ],
        default: 'active',
      },
      is_taxable: {
        type: 'switch',
        label: 'Taxable',
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
    title: (record) => record.name || 'Untitled Product',
    subtitle: (record) => record.product_type || '',
    badge: (record) => {
      if (record.status === 'active') return { label: 'Active', variant: 'success' };
      if (record.status === 'draft') return { label: 'Draft', variant: 'secondary' };
      return { label: 'Archived', variant: 'destructive' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'sku', 'description'],
    placeholder: 'Search products...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['product_type', 'status', 'category'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'products', label: 'Products', query: { where: { product_type: 'product' } }, count: true },
        { key: 'services', label: 'Services', query: { where: { product_type: 'service' } }, count: true },
        { key: 'packages', label: 'Packages', query: { where: { product_type: 'package' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'history', label: 'History', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'price', label: 'Unit Price', value: { type: 'field', field: 'unit_price' }, format: 'currency' },
          { key: 'cost', label: 'Cost', value: { type: 'field', field: 'cost' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Product Details', content: { type: 'fields', fields: ['sku', 'category', 'unit', 'is_taxable', 'tax_rate'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['name', 'product_type', 'sku', 'status', 'category'] },
        { key: 'pricing', title: 'Pricing', fields: ['unit_price', 'unit', 'cost', 'is_taxable', 'tax_rate'] },
        { key: 'details', title: 'Details', fields: ['description', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'product_type', format: { type: 'badge', colorMap: { product: '#3b82f6', service: '#8b5cf6', package: '#22c55e', subscription: '#f59e0b' } } },
        'sku',
        { field: 'unit_price', format: { type: 'currency' } },
        { field: 'status', format: { type: 'badge', colorMap: { active: '#22c55e', draft: '#6b7280', archived: '#ef4444' } } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/products/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Product', variant: 'primary', handler: { type: 'navigate', path: () => '/business/products/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
