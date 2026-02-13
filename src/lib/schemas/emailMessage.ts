import { defineSchema } from '../schema/defineSchema';

/**
 * EMAIL MESSAGE ENTITY SCHEMA (SSOT)
 * Synced and sent emails with CRM associations
 */
export const emailMessageSchema = defineSchema({
  identity: {
    name: 'Email',
    namePlural: 'Emails',
    slug: 'business/emails',
    icon: 'Mail',
    description: 'Email messages synced from connected accounts',
  },

  data: {
    endpoint: '/api/emails',
    primaryKey: 'id',
    fields: {
      subject: {
        type: 'text',
        label: 'Subject',
        inTable: true,
        inDetail: true,
        searchable: true,
      },
      direction: {
        type: 'select',
        label: 'Direction',
        inTable: true,
        options: [
          { label: 'Sent', value: 'outbound' },
          { label: 'Received', value: 'inbound' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Queued', value: 'queued' },
          { label: 'Sending', value: 'sending' },
          { label: 'Sent', value: 'sent' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Failed', value: 'failed' },
          { label: 'Bounced', value: 'bounced' },
        ],
      },
      from_address: {
        type: 'email',
        label: 'From',
        inTable: true,
        inDetail: true,
      },
      to_addresses: {
        type: 'json',
        label: 'To',
        inDetail: true,
      },
      cc_addresses: {
        type: 'json',
        label: 'CC',
        inDetail: true,
      },
      body_html: {
        type: 'richtext',
        label: 'Content',
        inForm: true,
        inDetail: true,
      },
      body_text: {
        type: 'textarea',
        label: 'Plain Text',
        inDetail: true,
      },
      snippet: {
        type: 'text',
        label: 'Preview',
        inTable: true,
      },
      sent_at: {
        type: 'datetime',
        label: 'Sent',
        inTable: true,
        sortable: true,
      },
      contact_id: {
        type: 'relation',
        label: 'Contact',
        inTable: true,
        inForm: true,
      },
      company_id: {
        type: 'relation',
        label: 'Company',
        inForm: true,
      },
      deal_id: {
        type: 'relation',
        relation: { entity: 'deal', display: 'name' },
        label: 'Deal',
        inForm: true,
      },
      has_attachments: {
        type: 'checkbox',
        label: 'Has Attachments',
        inTable: true,
      },
      is_read: {
        type: 'checkbox',
        label: 'Read',
      },
      is_starred: {
        type: 'checkbox',
        label: 'Starred',
      },
      open_count: {
        type: 'number',
        label: 'Opens',
        inTable: true,
        inDetail: true,
      },
      click_count: {
        type: 'number',
        label: 'Clicks',
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.subject || '(no subject)',
    subtitle: (record) => {
      const dir = record.direction === 'outbound' ? 'To' : 'From';
      const addr = record.direction === 'outbound' 
        ? (record.to_addresses?.[0]?.address || record.to_addresses?.[0])
        : record.from_address;
      return `${dir}: ${addr || 'Unknown'}`;
    },
    badge: (record) => {
      if (record.status === 'bounced') return { label: 'Bounced', variant: 'destructive' };
      if (record.status === 'failed') return { label: 'Failed', variant: 'destructive' };
      if (record.open_count > 0) return { label: `Opened ${record.open_count}x`, variant: 'success' };
      if (record.direction === 'outbound') return { label: 'Sent', variant: 'default' };
      return undefined;
    },
    defaultSort: { field: 'sent_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['subject', 'from_address', 'snippet'],
    placeholder: 'Search emails...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'sent', label: 'Sent', query: { where: { direction: 'outbound' } } },
      { key: 'received', label: 'Received', query: { where: { direction: 'inbound' } } },
    ],
    advanced: ['direction', 'status', 'contact_id', 'deal_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'sent', label: 'Sent', query: { where: { direction: 'outbound' } }, count: true },
        { key: 'received', label: 'Received', query: { where: { direction: 'inbound' } }, count: true },
        { key: 'tracked', label: 'Tracked', query: { where: { open_count: { gt: 0 } } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'content', label: 'Email', content: { type: 'custom', component: 'EmailViewer' } },
        { key: 'tracking', label: 'Tracking', content: { type: 'custom', component: 'EmailTracking' } },
      ],
      overview: {
        stats: [
          { key: 'opens', label: 'Opens', value: { type: 'field', field: 'open_count' }, format: 'number' },
          { key: 'clicks', label: 'Clicks', value: { type: 'field', field: 'click_count' }, format: 'number' },
        ],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'compose',
          title: 'Compose Email',
          fields: ['subject', 'to_addresses', 'cc_addresses', 'body_html'],
        },
        {
          key: 'associations',
          title: 'Link To',
          fields: ['contact_id', 'company_id', 'deal_id'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['subject', 'direction', 'from_address', 'contact_id', 'sent_at', 'open_count'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/emails/${record.id}` } },
      { key: 'reply', label: 'Reply', handler: { type: 'function', fn: () => {} } },
      { key: 'forward', label: 'Forward', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'compose', label: 'Compose', variant: 'primary', handler: { type: 'navigate', path: () => '/business/emails/compose' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'contact', foreignKey: 'contact_id', label: 'Contact' },
      { entity: 'company', foreignKey: 'company_id', label: 'Company' },
      { entity: 'deal', foreignKey: 'deal_id', label: 'Deal' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
