import { defineSchema } from '../../schema-engine/defineSchema';

export const platformCatalogItemSchema = defineSchema({
  identity: {
    name: 'platformCatalogItem',
    namePlural: 'Catalog Items',
    slug: 'platform/catalog/items',
    icon: 'Store',
    description: 'Platform-wide catalog items available for asset and advancing workflows',
  },

  data: {
    endpoint: '/api/platform-catalog/items',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Item Name',
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
        inTable: false,
        inForm: false,
        inDetail: true,
        readOnly: true,
      },
      category_id: {
        type: 'relation',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'platformCatalogCategory', display: 'name', searchable: true },
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      icon: {
        type: 'text',
        label: 'Icon',
        inForm: true,
      },
      image_url: {
        type: 'image',
        label: 'Image',
        inForm: true,
        inDetail: true,
      },
      default_unit_cost: {
        type: 'currency',
        label: 'Default Unit Cost',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      default_rental_rate: {
        type: 'currency',
        label: 'Default Rental Rate',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      currency: {
        type: 'text',
        label: 'Currency',
        inForm: true,
        inDetail: true,
        default: 'USD',
      },
      unit_of_measure: {
        type: 'text',
        label: 'Unit of Measure',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      is_rentable: {
        type: 'switch',
        label: 'Rentable',
        inTable: true,
        inForm: true,
        default: false,
      },
      is_purchasable: {
        type: 'switch',
        label: 'Purchasable',
        inTable: true,
        inForm: true,
        default: true,
      },
      is_service: {
        type: 'switch',
        label: 'Service',
        inTable: true,
        inForm: true,
        default: false,
      },
      specifications: {
        type: 'json',
        label: 'Specifications',
        inForm: true,
        inDetail: true,
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
    subtitle: (record: Record<string, unknown>) => {
      const parts: string[] = [];
      if (record.unit_of_measure) parts.push(String(record.unit_of_measure));
      if (record.is_service) parts.push('Service');
      else if (record.is_rentable) parts.push('Rentable');
      return parts.join(' · ') || '';
    },
    image: (record: Record<string, unknown>) => record.image_url ? String(record.image_url) : undefined,
    badge: (record: Record<string, unknown>) => {
      if (record.is_service) return { label: 'Service', variant: 'primary' };
      if (record.is_rentable && record.is_purchasable) return { label: 'Rent / Buy', variant: 'success' };
      if (record.is_rentable) return { label: 'Rental', variant: 'warning' };
      return { label: 'Purchase', variant: 'secondary' };
    },
    defaultSort: { field: 'sort_order', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search catalog items...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'rentable', label: 'Rentable', query: { where: { is_rentable: true } } },
      { key: 'services', label: 'Services', query: { where: { is_service: true } } },
    ],
    advanced: ['category_id', 'is_rentable', 'is_purchasable', 'is_service', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'rentable', label: 'Rentable', query: { where: { is_rentable: true } }, count: true },
        { key: 'services', label: 'Services', query: { where: { is_service: true } }, count: true },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'cost', label: 'Unit Cost', value: { type: 'field', field: 'default_unit_cost' }, format: 'currency' },
          { key: 'rental', label: 'Rental Rate', value: { type: 'field', field: 'default_rental_rate' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'unit_of_measure', 'currency'] } },
          { key: 'specs', title: 'Specifications', content: { type: 'fields', fields: ['specifications'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Item Details', fields: ['name', 'category_id', 'description', 'icon', 'image_url'] },
        { key: 'pricing', title: 'Pricing', fields: ['default_unit_cost', 'default_rental_rate', 'currency', 'unit_of_measure'] },
        { key: 'flags', title: 'Availability', fields: ['is_rentable', 'is_purchasable', 'is_service', 'is_active'] },
        { key: 'specs', title: 'Specifications', fields: ['specifications', 'sort_order'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'category_id', format: { type: 'relation', entityType: 'platformCatalogCategory' } },
        'unit_of_measure',
        { field: 'default_unit_cost', format: { type: 'currency' } },
        { field: 'default_rental_rate', format: { type: 'currency' } },
        { field: 'is_rentable', format: { type: 'boolean', trueLabel: 'Yes', falseLabel: 'No' } },
        { field: 'is_service', format: { type: 'boolean', trueLabel: 'Yes', falseLabel: 'No' } },
        { field: 'is_active', format: { type: 'boolean', trueLabel: 'Active', falseLabel: 'Inactive' } },
      ],
    },
    grid: {
      titleField: 'name',
      subtitleField: 'description',
      imageField: 'image_url',
      cardFields: ['unit_of_measure', 'default_unit_cost'],
    },
    list: {
      titleField: 'name',
      subtitleField: 'description',
      metaFields: ['unit_of_measure', 'default_unit_cost'],
      showChevron: true,
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/catalog/items/${r.id}` } },
    ],
    bulk: [],
    global: [],
  },

  relationships: {
    belongsTo: [
      { entity: 'platformCatalogCategory', foreignKey: 'category_id', label: 'Category' },
    ],
  },

  permissions: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
});
