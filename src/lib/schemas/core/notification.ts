import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * NOTIFICATION ENTITY SCHEMA (SSOT)
 */
export const notificationSchema = defineSchema({
  identity: {
    name: 'Notification',
    namePlural: 'Notifications',
    slug: 'core/inbox/notifications',
    icon: 'Bell',
    description: 'System notifications and alerts',
  },

  data: {
    endpoint: '/api/notifications',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inDetail: true,
        searchable: true,
      },
      message: {
        type: 'textarea',
        label: 'Message',
        inTable: true,
        inDetail: true,
      },
      type: {
        type: 'select',
        label: 'Type',
        inTable: true,
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
      },
      is_read: {
        type: 'switch',
        label: 'Read',
        inTable: true,
      },
      entity_type: {
        type: 'text',
        label: 'Entity Type',
        inDetail: true,
      },
      entity_id: {
        type: 'text',
        label: 'Entity ID',
        inDetail: true,
      },
      action_url: {
        type: 'url',
        label: 'Action URL',
        inDetail: true,
      },
      user_id: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'User',
        inTable: true,
      },
      created_at: {
        type: 'datetime',
        label: 'Created',
        inTable: true,
        sortable: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Notification',
    subtitle: (record) => record.message?.substring(0, 50) || '',
    badge: (record) => {
      if (!record.is_read) return { label: 'Unread', variant: 'default' };
      return undefined;
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'message'],
    placeholder: 'Search notifications...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'unread', label: 'Unread', query: { where: { is_read: false } } },
      { key: 'read', label: 'Read', query: { where: { is_read: true } } },
    ],
    advanced: ['type', 'is_read'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'unread', label: 'Unread', query: { where: { is_read: false } } },
      ],
      defaultView: 'list',
      availableViews: ['list', 'table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Notification Details', content: { type: 'fields', fields: ['message', 'type', 'entity_type'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Notification Details',
          fields: ['title', 'message', 'type'],
        },
      ]
    }
  },

  views: {
    table: {
      columns: [
        'title',
        'type',
        { field: 'is_read', format: { type: 'boolean' } },
        { field: 'created_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/inbox/notifications/${record.id}` } },
      { key: 'mark-read', label: 'Mark as Read', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'mark-all-read', label: 'Mark All Read', handler: { type: 'function', fn: () => {} } },
    ],
    global: []
  },
  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'user_id', label: 'User' },
    ],
  },



  permissions: {
    create: false,
    read: true,
    update: true,
    delete: true,
  }
});
