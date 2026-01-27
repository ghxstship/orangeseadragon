import { defineSchema } from '../schema/defineSchema';

/**
 * DISCUSSION ENTITY SCHEMA (SSOT)
 */
export const discussionSchema = defineSchema({
  identity: {
    name: 'Discussion',
    namePlural: 'Discussions',
    slug: 'network/discussions',
    icon: '💬',
    description: 'Community discussions and forums',
  },

  data: {
    endpoint: '/api/discussions',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        placeholder: 'Enter discussion title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      content: {
        type: 'richtext',
        label: 'Content',
        required: true,
        inForm: true,
        inDetail: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'General', value: 'general' },
          { label: 'Questions', value: 'questions' },
          { label: 'Ideas', value: 'ideas' },
          { label: 'Announcements', value: 'announcements' },
          { label: 'Events', value: 'events' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Open', value: 'open' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Closed', value: 'closed' },
        ],
      },
      is_pinned: {
        type: 'switch',
        label: 'Pinned',
        inTable: true,
        inForm: true,
      },
      author_id: {
        type: 'relation',
        label: 'Author',
        inTable: true,
        inDetail: true,
      },
      reply_count: {
        type: 'number',
        label: 'Replies',
        inTable: true,
      },
      view_count: {
        type: 'number',
        label: 'Views',
        inTable: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Untitled Discussion',
    subtitle: (record) => record.category || '',
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'content'],
    placeholder: 'Search discussions...',
  },

  filters: {
    quick: [
      { key: 'open', label: 'Open', query: { where: { status: 'open' } } },
    ],
    advanced: ['category', 'status', 'is_pinned'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'pinned', label: 'Pinned', query: { where: { is_pinned: true } } },
        { key: 'questions', label: 'Questions', query: { where: { category: 'questions' } } },
        { key: 'announcements', label: 'Announcements', query: { where: { category: 'announcements' } } },
      ],
      defaultView: 'list',
      availableViews: ['list', 'table'],
    },
    detail: {
      tabs: [
        { key: 'discussion', label: 'Discussion', content: { type: 'overview' } },
        { key: 'replies', label: 'Replies', content: { type: 'related', entity: 'replies', foreignKey: 'discussion_id' } },
      ],
      overview: {
        stats: [
          { key: 'replies', label: 'Replies', value: { type: 'field', field: 'reply_count' }, format: 'number' },
          { key: 'views', label: 'Views', value: { type: 'field', field: 'view_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'content', title: 'Content', content: { type: 'fields', fields: ['content'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Discussion',
          fields: ['title', 'category', 'content'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['status', 'is_pinned'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['title', 'category', 'status', 'reply_count', 'view_count'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/discussions/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Discussion', variant: 'primary', handler: { type: 'navigate', path: () => '/network/discussions/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
