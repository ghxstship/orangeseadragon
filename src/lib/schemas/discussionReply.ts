import { defineSchema } from '../schema/defineSchema';

/**
 * DISCUSSION REPLY ENTITY SCHEMA (SSOT)
 * Threaded replies to discussions
 */
export const discussionReplySchema = defineSchema({
  identity: {
    name: 'Reply',
    namePlural: 'Replies',
    slug: 'network/replies',
    icon: 'Reply',
    description: 'Replies to network discussions',
  },

  data: {
    endpoint: '/api/discussion_replies',
    primaryKey: 'id',
    fields: {
      discussion_id: {
        type: 'relation',
        label: 'Discussion',
        required: true,
        inTable: true,
        relation: {
          entity: 'discussion',
          display: 'title',
        },
      },
      parent_reply_id: {
        type: 'relation',
        label: 'Parent Reply',
        inDetail: true,
        relation: {
          entity: 'discussionReply',
          display: 'id',
        },
      },
      author_id: {
        type: 'relation',
        label: 'Author',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      content: {
        type: 'richtext',
        label: 'Content',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      is_best_answer: {
        type: 'switch',
        label: 'Best Answer',
        inTable: true,
        inForm: true,
        default: false,
      },
      reply_count: {
        type: 'number',
        label: 'Replies',
        inTable: true,
        default: 0,
      },
      reaction_count: {
        type: 'number',
        label: 'Reactions',
        inTable: true,
        default: 0,
      },
      is_edited: {
        type: 'switch',
        label: 'Edited',
        inDetail: true,
        default: false,
      },
      edited_at: {
        type: 'datetime',
        label: 'Edited At',
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.content?.substring(0, 100) || 'Reply',
    subtitle: (record) => record.author_id || '',
    badge: (record) => {
      if (record.is_best_answer) return { label: 'Best Answer', variant: 'success' };
      return undefined;
    },
    defaultSort: { field: 'created_at', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['content'],
    placeholder: 'Search replies...',
  },

  filters: {
    quick: [
      { key: 'best', label: 'Best Answers', query: { where: { is_best_answer: true } } },
    ],
    advanced: ['is_best_answer'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
      ],
      defaultView: 'list',
      availableViews: ['list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'replies', label: 'Replies', content: { type: 'related', entity: 'discussionReply', foreignKey: 'parent_reply_id' } },
      ],
      overview: {
        stats: [
          { key: 'reactions', label: 'Reactions', value: { type: 'field', field: 'reaction_count' }, format: 'number' },
          { key: 'replies', label: 'Replies', value: { type: 'field', field: 'reply_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'content', title: 'Content', content: { type: 'fields', fields: ['content'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'reply',
          title: 'Reply',
          fields: ['content'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['is_best_answer'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['content', 'author_id', 'is_best_answer', 'reaction_count', 'reply_count'],
    },
  },

  actions: {
    row: [
      { key: 'reply', label: 'Reply', handler: { type: 'function', fn: () => {} } },
      { key: 'mark-best', label: 'Mark as Best', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [],
  },
  relationships: {
    belongsTo: [
      { entity: 'discussion', foreignKey: 'discussion_id', label: 'Discussion' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
