import { defineSchema } from '../schema/defineSchema';

/**
 * INBOX ITEM ENTITY SCHEMA (SSOT)
 * 
 * Unified inbox for approvals, mentions, alerts, and assignments
 * across all entities (tasks, documents, workflows, etc.)
 */
export const inboxItemSchema = defineSchema({
  identity: {
    name: 'Inbox Item',
    namePlural: 'Inbox',
    slug: 'core/inbox',
    icon: 'Inbox',
    description: 'Notifications, approvals, and action items',
  },

  data: {
    endpoint: '/api/inbox',
    primaryKey: 'id',
    fields: {
      type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: false,
        options: [
          { label: 'Approval', value: 'approval' },
          { label: 'Mention', value: 'mention' },
          { label: 'Alert', value: 'alert' },
          { label: 'Assignment', value: 'assignment' },
          { label: 'Comment', value: 'comment' },
          { label: 'Update', value: 'update' },
        ],
      },
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inDetail: true,
        searchable: true,
      },
      body: {
        type: 'textarea',
        label: 'Message',
        inDetail: true,
      },
      source_entity: {
        type: 'select',
        label: 'Source Entity',
        inTable: true,
        options: [
          { label: 'Task', value: 'task' },
          { label: 'Document', value: 'document' },
          { label: 'Workflow Run', value: 'workflow_run' },
          { label: 'Calendar Event', value: 'calendar_event' },
          { label: 'Comment', value: 'comment' },
          { label: 'Production', value: 'production' },
        ],
      },
      source_id: {
        type: 'text',
        label: 'Source ID',
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Unread', value: 'unread' },
          { label: 'Read', value: 'read' },
          { label: 'Actioned', value: 'actioned' },
          { label: 'Dismissed', value: 'dismissed' },
        ],
      },
      priority: {
        type: 'select',
        label: 'Priority',
        inTable: true,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' },
          { label: 'Urgent', value: 'urgent' },
        ],
      },
      due_at: {
        type: 'datetime',
        label: 'Due At',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      actioned_at: {
        type: 'datetime',
        label: 'Actioned At',
        inDetail: true,
      },
      action_type: {
        type: 'select',
        label: 'Action Type',
        inDetail: true,
        options: [
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Acknowledged', value: 'acknowledged' },
        ],
      },
      from_user_id: {
        type: 'relation',
        label: 'From',
        inTable: true,
        inDetail: true,
      },
      user_id: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Recipient',
        inForm: false,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Notification',
    subtitle: (record) => record.source_entity || '',
    badge: (record) => {
      if (record.type === 'approval') return { label: 'Approval', variant: 'warning' };
      if (record.type === 'mention') return { label: 'Mention', variant: 'default' };
      if (record.type === 'alert') return { label: 'Alert', variant: 'destructive' };
      if (record.type === 'assignment') return { label: 'Assignment', variant: 'success' };
      return undefined;
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'body'],
    placeholder: 'Search inbox...',
  },

  filters: {
    quick: [
      { key: 'unread', label: 'Unread', query: { where: { status: 'unread' } } },
      { key: 'approvals', label: 'Approvals', query: { where: { type: 'approval' } } },
    ],
    advanced: ['type', 'status', 'priority', 'source_entity'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'unread', label: 'Unread', query: { where: { status: 'unread' } }, count: true },
        { key: 'approvals', label: 'Approvals', query: { where: { type: 'approval' } }, count: true },
        { key: 'mentions', label: 'Mentions', query: { where: { type: 'mention' } }, count: true },
        { key: 'alerts', label: 'Alerts', query: { where: { type: 'alert' } }, count: true },
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
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['body', 'source_entity', 'due_at'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Inbox Item',
          fields: ['status'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'title', 'type',
        { field: 'status', format: { type: 'badge', colorMap: { unread: '#3b82f6', read: '#6b7280', actioned: '#22c55e', archived: '#6b7280' } } },
        { field: 'priority', format: { type: 'badge', colorMap: { urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', none: '#6b7280' } } },
        { field: 'due_at', format: { type: 'datetime' } },
        { field: 'from_user_id', format: { type: 'relation', entityType: 'person' } },
      ],
    },
    list: {
      titleField: 'title',
      subtitleField: 'body',
      metaFields: ['type', 'due_at'],
      showChevron: true,
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/inbox/${record.id}` } },
      { key: 'mark-read', label: 'Mark Read', handler: { type: 'function', fn: () => {} } },
      { key: 'dismiss', label: 'Dismiss', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'mark-read', label: 'Mark Read', handler: { type: 'function', fn: () => {} } },
      { key: 'dismiss', label: 'Dismiss', handler: { type: 'function', fn: () => {} } },
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
    delete: false,
  }
});
