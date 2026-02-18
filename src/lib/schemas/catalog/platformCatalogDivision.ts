import { defineSchema } from '../../schema-engine/defineSchema';

export const platformCatalogDivisionSchema = defineSchema({
  identity: {
    name: 'platformCatalogDivision',
    namePlural: 'Catalog Divisions',
    slug: 'platform/catalog/divisions',
    icon: 'LayoutGrid',
    description: 'Top-level platform catalog divisions (Production, Operations)',
  },

  data: {
    endpoint: '/api/platform-catalog/divisions',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Division Name',
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
      sort_order: {
        type: 'number',
        label: 'Sort Order',
        inTable: true,
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
    placeholder: 'Search divisions...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['is_active'],
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
        { key: 'categories', label: 'Categories', content: { type: 'related', entity: 'platformCatalogCategory', foreignKey: 'division_id', defaultView: 'table', allowCreate: false } },
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
        { key: 'basic', title: 'Division Details', fields: ['name', 'description', 'icon', 'sort_order', 'is_active'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        'slug',
        { field: 'sort_order', format: { type: 'number' } },
        { field: 'is_active', format: { type: 'boolean', trueLabel: 'Active', falseLabel: 'Inactive' } },
      ],
    },
    grid: {
      titleField: 'name',
      subtitleField: 'description',
      cardFields: ['sort_order'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/catalog/divisions/${r.id}` } },
    ],
    bulk: [],
    global: [],
  },

  relationships: {
    hasMany: [
      { entity: 'platformCatalogCategory', foreignKey: 'division_id', label: 'Categories', cascade: 'delete' },
    ],
  },

  permissions: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
});
