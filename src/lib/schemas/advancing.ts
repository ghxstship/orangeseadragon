/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const productionAdvanceSchema = defineSchema({
  identity: {
    name: 'productionAdvance',
    namePlural: 'Production Advances',
    slug: 'productions/advancing/advances',
    icon: 'ClipboardList',
    description: 'Production advance coordination by event',
  },

  data: {
    endpoint: '/api/advancing/advances',
    primaryKey: 'id',
    fields: {
      advance_code: {
        type: 'text',
        label: 'Advance Code',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
      },
      advance_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pre-Event', value: 'pre_event', color: 'blue' },
          { label: 'Load-In', value: 'load_in', color: 'purple' },
          { label: 'Show Day', value: 'show_day', color: 'green' },
          { label: 'Strike', value: 'strike', color: 'orange' },
          { label: 'Post-Event', value: 'post_event', color: 'gray' },
        ],
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
          { label: 'Pending Approval', value: 'pending_approval', color: 'yellow' },
          { label: 'Approved', value: 'approved', color: 'green' },
          { label: 'Completed', value: 'completed', color: 'emerald' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
        ],
        default: 'draft',
      },
      priority: {
        type: 'select',
        label: 'Priority',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Critical', value: 'critical', color: 'red' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Medium', value: 'medium', color: 'yellow' },
          { label: 'Low', value: 'low', color: 'gray' },
        ],
        default: 'medium',
      },
      due_date: {
        type: 'datetime',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      assigned_to: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inForm: true,
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
    title: (record: any) => record.advance_code || 'Untitled',
    subtitle: (record: any) => record.advance_type || '',
    badge: (record: any) => {
      const statusMap: Record<string, string> = {
        draft: 'secondary',
        in_progress: 'warning',
        pending_approval: 'warning',
        approved: 'success',
        completed: 'success',
        cancelled: 'destructive',
      };
      return { label: record.status || 'Unknown', variant: statusMap[record.status] || 'secondary' };
    },
    defaultSort: { field: 'due_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['advance_code', 'notes'],
    placeholder: 'Search advances...',
  },

  filters: {
    quick: [
      { key: 'in_progress', label: 'In Progress', query: { where: { status: 'in_progress' } } },
      { key: 'pending', label: 'Pending Approval', query: { where: { status: 'pending_approval' } } },
    ],
    advanced: ['status', 'advance_type', 'priority', 'event_id', 'assigned_to'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: { $in: ['draft', 'in_progress', 'pending_approval'] } } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'list', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Items', content: { type: 'related', entity: 'advanceItem', foreignKey: 'production_advance_id' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Advance Details', fields: ['advance_code', 'event_id', 'advance_type', 'status', 'priority'] },
        { key: 'schedule', title: 'Schedule', fields: ['due_date', 'assigned_to'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'advance_code',
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        'advance_type',
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', in_progress: '#f59e0b', pending_review: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' } } },
        { field: 'priority', format: { type: 'badge', colorMap: { urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6' } } },
        { field: 'due_date', format: { type: 'date' } },
        { field: 'assigned_to', format: { type: 'relation', entityType: 'person' } },
      ],
    },
    list: {
      titleField: 'advance_code',
      subtitleField: 'advance_type',
      metaFields: ['due_date', 'assigned_to'],
      showChevron: true,
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'draft', label: 'Draft', color: 'gray' },
        { value: 'in_progress', label: 'In Progress', color: 'blue' },
        { value: 'pending_approval', label: 'Pending Approval', color: 'yellow' },
        { value: 'approved', label: 'Approved', color: 'green' },
        { value: 'completed', label: 'Completed', color: 'emerald' },
      ],
      card: {
        title: 'advance_code',
        subtitle: 'advance_type',
        fields: ['due_date', 'priority'],
      },
    },
    calendar: {
      titleField: 'advance_code',
      startField: 'due_date',
      colorField: 'status',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: any) => `/productions/advancing/advances/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Advance', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'user', foreignKey: 'assigned_to', label: 'Assigned To' },
    ],
    hasMany: [
      { entity: 'advanceItem', foreignKey: 'production_advance_id', label: 'Items', cascade: 'delete' },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

export const advanceItemSchema = defineSchema({
  identity: {
    name: 'advanceItem',
    namePlural: 'Advance Items',
    slug: 'productions/advancing/items',
    icon: 'Package',
    description: 'Individual advance line items',
  },

  data: {
    endpoint: '/api/advancing/items',
    primaryKey: 'id',
    fields: {
      item_name: {
        type: 'text',
        label: 'Item Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      production_advance_id: {
        type: 'relation',
        label: 'Advance',
        required: true,
        inForm: true,
      },
      category_id: {
        type: 'relation',
        label: 'Category',
        inTable: true,
        inForm: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      vendor_id: {
        type: 'relation',
        relation: { entity: 'company', display: 'name', searchable: true },
        label: 'Vendor',
        inTable: true,
        inForm: true,
      },
      quantity_required: {
        type: 'number',
        label: 'Qty Required',
        inTable: true,
        inForm: true,
        default: 1,
      },
      quantity_confirmed: {
        type: 'number',
        label: 'Qty Confirmed',
        inTable: true,
        inForm: true,
        default: 0,
      },
      unit_cost: {
        type: 'currency',
        label: 'Unit Cost',
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'gray' },
          { label: 'Requested', value: 'requested', color: 'blue' },
          { label: 'Confirmed', value: 'confirmed', color: 'cyan' },
          { label: 'In Transit', value: 'in_transit', color: 'purple' },
          { label: 'Delivered', value: 'delivered', color: 'green' },
          { label: 'Complete', value: 'complete', color: 'emerald' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
        ],
        default: 'pending',
      },
      scheduled_delivery: {
        type: 'datetime',
        label: 'Scheduled Delivery',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      is_critical_path: {
        type: 'checkbox',
        label: 'Critical Path',
        inTable: true,
        inForm: true,
        default: false,
      },
      assigned_to: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inForm: true,
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
    title: (record: any) => record.item_name || 'Untitled',
    subtitle: (record: any) => record.vendor_id || '',
    badge: (record: any) => {
      if (record.is_critical_path) return { label: 'Critical', variant: 'destructive' };
      const statusMap: Record<string, string> = {
        pending: 'secondary',
        confirmed: 'success',
        in_transit: 'warning',
        delivered: 'success',
        complete: 'success',
      };
      return { label: record.status || 'Unknown', variant: statusMap[record.status] || 'secondary' };
    },
    defaultSort: { field: 'scheduled_delivery', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['item_name', 'description', 'notes'],
    placeholder: 'Search items...',
  },

  filters: {
    quick: [
      { key: 'critical', label: 'Critical Path', query: { where: { is_critical_path: true } } },
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
    ],
    advanced: ['status', 'category_id', 'vendor_id', 'is_critical_path', 'assigned_to'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'critical', label: 'Critical', query: { where: { is_critical_path: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Item Details', fields: ['item_name', 'production_advance_id', 'category_id', 'description'] },
        { key: 'vendor', title: 'Vendor & Cost', fields: ['vendor_id', 'quantity_required', 'quantity_confirmed', 'unit_cost'] },
        { key: 'schedule', title: 'Schedule', fields: ['scheduled_delivery', 'location'] },
        { key: 'assignment', title: 'Assignment', fields: ['status', 'assigned_to', 'is_critical_path'] },
        { key: 'details', title: 'Details', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'item_name',
        { field: 'category_id', format: { type: 'relation', entityType: 'category' } },
        { field: 'vendor_id', format: { type: 'relation', entityType: 'company' } },
        { field: 'status', format: { type: 'badge', colorMap: { pending: '#f59e0b', ordered: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' } } },
        { field: 'scheduled_delivery', format: { type: 'date' } },
        'location',
        { field: 'is_critical_path', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: any) => `/productions/advancing/items/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Item', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  relationships: {
    belongsTo: [
      { entity: 'productionAdvance', foreignKey: 'production_advance_id', label: 'Advance' },
      { entity: 'advanceCategory', foreignKey: 'category_id', label: 'Category' },
      { entity: 'company', foreignKey: 'vendor_id', label: 'Vendor' },
      { entity: 'user', foreignKey: 'assigned_to', label: 'Assigned To' },
    ],
    hasMany: [
      { entity: 'advanceItemFulfillment', foreignKey: 'advance_item_id', label: 'Fulfillment Stages', cascade: 'delete' },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

export const advanceItemFulfillmentSchema = defineSchema({
  identity: {
    name: 'advanceItemFulfillment',
    namePlural: 'Fulfillment Stages',
    slug: 'productions/advancing/fulfillment',
    icon: 'Truck',
    description: 'Fulfillment stage tracking for advance items',
  },

  data: {
    endpoint: '/api/advancing/fulfillment',
    primaryKey: 'id',
    fields: {
      advance_item_id: {
        type: 'relation',
        label: 'Advance Item',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'advanceItem', display: 'item_name' },
      },
      fulfillment_stage: {
        type: 'select',
        label: 'Stage',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Requested', value: 'requested', color: 'gray' },
          { label: 'Quoted', value: 'quoted', color: 'blue' },
          { label: 'Ordered', value: 'ordered', color: 'cyan' },
          { label: 'Confirmed', value: 'confirmed', color: 'teal' },
          { label: 'Shipped', value: 'shipped', color: 'indigo' },
          { label: 'Delivered', value: 'delivered', color: 'green' },
          { label: 'Complete', value: 'complete', color: 'emerald' },
        ],
      },
      expected_completion: {
        type: 'datetime',
        label: 'Expected Completion',
        inTable: true,
        inForm: true,
      },
      actual_completion: {
        type: 'datetime',
        label: 'Actual Completion',
        inTable: true,
      },
      percentage_complete: {
        type: 'number',
        label: '% Complete',
        inTable: true,
        inForm: true,
        min: 0,
        max: 100,
      },
      assigned_to: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inForm: true,
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
    title: (record: any) => record.fulfillment_stage || 'Unknown Stage',
    subtitle: (record: any) => `${record.percentage_complete || 0}% complete`,
    badge: (record: any) => {
      const pct = Number(record.percentage_complete) || 0;
      if (pct === 100) return { label: 'Complete', variant: 'success' };
      if (pct > 0) return { label: `${pct}%`, variant: 'warning' };
      return { label: 'Not Started', variant: 'secondary' };
    },
    defaultSort: { field: 'expected_completion', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['notes'],
    placeholder: 'Search fulfillment...',
  },

  filters: {
    quick: [
      { key: 'incomplete', label: 'Incomplete', query: { where: { actual_completion: null } } },
    ],
    advanced: ['fulfillment_stage', 'assigned_to'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Stages', query: { where: {} }, count: true },
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
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'stage', title: 'Stage Details', fields: ['advance_item_id', 'fulfillment_stage', 'percentage_complete'] },
        { key: 'schedule', title: 'Schedule', fields: ['expected_completion', 'assigned_to'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'advance_item_id', format: { type: 'relation', entityType: 'advance_item' } },
        'fulfillment_stage',
        { field: 'percentage_complete', format: { type: 'percentage' } },
        { field: 'expected_completion', format: { type: 'date' } },
        { field: 'actual_completion', format: { type: 'date' } },
        { field: 'assigned_to', format: { type: 'relation', entityType: 'person' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: any) => `/productions/advancing/fulfillment/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Stage', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  relationships: {
    belongsTo: [
      { entity: 'advanceItem', foreignKey: 'advance_item_id', label: 'Advance Item' },
      { entity: 'user', foreignKey: 'assigned_to', label: 'Assigned To' },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

export const vendorRatingSchema = defineSchema({
  identity: {
    name: 'vendorRating',
    namePlural: 'Vendor Ratings',
    slug: 'productions/advancing/vendors/performance',
    icon: 'Star',
    description: 'Vendor performance ratings and feedback',
  },

  data: {
    endpoint: '/api/advancing/vendors/ratings',
    primaryKey: 'id',
    fields: {
      vendor_id: {
        type: 'relation',
        label: 'Vendor',
        required: true,
        inTable: true,
        inForm: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name', searchable: true },
      },
      on_time_delivery: {
        type: 'checkbox',
        label: 'On-Time Delivery',
        inTable: true,
        inForm: true,
      },
      quality_rating: {
        type: 'rating',
        label: 'Quality',
        inTable: true,
        inForm: true,
        min: 1,
        max: 5,
      },
      communication_rating: {
        type: 'rating',
        label: 'Communication',
        inTable: true,
        inForm: true,
        min: 1,
        max: 5,
      },
      overall_rating: {
        type: 'rating',
        label: 'Overall',
        inTable: true,
        inForm: true,
        min: 1,
        max: 5,
      },
      would_recommend: {
        type: 'checkbox',
        label: 'Would Recommend',
        inTable: true,
        inForm: true,
      },
      positive_feedback: {
        type: 'textarea',
        label: 'Positive Feedback',
        inForm: true,
        inDetail: true,
      },
      issues_encountered: {
        type: 'textarea',
        label: 'Issues Encountered',
        inForm: true,
        inDetail: true,
      },
      rated_at: {
        type: 'datetime',
        label: 'Rated At',
        inTable: true,
        sortable: true,
      },
    },
  },

  display: {
    title: (record: any) => record.vendor_id || 'Unknown Vendor',
    subtitle: (record: any) => `${record.overall_rating || 0}/5`,
    badge: (record: any) => {
      const rating = Number(record.overall_rating) || 0;
      if (rating >= 4) return { label: `${rating}/5`, variant: 'success' };
      if (rating >= 3) return { label: `${rating}/5`, variant: 'warning' };
      return { label: `${rating}/5`, variant: 'destructive' };
    },
    defaultSort: { field: 'rated_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['issues_encountered', 'positive_feedback'],
    placeholder: 'Search ratings...',
  },

  filters: {
    quick: [
      { key: 'recommended', label: 'Recommended', query: { where: { would_recommend: true } } },
    ],
    advanced: ['vendor_id', 'event_id', 'overall_rating', 'on_time_delivery'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Ratings', query: { where: {} }, count: true },
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
          { key: 'feedback', title: 'Feedback', content: { type: 'fields', fields: ['positive_feedback', 'issues_encountered'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'context', title: 'Context', fields: ['vendor_id', 'event_id'] },
        { key: 'ratings', title: 'Ratings', fields: ['overall_rating', 'quality_rating', 'communication_rating'] },
        { key: 'delivery', title: 'Delivery', fields: ['on_time_delivery', 'would_recommend'] },
        { key: 'feedback', title: 'Feedback', fields: ['positive_feedback', 'issues_encountered'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'vendor_id', format: { type: 'relation', entityType: 'company' } },
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        { field: 'overall_rating', format: { type: 'number' } },
        { field: 'quality_rating', format: { type: 'number' } },
        { field: 'communication_rating', format: { type: 'number' } },
        { field: 'on_time_delivery', format: { type: 'boolean' } },
        { field: 'would_recommend', format: { type: 'boolean' } },
        { field: 'rated_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: any) => `/productions/advancing/vendors/performance/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Rating', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  relationships: {
    belongsTo: [
      { entity: 'company', foreignKey: 'vendor_id', label: 'Vendor' },
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

export const advanceCategorySchema = defineSchema({
  identity: {
    name: 'advanceCategory',
    namePlural: 'Advance Categories',
    slug: 'productions/advancing/categories',
    icon: 'FolderTree',
    description: 'Categories for advance items',
  },

  data: {
    endpoint: '/api/advancing/categories',
    primaryKey: 'id',
    fields: {
      code: {
        type: 'text',
        label: 'Code',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      parent_category_id: {
        type: 'relation',
        relation: { entity: 'category', display: 'name' },
        label: 'Parent Category',
        inTable: true,
        inForm: true,
      },
      icon: {
        type: 'text',
        label: 'Icon',
        inForm: true,
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
        type: 'checkbox',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },

  display: {
    title: (record: any) => record.name || 'Untitled',
    subtitle: (record: any) => record.code || '',
    badge: (record: any) => {
      return record.is_active ? { label: 'Active', variant: 'success' } : { label: 'Inactive', variant: 'secondary' };
    },
    defaultSort: { field: 'sort_order', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'code', 'description'],
    placeholder: 'Search categories...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['is_active', 'parent_category_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Categories', query: { where: {} }, count: true },
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
          { key: 'description', title: 'Description', content: { type: 'fields', fields: ['description'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Category Details', fields: ['code', 'name', 'description', 'parent_category_id'] },
        { key: 'display', title: 'Display', fields: ['icon', 'color', 'sort_order', 'is_active'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name', 'code',
        { field: 'parent_category_id', format: { type: 'relation', entityType: 'category' } },
        'color',
        { field: 'is_active', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: any) => `/productions/advancing/categories/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Category', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  relationships: {
    belongsTo: [
      { entity: 'advanceCategory', foreignKey: 'parent_category_id', label: 'Parent Category' },
    ],
    hasMany: [
      { entity: 'advanceItem', foreignKey: 'category_id', label: 'Items', cascade: 'nullify' },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

export const advancingCatalogItemSchema = defineSchema({
  identity: {
    name: 'advancingCatalogItem',
    namePlural: 'Catalog Items',
    slug: 'productions/advancing/catalog',
    icon: 'Store',
    description: 'Standard advance items available for selection',
  },

  data: {
    endpoint: '/api/advancing/catalog',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Item Name',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      category_id: {
        type: 'relation',
        label: 'Category',
        inTable: true,
        inForm: true,
        relation: {
          entity: 'advanceCategory',
          display: 'name',
        }
      },
      base_unit_cost: {
        type: 'currency',
        label: 'Base Cost',
        inTable: true,
        inForm: true,
      },
      image_url: {
        type: 'image',
        label: 'Image',
        inTable: true,
        inForm: true,
      },
      is_available: {
        type: 'checkbox',
        label: 'Available',
        inTable: true,
        inForm: true,
        default: true,
      },
      specifications_template: {
        type: 'json',
        label: 'Specs Template',
        inForm: true,
      },
    },
  },

  display: {
    title: (record: any) => record.name || 'Untitled Item',
    subtitle: (record: any) => record.base_unit_cost ? `$${record.base_unit_cost}` : '',
    image: (record: any) => record.image_url,
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search catalog...',
  },

  filters: {
    quick: [
      { key: 'available', label: 'Available', query: { is_available: true } },
    ],
    advanced: ['category_id', 'is_available'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Items', query: { where: {} }, count: true },
        { key: 'available', label: 'Available', query: { where: { is_available: true } }, count: true },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table', 'list'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: {
        stats: [],
        blocks: [{ key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'base_unit_cost'] } }],
      }
    },
    form: {
      sections: [
        { key: 'basic', title: 'Item Info', fields: ['name', 'category_id', 'description', 'base_unit_cost'] },
        { key: 'media', title: 'Media & Inventory', fields: ['image_url', 'is_available'] },
      ]
    }
  },

  views: {
    grid: {
      titleField: 'name',
      subtitleField: 'base_unit_cost',
      imageField: 'image_url',
      cardFields: ['category_id'],
    },
    table: {
      columns: [
        'name',
        { field: 'category_id', format: { type: 'relation', entityType: 'category' } },
        { field: 'base_unit_cost', format: { type: 'currency' } },
        { field: 'is_available', format: { type: 'boolean' } },
      ],
    }
  },

  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: any) => `/productions/advancing/catalog/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'Add to Catalog', variant: 'primary', handler: { type: 'navigate', path: () => '/productions/advancing/catalog/new' } }],
  },

  relationships: {
    belongsTo: [
      { entity: 'advanceCategory', foreignKey: 'category_id', label: 'Category' },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
