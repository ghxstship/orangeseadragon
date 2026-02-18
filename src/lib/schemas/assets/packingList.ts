import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * PACKING LIST SCHEMA (SSOT)
 * Packing lists for shipments and events
 */
export const packingListSchema = defineSchema({
  identity: {
    name: 'PackingList',
    namePlural: 'Packing Lists',
    slug: 'modules/assets/packing-lists',
    icon: 'ClipboardList',
    description: 'Packing lists for shipments',
  },

  data: {
    endpoint: '/api/packing_lists',
    primaryKey: 'id',
    fields: {
      packing_list_number: {
        type: 'text',
        label: 'Packing List #',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
        sortable: true,
      },
      shipment_id: {
        type: 'relation',
        label: 'Shipment',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'In Progress', value: 'in_progress', color: 'blue' },
          { label: 'Packed', value: 'packed', color: 'cyan' },
          { label: 'Verified', value: 'verified', color: 'green' },
          { label: 'Shipped', value: 'shipped', color: 'purple' },
        ],
        default: 'draft',
      },
      total_items: {
        type: 'number',
        label: 'Total Items',
        inTable: true,
        inDetail: true,
        readOnly: true,
      },
      packed_items: {
        type: 'number',
        label: 'Packed Items',
        inTable: true,
        inDetail: true,
        readOnly: true,
      },
      packed_by: {
        type: 'relation',
        label: 'Packed By',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      verified_by: {
        type: 'relation',
        label: 'Verified By',
        inForm: true,
        inDetail: true,
      },
      packed_at: {
        type: 'datetime',
        label: 'Packed At',
        inTable: true,
        inDetail: true,
      },
      verified_at: {
        type: 'datetime',
        label: 'Verified At',
        inDetail: true,
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
    title: (record) => record.packing_list_number || 'New Packing List',
    subtitle: (record) => `${record.packed_items || 0}/${record.total_items || 0} items`,
    badge: (record) => {
      const statusColors: Record<string, string> = {
        draft: 'secondary',
        in_progress: 'primary',
        packed: 'warning',
        verified: 'success',
        shipped: 'success',
      };
      return { label: String(record.status || 'Draft'), variant: statusColors[record.status as string] || 'secondary' };
    },
    defaultSort: { field: 'packing_list_number', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['packing_list_number'],
    placeholder: 'Search packing lists...',
  },

  filters: {
    quick: [
      { key: 'in-progress', label: 'In Progress', query: { where: { status: 'in_progress' } } },
      { key: 'needs-verification', label: 'Needs Verification', query: { where: { status: 'packed' } } },
    ],
    advanced: ['status', 'shipment_id', 'event_id', 'packed_by'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: { in: ['draft', 'in_progress', 'packed'] } } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: { in: ['verified', 'shipped'] } } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Items', content: { type: 'related', entity: 'packingListItem', foreignKey: 'packing_list_id' } },
      ],
      overview: {
        stats: [
          { key: 'total', label: 'Total Items', value: { type: 'field', field: 'total_items' }, format: 'number' },
          { key: 'packed', label: 'Packed', value: { type: 'field', field: 'packed_items' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['shipment_id', 'event_id', 'packed_by', 'verified_by'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Packing List Details',
          fields: ['packing_list_number', 'shipment_id', 'event_id', 'status'],
        },
        {
          key: 'packing',
          title: 'Packing Info',
          fields: ['packed_by', 'verified_by'],
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
      columns: ['packing_list_number', 'shipment_id', 'status', 'total_items', 'packed_items', 'packed_by', 'packed_at'],
    },
    list: {
      titleField: 'packing_list_number',
      subtitleField: 'shipment_id',
      metaFields: ['status', 'packed_at'],
      showChevron: true,
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/packing-lists/${record.id}` } },
      { key: 'print', label: 'Print', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Packing List', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/packing-lists/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

/**
 * PACKING LIST ITEM SCHEMA (SSOT)
 * Individual items on a packing list
 */
export const packingListItemSchema = defineSchema({
  identity: {
    name: 'PackingListItem',
    namePlural: 'Packing List Items',
    slug: 'modules/assets/packing-list-items',
    icon: 'Package',
    description: 'Items on a packing list',
  },

  data: {
    endpoint: '/api/packing_list_items',
    primaryKey: 'id',
    fields: {
      packing_list_id: {
        type: 'relation',
        label: 'Packing List',
        required: true,
        inForm: true,
      },
      asset_id: {
        type: 'relation',
        relation: { entity: 'asset', display: 'name' },
        label: 'Asset',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      quantity_expected: {
        type: 'number',
        label: 'Expected Qty',
        required: true,
        inTable: true,
        inForm: true,
        default: 1,
      },
      quantity_packed: {
        type: 'number',
        label: 'Packed Qty',
        inTable: true,
        inForm: true,
        default: 0,
      },
      is_packed: {
        type: 'checkbox',
        label: 'Packed',
        inTable: true,
        inForm: true,
        default: false,
      },
      case_number: {
        type: 'text',
        label: 'Case #',
        inTable: true,
        inForm: true,
        placeholder: 'e.g., CASE-001',
      },
      position_in_case: {
        type: 'text',
        label: 'Position',
        inForm: true,
        inDetail: true,
      },
      packed_at: {
        type: 'datetime',
        label: 'Packed At',
        inTable: true,
        inDetail: true,
      },
      packed_by: {
        type: 'relation',
        label: 'Packed By',
        inDetail: true,
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
    title: (record) => record.asset_id || 'Item',
    subtitle: (record) => `${record.quantity_packed || 0}/${record.quantity_expected || 0}`,
    badge: (record) => {
      if (record.is_packed) return { label: 'Packed', variant: 'success' };
      if (Number(record.quantity_packed) > 0) return { label: 'Partial', variant: 'warning' };
      return { label: 'Pending', variant: 'secondary' };
    },
    defaultSort: { field: 'case_number', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['case_number'],
    placeholder: 'Search items...',
  },

  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { is_packed: false } } },
      { key: 'packed', label: 'Packed', query: { where: { is_packed: true } } },
    ],
    advanced: ['is_packed', 'case_number', 'asset_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Items', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { is_packed: false } }, count: true },
        { key: 'packed', label: 'Packed', query: { where: { is_packed: true } } },
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
          fields: ['packing_list_id', 'asset_id', 'quantity_expected', 'quantity_packed', 'is_packed'],
        },
        {
          key: 'packing',
          title: 'Packing Info',
          fields: ['case_number', 'position_in_case'],
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
      columns: ['asset_id', 'quantity_expected', 'quantity_packed', 'is_packed', 'case_number', 'packed_at'],
    },
  },

  actions: {
    row: [
      { key: 'pack', label: 'Mark Packed', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'bulk-pack', label: 'Mark All Packed', handler: { type: 'function', fn: () => {} } },
    ],
    global: [],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
