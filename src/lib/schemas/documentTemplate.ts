import { defineSchema } from '../schema/defineSchema';

/**
 * DOCUMENT TEMPLATE ENTITY SCHEMA (SSOT)
 */
export const documentTemplateSchema = defineSchema({
  identity: {
    name: 'Document Template',
    namePlural: 'Document Templates',
    slug: 'core/documents/templates',
    icon: 'FileTemplate',
    description: 'Reusable document templates',
  },

  data: {
    endpoint: '/api/document-templates',
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
        inForm: true,
        inDetail: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Contract', value: 'contract' },
          { label: 'Proposal', value: 'proposal' },
          { label: 'Report', value: 'report' },
          { label: 'Form', value: 'form' },
          { label: 'Other', value: 'other' },
        ],
      },
      content: {
        type: 'richtext',
        label: 'Content',
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
    title: (record) => record.name || 'Untitled Template',
    subtitle: (record) => record.category || '',
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search templates...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
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
        { key: 'preview', label: 'Preview', content: { type: 'custom', component: 'DocumentPreview' } },
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
          fields: ['name', 'description', 'category', 'is_active'],
        },
        {
          key: 'content',
          title: 'Content',
          fields: ['content'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        'category',
        { field: 'is_active', format: { type: 'boolean' } },
        { field: 'updated_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/documents/templates/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/core/documents/templates/${record.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Template', variant: 'primary', handler: { type: 'navigate', path: () => '/core/documents/templates/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
