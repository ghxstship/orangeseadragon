import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * ACTIVITY FEED ENTITY SCHEMA (SSOT)
 * Activity stream events for the network feed
 */
export const activityFeedSchema = defineSchema({
  identity: {
    name: 'Activity',
    namePlural: 'Activities',
    slug: 'network/feed',
    icon: 'Activity',
    description: 'Network activity feed events',
  },

  data: {
    endpoint: '/api/activities',
    primaryKey: 'id',
    fields: {
      actor_id: {
        type: 'relation',
        label: 'Actor',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      action: {
        type: 'select',
        label: 'Action',
        required: true,
        inTable: true,
        options: [
          { label: 'Created', value: 'created' },
          { label: 'Updated', value: 'updated' },
          { label: 'Joined', value: 'joined' },
          { label: 'Completed', value: 'completed' },
          { label: 'Commented', value: 'commented' },
          { label: 'Reacted', value: 'reacted' },
          { label: 'Connected', value: 'connected' },
          { label: 'Shared', value: 'shared' },
          { label: 'Mentioned', value: 'mentioned' },
          { label: 'Achieved', value: 'achieved' },
        ],
      },
      target_type: {
        type: 'select',
        label: 'Target Type',
        required: true,
        inTable: true,
        options: [
          { label: 'Discussion', value: 'discussion' },
          { label: 'Challenge', value: 'challenge' },
          { label: 'Showcase', value: 'showcase' },
          { label: 'Opportunity', value: 'opportunity' },
          { label: 'Connection', value: 'connection' },
          { label: 'Marketplace', value: 'marketplace' },
          { label: 'Profile', value: 'profile' },
          { label: 'Badge', value: 'badge' },
        ],
      },
      target_id: {
        type: 'text',
        label: 'Target ID',
        required: true,
      },
      target_title: {
        type: 'text',
        label: 'Target Title',
        inTable: true,
        inDetail: true,
      },
      target_url: {
        type: 'url',
        label: 'Target URL',
      },
      metadata: {
        type: 'json',
        label: 'Metadata',
        inDetail: true,
      },
      visibility: {
        type: 'select',
        label: 'Visibility',
        default: 'connections',
        options: [
          { label: 'Public', value: 'public' },
          { label: 'Connections', value: 'connections' },
          { label: 'Private', value: 'private' },
        ],
      },
      reaction_count: {
        type: 'number',
        label: 'Reactions',
        inTable: true,
        default: 0,
      },
      comment_count: {
        type: 'number',
        label: 'Comments',
        inTable: true,
        default: 0,
      },
    },
  },

  display: {
    title: (record) => {
      const actions: Record<string, string> = {
        created: 'created',
        updated: 'updated',
        joined: 'joined',
        completed: 'completed',
        commented: 'commented on',
        reacted: 'reacted to',
        connected: 'connected with',
        shared: 'shared',
        mentioned: 'mentioned',
        achieved: 'earned',
      };
      return `${actions[record.action] || record.action} ${record.target_title || record.target_type}`;
    },
    subtitle: (record) => record.target_type || '',
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['target_title'],
    placeholder: 'Search activities...',
  },

  filters: {
    quick: [],
    advanced: ['action', 'target_type'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'discussions', label: 'Discussions', query: { where: { target_type: 'discussion' } } },
        { key: 'challenges', label: 'Challenges', query: { where: { target_type: 'challenge' } } },
        { key: 'connections', label: 'Connections', query: { where: { target_type: 'connection' } } },
      ],
      defaultView: 'list',
      availableViews: ['list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'reactions', label: 'Reactions', value: { type: 'field', field: 'reaction_count' }, format: 'number' },
          { key: 'comments', label: 'Comments', value: { type: 'field', field: 'comment_count' }, format: 'number' },
        ],
        blocks: [],
      },
    },
    form: {
      sections: [
        {
          key: 'activity',
          title: 'Activity',
          fields: ['action', 'target_type', 'target_id', 'target_title'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['actor_id', 'action', 'target_type', 'target_title', 'reaction_count'],
    },
    list: {
      titleField: 'target_title',
      subtitleField: 'action',
      avatarField: 'actor_id',
      metaFields: ['created_at'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => record.target_url || '#' } },
    ],
    bulk: [],
    global: [],
  },

  permissions: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
});
