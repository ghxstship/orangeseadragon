import { defineSchema } from '../../schema-engine/defineSchema';

export const platformCatalogCategorySchema = defineSchema({
  identity: {
    name: 'platformCatalogCategory',
    namePlural: 'Catalog Categories',
    slug: 'platform/catalog/categories',
    icon: 'FolderTree',
    description: 'Platform-wide asset and advancing catalog categories',
  },

  data: {
    endpoint: '/api/platform-catalog/categories',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Category Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      slug: {
        type: 'text',
        label: 'Slug',
        required: true,
        inTable: true,
        inForm: false,
        inDetail: true,
        readOnly: true,
      },
      division_id: {
        type: 'relation',
        label: 'Division',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'platformCatalogDivision', display: 'name' },
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      icon: {
        type: 'text',
        label: 'Icon',
        inForm: true,
        inDetail: true,
      },
      color: {
        type: 'color',
        label: 'Color',
        inTable: true,
        inForm: true,
      },
      sort_order: {
        type: 'number',
        label: 'Sort Order',
        inForm: true,
        default: 0,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },

  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled'),
    subtitle: (record: Record<string, unknown>) => String(record.description || ''),
    badge: (record: Record<string, unknown>) => {
      return record.is_active
        ? { label: 'Active', variant: 'success' }
        : { label: 'Inactive', variant: 'secondary' };
    },
    defaultSort: { field: 'sort_order', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search categories...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['division_id', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Items', content: { type: 'related', entity: 'platformCatalogItem', foreignKey: 'category_id', defaultView: 'table', allowCreate: false } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'description', title: 'Description', content: { type: 'fields', fields: ['description'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Category Details', fields: ['name', 'division_id', 'description', 'icon', 'color', 'sort_order', 'is_active'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        'slug',
        { field: 'division_id', format: { type: 'relation', entityType: 'platformCatalogDivision' } },
        'color',
        { field: 'is_active', format: { type: 'boolean', trueLabel: 'Active', falseLabel: 'Inactive' } },
      ],
    },
    grid: {
      titleField: 'name',
      subtitleField: 'description',
      cardFields: ['color'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/catalog/categories/${r.id}` } },
    ],
    bulk: [],
    global: [],
  },

  relationships: {
    belongsTo: [
      { entity: 'platformCatalogDivision', foreignKey: 'division_id', label: 'Division' },
    ],
    hasMany: [
      { entity: 'platformCatalogItem', foreignKey: 'category_id', label: 'Items', cascade: 'delete' },
    ],
  },

  permissions: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
});
