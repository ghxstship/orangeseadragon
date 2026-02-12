import { defineSchema } from '../schema/defineSchema';

/**
 * KIT ITEM SCHEMA (SSOT)
 * Individual items within an asset kit
 */
export const kitItemSchema = defineSchema({
  identity: {
    name: 'KitItem',
    namePlural: 'Kit Items',
    slug: 'modules/assets/kit-items',
    icon: 'Package',
    description: 'Items within asset kits',
  },

  data: {
    endpoint: '/api/kit_items',
    primaryKey: 'id',
    fields: {
      kit_id: {
        type: 'relation',
        label: 'Kit',
        required: true,
        inForm: true,
      },
      asset_id: {
        type: 'relation',
        label: 'Asset',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      category_id: {
        type: 'relation',
        label: 'Category',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      quantity: {
        type: 'number',
        label: 'Quantity',
        required: true,
        inTable: true,
        inForm: true,
        default: 1,
      },
      is_optional: {
        type: 'checkbox',
        label: 'Optional',
        inTable: true,
        inForm: true,
        default: false,
      },
      is_substitutable: {
        type: 'checkbox',
        label: 'Substitutable',
        inTable: true,
        inForm: true,
        default: false,
      },
      substitute_category_id: {
        type: 'relation',
        label: 'Substitute Category',
        inForm: true,
        inDetail: true,
      },
      sort_order: {
        type: 'number',
        label: 'Sort Order',
        inForm: true,
        default: 0,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.asset_id || record.category_id || 'Kit Item',
    subtitle: (record) => `Qty: ${record.quantity || 1}`,
    badge: (record) => {
      if (record.is_optional) return { label: 'Optional', variant: 'secondary' };
      return { label: 'Required', variant: 'primary' };
    },
    defaultSort: { field: 'sort_order', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['notes'],
    placeholder: 'Search kit items...',
  },

  filters: {
    quick: [
      { key: 'required', label: 'Required', query: { where: { is_optional: false } } },
      { key: 'optional', label: 'Optional', query: { where: { is_optional: true } } },
    ],
    advanced: ['is_optional', 'is_substitutable', 'category_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Items', query: { where: {} }, count: true },
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
        blocks: [],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Item Details',
          fields: ['kit_id', 'asset_id', 'category_id', 'quantity', 'sort_order'],
        },
        {
          key: 'options',
          title: 'Options',
          fields: ['is_optional', 'is_substitutable', 'substitute_category_id'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['notes'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'asset_id', format: { type: 'relation', entityType: 'asset' } },
        { field: 'category_id', format: { type: 'relation', entityType: 'category' } },
        { field: 'quantity', format: { type: 'number' } },
        { field: 'is_optional', format: { type: 'boolean' } },
        { field: 'is_substitutable', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'function', fn: () => console.log('Edit item') } },
      { key: 'remove', label: 'Remove', handler: { type: 'function', fn: () => console.log('Remove item') } },
    ],
    bulk: [],
    global: [
      { key: 'add', label: 'Add Item', variant: 'primary', handler: { type: 'function', fn: () => console.log('Add item') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
