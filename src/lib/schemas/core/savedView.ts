import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * SAVED VIEW ENTITY SCHEMA (SSOT)
 * 
 * Persisted filter/sort/column configurations for any entity.
 * Supports personal and shared views.
 */
export const savedViewSchema = defineSchema({
  identity: {
    name: 'Saved View',
    namePlural: 'Saved Views',
    slug: 'settings/views',
    icon: 'LayoutGrid',
    description: 'Saved filter and view configurations',
  },

  data: {
    endpoint: '/api/saved-views',
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
      entity_type: {
        type: 'text',
        label: 'Entity Type',
        required: true,
        inTable: true,
        inForm: true,
      },
      view_type: {
        type: 'select',
        label: 'View Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Table', value: 'table' },
          { label: 'Kanban', value: 'kanban' },
          { label: 'List', value: 'list' },
          { label: 'Calendar', value: 'calendar' },
          { label: 'Timeline', value: 'timeline' },
          { label: 'Matrix', value: 'matrix' },
          { label: 'Grid', value: 'grid' },
        ],
      },
      config: {
        type: 'json',
        label: 'Configuration',
        inForm: true,
        inDetail: true,
      },
      filters: {
        type: 'json',
        label: 'Filters',
        inForm: true,
        inDetail: true,
      },
      columns: {
        type: 'json',
        label: 'Columns',
        inForm: true,
        inDetail: true,
      },
      sorting: {
        type: 'json',
        label: 'Sorting',
        inForm: true,
        inDetail: true,
      },
      grouping: {
        type: 'json',
        label: 'Grouping',
        inForm: true,
        inDetail: true,
      },
      is_shared: {
        type: 'switch',
        label: 'Shared',
        inTable: true,
        inForm: true,
      },
      is_default: {
        type: 'switch',
        label: 'Default',
        inTable: true,
        inForm: true,
      },
      user_id: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Owner',
        inTable: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Untitled View',
    subtitle: (record) => `${record.entity_type} • ${record.view_type}`,
    badge: (record) => {
      if (record.is_default) return { label: 'Default', variant: 'success' };
      if (record.is_shared) return { label: 'Shared', variant: 'secondary' };
      return undefined;
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search views...',
  },

  filters: {
    quick: [],
    advanced: ['entity_type', 'view_type', 'is_shared'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Views', query: { where: {} } },
        { key: 'shared', label: 'Shared', query: { where: { is_shared: true } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'config', title: 'Configuration', content: { type: 'fields', fields: ['config', 'filters', 'columns'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'View Details',
          fields: ['name', 'entity_type', 'view_type', 'is_shared', 'is_default'],
        },
        {
          key: 'config',
          title: 'Configuration',
          fields: ['config', 'filters', 'columns', 'sorting', 'grouping'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        'entity_type',
        'view_type',
        { field: 'is_shared', format: { type: 'boolean' } },
        { field: 'is_default', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'apply', label: 'Apply', handler: { type: 'function', fn: () => {} } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/settings/views/${record.id}/edit` } },
      { key: 'delete', label: 'Delete', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'delete', label: 'Delete', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'Save Current View', variant: 'primary', handler: { type: 'function', fn: () => {} } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'user_id', label: 'User' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
