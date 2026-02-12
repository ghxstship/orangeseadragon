import { defineSchema } from '../schema/defineSchema';

/**
 * EMAIL TEMPLATE ENTITY SCHEMA (SSOT)
 */
export const emailTemplateSchema = defineSchema({
  identity: {
    name: 'Email Template',
    namePlural: 'Email Templates',
    slug: 'business/campaigns/templates',
    icon: 'Mail',
    description: 'Email templates for campaigns',
  },

  data: {
    endpoint: '/api/email-templates',
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
      subject: {
        type: 'text',
        label: 'Subject Line',
        required: true,
        inTable: true,
        inForm: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Marketing', value: 'marketing' },
          { label: 'Transactional', value: 'transactional' },
          { label: 'Newsletter', value: 'newsletter' },
          { label: 'Notification', value: 'notification' },
          { label: 'Onboarding', value: 'onboarding' },
        ],
      },
      content_html: {
        type: 'richtext',
        label: 'HTML Content',
        inForm: true,
        inDetail: true,
      },
      content_text: {
        type: 'textarea',
        label: 'Plain Text',
        inForm: true,
        inDetail: true,
      },
      variables: {
        type: 'json',
        label: 'Variables',
        inDetail: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
      },
      updated_at: {
        type: 'datetime',
        label: 'Updated',
        inTable: true,
        sortable: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Email Template',
    subtitle: (record) => record.category || '',
    badge: (record) => {
      if (!record.is_active) return { label: 'Inactive', variant: 'secondary' };
      return undefined;
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'subject'],
    placeholder: 'Search templates...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['category', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Templates', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'preview', label: 'Preview', content: { type: 'custom', component: 'EmailPreview' } },
      ],
      overview: {
        stats: [],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Template Details',
          fields: ['name', 'subject', 'category', 'is_active'],
        },
        {
          key: 'content',
          title: 'Content',
          fields: ['content_html', 'content_text'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        'subject',
        'category',
        { field: 'is_active', format: { type: 'boolean' } },
        { field: 'updated_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/campaigns/templates/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/business/campaigns/templates/${record.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Template', variant: 'primary', handler: { type: 'navigate', path: () => '/business/campaigns/templates/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
