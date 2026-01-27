import { defineSchema } from '../schema/defineSchema';

/**
 * SHOWCASE ENTITY SCHEMA (SSOT)
 */
export const showcaseSchema = defineSchema({
  identity: {
    name: 'Showcase',
    namePlural: 'Showcases',
    slug: 'network/showcase',
    icon: '🌟',
    description: 'Portfolio showcases and highlights',
  },

  data: {
    endpoint: '/api/showcase',
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
        inForm: true,
        inDetail: true,
      },
      showcase_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Project', value: 'project' },
          { label: 'Event', value: 'event' },
          { label: 'Achievement', value: 'achievement' },
          { label: 'Case Study', value: 'case_study' },
        ],
      },
      featured: {
        type: 'checkbox',
        label: 'Featured',
        inTable: true,
        inForm: true,
      },
      visibility: {
        type: 'select',
        label: 'Visibility',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Public', value: 'public' },
          { label: 'Private', value: 'private' },
        ],
      },
      featured_image: {
        type: 'image',
        label: 'Featured Image',
        inForm: true,
        inDetail: true,
      },
      tags: {
        type: 'multiselect',
        label: 'Tags',
        inTable: true,
        inForm: true,
        options: [],
      },
      view_count: {
        type: 'number',
        label: 'Views',
        inTable: true,
      },
      published_at: {
        type: 'datetime',
        label: 'Published Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Untitled Showcase',
    subtitle: (record) => record.showcase_type || '',
    badge: (record) => {
      if (record.featured) return { label: 'Featured', variant: 'success' };
      return { label: record.visibility || 'public', variant: 'secondary' };
    },
    defaultSort: { field: 'published_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description'],
    placeholder: 'Search showcases...',
  },

  filters: {
    quick: [
      { key: 'featured', label: 'Featured', query: { where: { featured: true } } },
    ],
    advanced: ['showcase_type', 'visibility'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'featured', label: 'Featured', query: { where: { featured: true } } },
        { key: 'public', label: 'Public', query: { where: { visibility: 'public' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'analytics', label: 'Analytics', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'views', label: 'Views', value: { type: 'field', field: 'view_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'content', title: 'Content', content: { type: 'fields', fields: ['description'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['title', 'description', 'showcase_type', 'featured', 'visibility'],
        },
        {
          key: 'media',
          title: 'Media',
          fields: ['featured_image', 'tags'],
        },
        {
          key: 'publishing',
          title: 'Publishing',
          fields: ['published_at'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['title', 'showcase_type', 'featured', 'visibility', 'view_count', 'published_at'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/showcase/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Showcase', variant: 'primary', handler: { type: 'navigate', path: () => '/network/showcase/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
