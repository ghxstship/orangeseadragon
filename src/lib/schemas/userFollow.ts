import { defineSchema } from '../schema/defineSchema';

/**
 * USER FOLLOW ENTITY SCHEMA (SSOT)
 * Following relationships for users, discussions, and challenges
 */
export const userFollowSchema = defineSchema({
  identity: {
    name: 'Follow',
    namePlural: 'Follows',
    slug: 'network/follows',
    icon: 'UserPlus',
    description: 'Following relationships in the network',
  },

  data: {
    endpoint: '/api/user_follows',
    primaryKey: 'id',
    fields: {
      follower_id: {
        type: 'relation',
        label: 'Follower',
        required: true,
        inTable: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      following_id: {
        type: 'text',
        label: 'Following ID',
        required: true,
        inTable: true,
      },
      following_type: {
        type: 'select',
        label: 'Following Type',
        required: true,
        inTable: true,
        options: [
          { label: 'User', value: 'user' },
          { label: 'Discussion', value: 'discussion' },
          { label: 'Challenge', value: 'challenge' },
          { label: 'Showcase', value: 'showcase' },
        ],
      },
      notify_on_update: {
        type: 'switch',
        label: 'Notify on Updates',
        default: true,
        inForm: true,
      },
    },
  },

  display: {
    title: (record) => `Following ${record.following_type}`,
    subtitle: (record) => record.following_id || '',
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: false,
    fields: [],
    placeholder: '',
  },

  filters: {
    quick: [],
    advanced: ['following_type'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'users', label: 'Users', query: { where: { following_type: 'user' } } },
        { key: 'discussions', label: 'Discussions', query: { where: { following_type: 'discussion' } } },
        { key: 'challenges', label: 'Challenges', query: { where: { following_type: 'challenge' } } },
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
          key: 'follow',
          title: 'Follow Settings',
          fields: ['notify_on_update'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'follower_id', format: { type: 'relation', entityType: 'person' } },
        'following_type',
        { field: 'following_id', format: { type: 'relation', entityType: 'person' } },
        { field: 'notify_on_update', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'unfollow', label: 'Unfollow', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
