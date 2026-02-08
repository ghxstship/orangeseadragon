import { defineSchema } from '../schema/defineSchema';

/**
 * CONVERSATION ENTITY SCHEMA (SSOT)
 * Message thread containers for direct and group messaging
 */
export const conversationSchema = defineSchema({
  identity: {
    name: 'Conversation',
    namePlural: 'Conversations',
    slug: 'network/conversations',
    icon: 'MessagesSquare',
    description: 'Message conversations between network members',
  },

  data: {
    endpoint: '/api/conversations',
    primaryKey: 'id',
    fields: {
      type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        default: 'direct',
        options: [
          { label: 'Direct', value: 'direct' },
          { label: 'Group', value: 'group' },
        ],
      },
      name: {
        type: 'text',
        label: 'Name',
        placeholder: 'Group name (optional for direct messages)',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      participant_ids: {
        type: 'json',
        label: 'Participants',
        required: true,
        inDetail: true,
      },
      last_message_at: {
        type: 'datetime',
        label: 'Last Message',
        inTable: true,
        sortable: true,
      },
      last_message_preview: {
        type: 'text',
        label: 'Last Message Preview',
        inTable: true,
      },
      unread_count: {
        type: 'number',
        label: 'Unread',
        inTable: true,
      },
      is_muted: {
        type: 'switch',
        label: 'Muted',
        inForm: true,
        default: false,
      },
      is_archived: {
        type: 'switch',
        label: 'Archived',
        inForm: true,
        default: false,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Direct Message',
    subtitle: (record) => record.last_message_preview?.substring(0, 50) || '',
    badge: (record) => {
      if (record.unread_count > 0) {
        return { label: String(record.unread_count), variant: 'primary' };
      }
      return undefined;
    },
    defaultSort: { field: 'last_message_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search conversations...',
  },

  filters: {
    quick: [
      { key: 'unread', label: 'Unread', query: { where: { unread_count: { gt: 0 } } } },
    ],
    advanced: ['type', 'is_archived'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: { is_archived: false } } },
        { key: 'unread', label: 'Unread', query: { where: { unread_count: { gt: 0 } } } },
        { key: 'archived', label: 'Archived', query: { where: { is_archived: true } } },
      ],
      defaultView: 'list',
      availableViews: ['list'],
    },
    detail: {
      tabs: [
        { key: 'messages', label: 'Messages', content: { type: 'related', entity: 'messages', foreignKey: 'conversation_id' } },
      ],
      overview: {
        stats: [
          { key: 'unread', label: 'Unread', value: { type: 'field', field: 'unread_count' }, format: 'number' },
        ],
        blocks: [],
      },
    },
    form: {
      sections: [
        {
          key: 'settings',
          title: 'Settings',
          fields: ['name', 'is_muted', 'is_archived'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'type', 'last_message_preview', 'last_message_at', 'unread_count'],
    },
    list: {
      titleField: 'name',
      subtitleField: 'last_message_preview',
      badgeField: 'unread_count',
      metaFields: ['last_message_at'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'Open', handler: { type: 'navigate', path: (record) => `/network/messages/${record.id}` } },
      { key: 'archive', label: 'Archive', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'new', label: 'New Message', variant: 'primary', handler: { type: 'navigate', path: () => '/network/messages/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
