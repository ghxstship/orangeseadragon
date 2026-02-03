import { defineSchema } from '../schema/defineSchema';

/**
 * DOCUMENT ENTITY SCHEMA (SSOT)
 */
export const documentSchema = defineSchema({
  identity: {
    name: 'Document',
    namePlural: 'Documents',
    slug: 'core/documents',
    icon: 'File',
    description: 'Document management and file storage',
  },

  data: {
    endpoint: '/api/documents',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      document_type: {
        type: 'select',
        label: 'Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Document', value: 'document' },
          { label: 'Spreadsheet', value: 'spreadsheet' },
          { label: 'Presentation', value: 'presentation' },
          { label: 'PDF', value: 'pdf' },
          { label: 'Image', value: 'image' },
          { label: 'Video', value: 'video' },
          { label: 'Other', value: 'other' },
        ],
      },
      folder_id: {
        type: 'relation',
        label: 'Folder',
        inTable: true,
        inForm: true,
      },
      file_url: {
        type: 'file',
        label: 'File',
        inForm: true,
        inDetail: true,
      },
      file_size: {
        type: 'number',
        label: 'Size (bytes)',
        inTable: true,
      },
      mime_type: {
        type: 'text',
        label: 'MIME Type',
        inDetail: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      tags: {
        type: 'multiselect',
        label: 'Tags',
        inTable: true,
        inForm: true,
        options: [],
      },
      is_starred: {
        type: 'switch',
        label: 'Starred',
        inTable: true,
        inForm: true,
      },
      shared_with: {
        type: 'multiselect',
        label: 'Shared With',
        inForm: true,
        inDetail: true,
        options: [],
      },
    },
  },

  display: {
    title: (record) => record.name || 'Untitled Document',
    subtitle: (record) => record.document_type || '',
    defaultSort: { field: 'updated_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search documents...',
  },

  filters: {
    quick: [
      { key: 'starred', label: 'Starred', query: { where: { is_starred: true } } },
    ],
    advanced: ['document_type', 'folder_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'recent', label: 'Recent', query: { where: {} } },
        { key: 'starred', label: 'Starred', query: { where: { is_starred: true } }, count: true },
        { key: 'shared', label: 'Shared', query: { where: { shared_with: { not: [] } } } },
        { key: 'templates', label: 'Templates', query: { where: { document_type: 'template' } } },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'versions', label: 'Versions', content: { type: 'related', entity: 'document_versions', foreignKey: 'document_id' } },
      ],
      overview: {
        stats: [
          { key: 'size', label: 'File Size', value: { type: 'field', field: 'file_size' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'tags'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Document Details',
          fields: ['name', 'description', 'document_type', 'folder_id'],
        },
        {
          key: 'file',
          title: 'File',
          fields: ['file_url'],
        },
        {
          key: 'organization',
          title: 'Organization',
          fields: ['tags', 'is_starred', 'shared_with'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'document_type', 'file_size', 'is_starred'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/documents/${record.id}` } },
      { key: 'download', label: 'Download', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'download', label: 'Download', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'upload', label: 'Upload', variant: 'primary', handler: { type: 'navigate', path: () => '/core/documents/upload' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
