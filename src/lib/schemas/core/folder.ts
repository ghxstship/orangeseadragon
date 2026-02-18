import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * FOLDER ENTITY SCHEMA (SSOT)
 */
export const folderSchema = defineSchema({
  identity: {
    name: 'Folder',
    namePlural: 'Folders',
    slug: 'core/documents/folder',
    icon: 'Folder',
    description: 'Document folders and organization',
  },

  data: {
    endpoint: '/api/folders',
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
      parent_id: {
        type: 'relation',
        label: 'Parent Folder',
        inForm: true,
        inDetail: true,
      },
      color: {
        type: 'select',
        label: 'Color',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Blue', value: 'blue' },
          { label: 'Green', value: 'green' },
          { label: 'Red', value: 'red' },
          { label: 'Yellow', value: 'yellow' },
          { label: 'Purple', value: 'purple' },
        ],
      },
      document_count: {
        type: 'number',
        label: 'Documents',
        inTable: true,
      },
      is_shared: {
        type: 'switch',
        label: 'Shared',
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
    title: (record) => record.name || 'Untitled Folder',
    subtitle: (record) => `${record.document_count || 0} documents`,
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search folders...',
  },

  filters: {
    quick: [],
    advanced: ['is_shared'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Folders', query: { where: {} } },
        { key: 'shared', label: 'Shared', query: { where: { is_shared: true } } },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table'],
    },
    detail: {
      tabs: [
        { key: 'documents', label: 'Documents', content: { type: 'related', entity: 'documents', foreignKey: 'folder_id' } },
        { key: 'settings', label: 'Settings', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'documents', label: 'Documents', value: { type: 'field', field: 'document_count' }, format: 'number' },
        ],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Folder Details',
          fields: ['name', 'parent_id', 'color'],
        },
        {
          key: 'sharing',
          title: 'Sharing',
          fields: ['is_shared', 'shared_with'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['name', 'color', 'document_count', 'is_shared'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/documents/folder/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Folder', variant: 'primary', handler: { type: 'navigate', path: () => '/core/documents/folder/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
