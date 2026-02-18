import { defineSchema } from '../../schema-engine/defineSchema';

export const subscriberSchema = defineSchema({
  identity: {
    name: 'subscriber',
    namePlural: 'Subscribers',
    slug: 'content/subscribers',
    icon: 'Mail',
    description: 'Email subscribers and mailing list management',
  },
  data: {
    endpoint: '/api/subscribers',
    primaryKey: 'id',
    fields: {
      email: {
        type: 'email',
        label: 'Email',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      first_name: {
        type: 'text',
        label: 'First Name',
        inTable: true,
        inForm: true,
      },
      last_name: {
        type: 'text',
        label: 'Last Name',
        inTable: true,
        inForm: true,
      },
      contact_id: {
        type: 'relation',
        relation: { entity: 'contact', display: 'full_name', searchable: true },
        label: 'Contact',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Unsubscribed', value: 'unsubscribed' },
          { label: 'Bounced', value: 'bounced' },
          { label: 'Complained', value: 'complained' },
        ],
        default: 'active',
      },
      source: {
        type: 'select',
        label: 'Source',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Website Form', value: 'website' },
          { label: 'Event Registration', value: 'event' },
          { label: 'Import', value: 'import' },
          { label: 'API', value: 'api' },
          { label: 'Manual', value: 'manual' },
        ],
      },
      subscribed_at: {
        type: 'datetime',
        label: 'Subscribed At',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      unsubscribed_at: {
        type: 'datetime',
        label: 'Unsubscribed At',
        inDetail: true,
      },
      last_email_sent_at: {
        type: 'datetime',
        label: 'Last Email Sent',
        inDetail: true,
      },
      last_email_opened_at: {
        type: 'datetime',
        label: 'Last Email Opened',
        inDetail: true,
      },
      email_count: {
        type: 'number',
        label: 'Emails Sent',
        inDetail: true,
      },
      open_count: {
        type: 'number',
        label: 'Opens',
        inDetail: true,
      },
      click_count: {
        type: 'number',
        label: 'Clicks',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.email || 'New Subscriber'),
    subtitle: (r: Record<string, unknown>) => {
      const first = r.first_name || '';
      const last = r.last_name || '';
      return `${first} ${last}`.trim() || '';
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        active: 'success',
        unsubscribed: 'secondary',
        bounced: 'destructive',
        complained: 'destructive',
      };
      return { label: String(r.status || 'active'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'subscribed_at', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['email', 'first_name', 'last_name'],
    placeholder: 'Search subscribers...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['status', 'source'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'unsubscribed', label: 'Unsubscribed', query: { where: { status: 'unsubscribed' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'lists', label: 'Lists', content: { type: 'related', entity: 'subscriber_list_membership', foreignKey: 'subscriber_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'emails', label: 'Emails Sent', value: { type: 'field', field: 'email_count' }, format: 'number' },
          { key: 'opens', label: 'Opens', value: { type: 'field', field: 'open_count' }, format: 'number' },
          { key: 'clicks', label: 'Clicks', value: { type: 'field', field: 'click_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Subscriber Details', content: { type: 'fields', fields: ['email', 'first_name', 'last_name', 'status', 'source'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Subscriber Details', fields: ['email', 'first_name', 'last_name', 'contact_id'] },
        { key: 'settings', title: 'Settings', fields: ['status', 'source'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['email', 'first_name', 'last_name', 'status', 'source', 'subscribed_at'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/content/subscribers/${r.id}` } },
    ],
    bulk: [
      { key: 'export', label: 'Export', handler: { type: 'api', endpoint: '/api/subscribers/export', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'Add Subscriber', variant: 'primary', handler: { type: 'navigate', path: '/content/subscribers/new' } },
      { key: 'import', label: 'Import', handler: { type: 'modal', component: 'SubscriberImport' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'contact', foreignKey: 'contact_id', label: 'Contact' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
