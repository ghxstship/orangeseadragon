import { defineSchema } from '../schema/defineSchema';

/**
 * USER POINTS ENTITY SCHEMA (SSOT)
 * Gamification points tracking
 */
export const userPointsSchema = defineSchema({
  identity: {
    name: 'Points',
    namePlural: 'Points',
    slug: 'network/points',
    icon: 'Coins',
    description: 'User gamification points',
  },

  data: {
    endpoint: '/api/user_points',
    primaryKey: 'id',
    fields: {
      user_id: {
        type: 'relation',
        label: 'User',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      points: {
        type: 'number',
        label: 'Current Points',
        inTable: true,
        inDetail: true,
        default: 0,
      },
      lifetime_points: {
        type: 'number',
        label: 'Lifetime Points',
        inTable: true,
        inDetail: true,
        default: 0,
      },
      level: {
        type: 'number',
        label: 'Level',
        inTable: true,
        inDetail: true,
        default: 1,
      },
      level_progress: {
        type: 'percentage',
        label: 'Level Progress',
        inTable: true,
        default: 0,
      },
    },
  },

  display: {
    title: (record) => `Level ${record.level || 1}`,
    subtitle: (record) => `${record.points || 0} points`,
    defaultSort: { field: 'lifetime_points', direction: 'desc' },
  },

  search: {
    enabled: false,
    fields: [],
    placeholder: '',
  },

  filters: {
    quick: [],
    advanced: ['level'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'leaderboard', label: 'Leaderboard', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'badges', label: 'Badges', content: { type: 'related', entity: 'userBadge', foreignKey: 'user_id' } },
      ],
      overview: {
        stats: [
          { key: 'points', label: 'Points', value: { type: 'field', field: 'points' }, format: 'number' },
          { key: 'level', label: 'Level', value: { type: 'field', field: 'level' }, format: 'number' },
          { key: 'lifetime', label: 'Lifetime', value: { type: 'field', field: 'lifetime_points' }, format: 'number' },
        ],
        blocks: [],
      },
    },
    form: {
      sections: [
        {
          key: 'points',
          title: 'Points',
          fields: ['points', 'level'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'user_id', format: { type: 'relation', entityType: 'person' } },
        { field: 'level', format: { type: 'number' } },
        { field: 'points', format: { type: 'number' } },
        { field: 'lifetime_points', format: { type: 'number' } },
      ],
    },
  },

  actions: {
    row: [],
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

/**
 * BADGE ENTITY SCHEMA (SSOT)
 * Achievement badge definitions
 */
export const badgeSchema = defineSchema({
  identity: {
    name: 'Badge',
    namePlural: 'Badges',
    slug: 'network/badges',
    icon: 'Award',
    description: 'Achievement badges',
  },

  data: {
    endpoint: '/api/badges',
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
        required: true,
        inForm: true,
        inDetail: true,
      },
      icon: {
        type: 'text',
        label: 'Icon',
        required: true,
        inTable: true,
        inForm: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Engagement', value: 'engagement', color: 'blue' },
          { label: 'Expertise', value: 'expertise', color: 'purple' },
          { label: 'Community', value: 'community', color: 'green' },
          { label: 'Achievement', value: 'achievement', color: 'yellow' },
          { label: 'Special', value: 'special', color: 'red' },
        ],
      },
      criteria: {
        type: 'json',
        label: 'Criteria',
        required: true,
        inForm: true,
        inDetail: true,
      },
      points_value: {
        type: 'number',
        label: 'Points Value',
        inTable: true,
        inForm: true,
        default: 10,
      },
      rarity: {
        type: 'select',
        label: 'Rarity',
        inTable: true,
        inForm: true,
        default: 'common',
        options: [
          { label: 'Common', value: 'common', color: 'gray' },
          { label: 'Uncommon', value: 'uncommon', color: 'green' },
          { label: 'Rare', value: 'rare', color: 'blue' },
          { label: 'Epic', value: 'epic', color: 'purple' },
          { label: 'Legendary', value: 'legendary', color: 'yellow' },
        ],
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Badge',
    subtitle: (record) => record.category || '',
    badge: (record) => {
      const rarityColors: Record<string, string> = {
        common: 'secondary',
        uncommon: 'success',
        rare: 'primary',
        epic: 'warning',
        legendary: 'destructive',
      };
      return { label: record.rarity, variant: rarityColors[record.rarity] || 'secondary' };
    },
    defaultSort: { field: 'category', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search badges...',
  },

  filters: {
    quick: [],
    advanced: ['category', 'rarity', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'engagement', label: 'Engagement', query: { where: { category: 'engagement' } } },
        { key: 'expertise', label: 'Expertise', query: { where: { category: 'expertise' } } },
        { key: 'community', label: 'Community', query: { where: { category: 'community' } } },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'holders', label: 'Badge Holders', content: { type: 'related', entity: 'userBadge', foreignKey: 'badge_id' } },
      ],
      overview: {
        stats: [
          { key: 'points', label: 'Points', value: { type: 'field', field: 'points_value' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'criteria'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'badge',
          title: 'Badge',
          fields: ['name', 'description', 'icon', 'category'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['criteria', 'points_value', 'rarity', 'is_active'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name', 'category',
        { field: 'rarity', format: { type: 'badge', colorMap: { common: '#6b7280', uncommon: '#22c55e', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' } } },
        { field: 'points_value', format: { type: 'number' } },
        { field: 'is_active', format: { type: 'boolean' } },
      ],
    },
    grid: {
      titleField: 'name',
      subtitleField: 'category',
      imageField: 'icon',
      cardFields: ['rarity', 'points_value'],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/network/badges/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Badge', variant: 'primary', handler: { type: 'navigate', path: () => '/network/badges/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

/**
 * USER BADGE ENTITY SCHEMA (SSOT)
 * Earned badges by users
 */
export const userBadgeSchema = defineSchema({
  identity: {
    name: 'Earned Badge',
    namePlural: 'Earned Badges',
    slug: 'network/user-badges',
    icon: 'Medal',
    description: 'Badges earned by users',
  },

  data: {
    endpoint: '/api/user_badges',
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
      badge_id: {
        type: 'relation',
        label: 'Badge',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'badge',
          display: 'name',
        },
      },
      earned_at: {
        type: 'datetime',
        label: 'Earned At',
        inTable: true,
        sortable: true,
      },
      is_featured: {
        type: 'switch',
        label: 'Featured',
        inTable: true,
        inForm: true,
        default: false,
      },
    },
  },

  display: {
    title: (record) => record.badge_id || 'Badge',
    subtitle: (record) => record.earned_at ? `Earned: ${record.earned_at}` : '',
    defaultSort: { field: 'earned_at', direction: 'desc' },
  },

  search: {
    enabled: false,
    fields: [],
    placeholder: '',
  },

  filters: {
    quick: [],
    advanced: ['is_featured'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'featured', label: 'Featured', query: { where: { is_featured: true } } },
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
        blocks: [],
      },
    },
    form: {
      sections: [
        {
          key: 'settings',
          title: 'Settings',
          fields: ['is_featured'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'user_id', format: { type: 'relation', entityType: 'person' } },
        { field: 'badge_id', format: { type: 'relation', entityType: 'badge' } },
        { field: 'earned_at', format: { type: 'datetime' } },
        { field: 'is_featured', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'feature', label: 'Toggle Featured', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [],
  },

  permissions: {
    create: false,
    read: true,
    update: true,
    delete: false,
  },
});
