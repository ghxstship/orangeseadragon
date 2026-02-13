import { defineSchema } from '../schema/defineSchema';

/**
 * MESSAGE ENTITY SCHEMA (SSOT)
 * Real-time messaging between network connections
 */
export const messageSchema = defineSchema({
  identity: {
    name: 'Message',
    namePlural: 'Messages',
    slug: 'network/messages',
    icon: 'MessageCircle',
    description: 'Direct messages between network connections',
  },

  data: {
    endpoint: '/api/messages',
    primaryKey: 'id',
    fields: {
      conversation_id: {
        type: 'relation',
        label: 'Conversation',
        required: true,
        relation: {
          entity: 'conversation',
          display: 'id',
        },
      },
      sender_id: {
        type: 'relation',
        label: 'Sender',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      content: {
        type: 'textarea',
        label: 'Content',
        required: true,
        inTable: true,
        inDetail: true,
        maxLength: 5000,
      },
      message_type: {
        type: 'select',
        label: 'Type',
        required: true,
        default: 'text',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Image', value: 'image' },
          { label: 'File', value: 'file' },
          { label: 'System', value: 'system' },
        ],
      },
      attachments: {
        type: 'json',
        label: 'Attachments',
        inDetail: true,
      },
      read_at: {
        type: 'datetime',
        label: 'Read At',
        inTable: true,
      },
      edited_at: {
        type: 'datetime',
        label: 'Edited At',
      },
      deleted_at: {
        type: 'datetime',
        label: 'Deleted At',
      },
    },
  },

  display: {
    title: (record) => record.content?.substring(0, 50) || 'Message',
    subtitle: (record) => record.sender_id || '',
    defaultSort: { field: 'created_at', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['content'],
    placeholder: 'Search messages...',
  },

  filters: {
    quick: [],
    advanced: ['message_type'],
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
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'content', title: 'Message', content: { type: 'fields', fields: ['content'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'message',
          title: 'Message',
          fields: ['content', 'message_type'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'content',
        { field: 'sender_id', format: { type: 'relation', entityType: 'person' } },
        'message_type',
        { field: 'read_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [],
    bulk: [],
    global: [],
  },
  relationships: {
    belongsTo: [
      { entity: 'conversation', foreignKey: 'conversation_id', label: 'Conversation' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
