import { defineSchema } from '../schema/defineSchema';

/**
 * BRAND ASSET ENTITY SCHEMA (SSOT)
 */
export const brandAssetSchema = defineSchema({
  identity: {
    name: 'Brand Asset',
    namePlural: 'Brand Assets',
    slug: 'business/brand/assets',
    icon: 'Image',
    description: 'Brand images and media assets',
  },

  data: {
    endpoint: '/api/brand-assets',
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
      asset_type: {
        type: 'select',
        label: 'Asset Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Image', value: 'image' },
          { label: 'Video', value: 'video' },
          { label: 'Icon', value: 'icon' },
          { label: 'Illustration', value: 'illustration' },
          { label: 'Pattern', value: 'pattern' },
          { label: 'Document', value: 'document' },
        ],
      },
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Marketing', value: 'marketing' },
          { label: 'Social Media', value: 'social_media' },
          { label: 'Print', value: 'print' },
          { label: 'Web', value: 'web' },
          { label: 'Presentation', value: 'presentation' },
        ],
      },
      file_url: {
        type: 'file',
        label: 'File',
        required: true,
        inForm: true,
        inDetail: true,
      },
      thumbnail_url: {
        type: 'file',
        label: 'Thumbnail',
        inDetail: true,
      },
      file_size: {
        type: 'number',
        label: 'File Size (KB)',
        inTable: true,
      },
      dimensions: {
        type: 'text',
        label: 'Dimensions',
        inTable: true,
        inDetail: true,
      },
      tags: {
        type: 'text',
        label: 'Tags',
        inForm: true,
        searchable: true,
      },
      usage_rights: {
        type: 'textarea',
        label: 'Usage Rights',
        inForm: true,
        inDetail: true,
      },
      is_approved: {
        type: 'switch',
        label: 'Approved',
        inTable: true,
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Brand Asset',
    subtitle: (record) => record.asset_type || '',
    badge: (record) => {
      if (record.is_approved) return { label: 'Approved', variant: 'success' };
      return { label: 'Pending', variant: 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'tags'],
    placeholder: 'Search assets...',
  },

  filters: {
    quick: [
      { key: 'approved', label: 'Approved', query: { where: { is_approved: true } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['asset_type', 'category', 'is_approved'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Assets', query: { where: {} } },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table'],
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
          title: 'Asset Details',
          fields: ['name', 'asset_type', 'category', 'tags'],
        },
        {
          key: 'file',
          title: 'File',
          fields: ['file_url'],
        },
        {
          key: 'metadata',
          title: 'Metadata',
          fields: ['usage_rights', 'is_approved'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'asset_type', 'category', 'dimensions', 'is_approved'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/brand/assets/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/business/brand/assets/${record.id}/edit` } },
      { key: 'download', label: 'Download', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Upload Asset', variant: 'primary', handler: { type: 'navigate', path: () => '/business/brand/assets/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
