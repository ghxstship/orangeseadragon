import { defineSchema } from '../schema/defineSchema';

/**
 * MARKETPLACE LISTING ENTITY SCHEMA (SSOT)
 */
export const marketplaceSchema = defineSchema({
  identity: {
    name: 'Listing',
    namePlural: 'Marketplace',
    slug: 'network/marketplace',
    icon: '🛒',
    description: 'Marketplace listings and services',
  },

  data: {
    endpoint: '/api/marketplace_listings',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'richtext',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
      },
      listing_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Service', value: 'service' },
          { label: 'Product', value: 'product' },
          { label: 'Equipment', value: 'equipment' },
          { label: 'Rental', value: 'rental' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Pending', value: 'pending' },
          { label: 'Sold', value: 'sold' },
          { label: 'Expired', value: 'expired' },
        ],
      },
      price: {
        type: 'currency',
        label: 'Price',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      price_type: {
        type: 'select',
        label: 'Price Type',
        inForm: true,
        options: [
          { label: 'Fixed', value: 'fixed' },
          { label: 'Negotiable', value: 'negotiable' },
          { label: 'Per Hour', value: 'hourly' },
          { label: 'Per Day', value: 'daily' },
        ],
      },
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Audio', value: 'audio' },
          { label: 'Lighting', value: 'lighting' },
          { label: 'Video', value: 'video' },
          { label: 'Staging', value: 'staging' },
          { label: 'Other', value: 'other' },
        ],
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      seller_id: {
        type: 'relation',
        label: 'Seller',
        inTable: true,
        inDetail: true,
      },
      featured_image: {
        type: 'image',
        label: 'Image',
        inForm: true,
      },
      view_count: {
        type: 'number',
        label: 'Views',
        inTable: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Untitled Listing',
    subtitle: (record) => record.listing_type || '',
    badge: (record) => {
      if (record.status === 'active') return { label: 'Active', variant: 'success' };
      if (record.status === 'sold') return { label: 'Sold', variant: 'secondary' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description', 'location'],
    placeholder: 'Search marketplace...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['listing_type', 'status', 'category'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'services', label: 'Services', query: { where: { listing_type: 'service' } } },
        { key: 'products', label: 'Products', query: { where: { listing_type: 'product' } } },
        { key: 'rentals', label: 'Rentals', query: { where: { listing_type: 'rental' } } },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'seller', label: 'Seller', content: { type: 'related', entity: 'users', foreignKey: 'seller_id' } },
      ],
      overview: {
        stats: [
          { key: 'price', label: 'Price', value: { type: 'field', field: 'price' }, format: 'currency' },
          { key: 'views', label: 'Views', value: { type: 'field', field: 'view_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'description', title: 'Description', content: { type: 'fields', fields: ['description'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['title', 'description', 'listing_type', 'category'],
        },
        {
          key: 'pricing',
          title: 'Pricing',
          fields: ['price', 'price_type'],
        },
        {
          key: 'details',
          title: 'Details',
          fields: ['location', 'featured_image', 'status'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['title', 'listing_type', 'category', 'price', 'status', 'location'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/marketplace/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Listing', variant: 'primary', handler: { type: 'navigate', path: () => '/network/marketplace/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
