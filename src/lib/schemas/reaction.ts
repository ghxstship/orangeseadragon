import { defineSchema } from '../schema/defineSchema';

/**
 * REACTION ENTITY SCHEMA (SSOT)
 * Emoji reactions on discussions, replies, showcases, and other content
 */
export const reactionSchema = defineSchema({
  identity: {
    name: 'Reaction',
    namePlural: 'Reactions',
    slug: 'network/reactions',
    icon: 'Heart',
    description: 'Emoji reactions on content',
  },

  data: {
    endpoint: '/api/reactions',
    primaryKey: 'id',
    fields: {
      user_id: {
        type: 'relation',
        label: 'User',
        required: true,
        inTable: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      target_type: {
        type: 'select',
        label: 'Target Type',
        required: true,
        inTable: true,
        options: [
          { label: 'Discussion', value: 'discussion' },
          { label: 'Reply', value: 'reply' },
          { label: 'Showcase', value: 'showcase' },
          { label: 'Challenge', value: 'challenge' },
          { label: 'Message', value: 'message' },
          { label: 'Activity', value: 'activity' },
        ],
      },
      target_id: {
        type: 'text',
        label: 'Target ID',
        required: true,
        inTable: true,
      },
      emoji: {
        type: 'text',
        label: 'Emoji',
        required: true,
        inTable: true,
        inDetail: true,
        maxLength: 10,
      },
    },
  },

  display: {
    title: (record) => record.emoji || '👍',
    subtitle: (record) => record.target_type || '',
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: false,
    fields: [],
    placeholder: '',
  },

  filters: {
    quick: [],
    advanced: ['target_type', 'emoji'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
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
        blocks: [],
      },
    },
    form: {
      sections: [
        {
          key: 'reaction',
          title: 'Reaction',
          fields: ['emoji', 'target_type', 'target_id'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['emoji', 'target_type', 'user_id'],
    },
  },

  actions: {
    row: [],
    bulk: [],
    global: [],
  },

  permissions: {
    create: true,
    read: true,
    update: false,
    delete: true,
  },
});
