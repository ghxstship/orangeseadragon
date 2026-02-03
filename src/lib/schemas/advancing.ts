import { defineSchema } from '../schema/defineSchema';

export const productionAdvanceSchema = defineSchema({
  identity: {
    name: 'productionAdvance',
    namePlural: 'Production Advances',
    slug: 'advancing/advances',
    icon: 'ClipboardList',
    description: 'Production advance coordination by event',
  },
  data: {
    endpoint: '/api/advancing/advances',
    table: 'production_advances',
    primaryKey: 'id',
    fields: {
      advanceCode: { type: 'text', label: 'Advance Code', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'relation', label: 'Event', required: true, inTable: true, inForm: true, relation: { table: 'events', labelField: 'name' } },
      advanceType: {
        type: 'select', label: 'Type', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Pre-Event', value: 'pre_event', color: 'blue' },
          { label: 'Load-In', value: 'load_in', color: 'purple' },
          { label: 'Show Day', value: 'show_day', color: 'green' },
          { label: 'Strike', value: 'strike', color: 'orange' },
          { label: 'Post-Event', value: 'post_event', color: 'gray' },
        ],
      },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
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
        type: 'select', label: 'Priority', inTable: true, inForm: true,
        options: [
          { label: 'Critical', value: 'critical', color: 'red' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Medium', value: 'medium', color: 'yellow' },
          { label: 'Low', value: 'low', color: 'gray' },
        ],
        default: 'medium',
      },
      dueDate: { type: 'datetime', label: 'Due Date', inTable: true, inForm: true, sortable: true },
      completedDate: { type: 'datetime', label: 'Completed Date', inDetail: true },
      assignedTo: { type: 'relation', label: 'Assigned To', inTable: true, inForm: true, relation: { table: 'users', labelField: 'full_name' } },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.advanceCode || 'Untitled'),
    subtitle: (record: Record<string, unknown>) => String(record.advanceType || ''),
    badge: (record: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        draft: { label: 'Draft', variant: 'secondary' },
        in_progress: { label: 'In Progress', variant: 'warning' },
        pending_approval: { label: 'Pending Approval', variant: 'warning' },
        approved: { label: 'Approved', variant: 'success' },
        completed: { label: 'Completed', variant: 'success' },
        cancelled: { label: 'Cancelled', variant: 'destructive' },
      };
      return statusMap[String(record.status)] || { label: 'Unknown', variant: 'secondary' };
    },
    defaultSort: { field: 'dueDate', direction: 'asc' },
  },
  search: { enabled: true, fields: ['advanceCode', 'notes'], placeholder: 'Search advances...' },
  filters: {
    quick: [
      { key: 'in_progress', label: 'In Progress', query: { where: { status: 'in_progress' } } },
      { key: 'pending', label: 'Pending Approval', query: { where: { status: 'pending_approval' } } },
    ],
    advanced: ['status', 'advanceType', 'priority', 'eventId', 'assignedTo'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: { $in: ['draft', 'in_progress', 'pending_approval'] } } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Items', content: { type: 'relation', entity: 'advanceItem', filter: { productionAdvanceId: '$id' } } },
      ],
      overview: {
        stats: [
          { key: 'totalItems', label: 'Total Items', value: { type: 'count', relation: 'advance_items' } },
          { key: 'completedItems', label: 'Completed', value: { type: 'count', relation: 'advance_items', filter: { status: 'complete' } } },
        ],
        blocks: [{ key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } }],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Advance Details', fields: ['advanceCode', 'eventId', 'advanceType', 'status', 'priority'] },
        { key: 'schedule', title: 'Schedule', fields: ['dueDate', 'assignedTo'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },
  views: {
    table: { columns: ['advanceCode', 'eventId', 'advanceType', 'status', 'priority', 'dueDate', 'assignedTo'] },
    kanban: { groupBy: 'status', cardTitle: 'advanceCode', cardSubtitle: 'eventId' },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/advancing/advances/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'modal', modal: 'edit' } },
    ],
    bulk: [
      { key: 'updateStatus', label: 'Update Status', handler: { type: 'modal', modal: 'bulkStatus' } },
    ],
    global: [{ key: 'create', label: 'New Advance', variant: 'primary', handler: { type: 'modal', modal: 'create' } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});

export const advanceItemSchema = defineSchema({
  identity: {
    name: 'advanceItem',
    namePlural: 'Advance Items',
    slug: 'advancing/items',
    icon: 'Package',
    description: 'Individual advance line items',
  },
  data: {
    endpoint: '/api/advancing/items',
    table: 'advance_items',
    primaryKey: 'id',
    fields: {
      itemName: { type: 'text', label: 'Item Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      productionAdvanceId: { type: 'relation', label: 'Advance', required: true, inForm: true, relation: { table: 'production_advances', labelField: 'advance_code' } },
      categoryId: { type: 'relation', label: 'Category', inTable: true, inForm: true, relation: { table: 'advance_categories', labelField: 'name' } },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      specifications: { type: 'json', label: 'Specifications', inForm: true, inDetail: true },
      vendorId: { type: 'relation', label: 'Vendor', inTable: true, inForm: true, relation: { table: 'companies', labelField: 'name', filter: { companyType: 'vendor' } } },
      quantityRequired: { type: 'number', label: 'Qty Required', inTable: true, inForm: true, default: 1 },
      quantityConfirmed: { type: 'number', label: 'Qty Confirmed', inTable: true, inForm: true, default: 0 },
      unitCost: { type: 'currency', label: 'Unit Cost', inTable: true, inForm: true },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'gray' },
          { label: 'Requested', value: 'requested', color: 'blue' },
          { label: 'Confirmed', value: 'confirmed', color: 'cyan' },
          { label: 'In Transit', value: 'in_transit', color: 'purple' },
          { label: 'Delivered', value: 'delivered', color: 'green' },
          { label: 'Installed', value: 'installed', color: 'emerald' },
          { label: 'Tested', value: 'tested', color: 'teal' },
          { label: 'Complete', value: 'complete', color: 'emerald' },
          { label: 'Struck', value: 'struck', color: 'orange' },
          { label: 'Returned', value: 'returned', color: 'gray' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
        ],
        default: 'pending',
      },
      scheduledDelivery: { type: 'datetime', label: 'Scheduled Delivery', inTable: true, inForm: true, sortable: true },
      actualDelivery: { type: 'datetime', label: 'Actual Delivery', inDetail: true },
      loadInTime: { type: 'datetime', label: 'Load-In Time', inForm: true },
      strikeTime: { type: 'datetime', label: 'Strike Time', inForm: true },
      location: { type: 'text', label: 'Location', inTable: true, inForm: true },
      isCriticalPath: { type: 'boolean', label: 'Critical Path', inTable: true, inForm: true, default: false },
      assignedTo: { type: 'relation', label: 'Assigned To', inTable: true, inForm: true, relation: { table: 'users', labelField: 'full_name' } },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
    computed: {
      totalCost: { type: 'currency', label: 'Total Cost', formula: 'quantityRequired * unitCost' },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.itemName || 'Untitled'),
    subtitle: (record: Record<string, unknown>) => String(record.vendorId || ''),
    badge: (record: Record<string, unknown>) => {
      if (record.isCriticalPath) return { label: 'Critical', variant: 'destructive' };
      const statusMap: Record<string, { label: string; variant: string }> = {
        pending: { label: 'Pending', variant: 'secondary' },
        confirmed: { label: 'Confirmed', variant: 'success' },
        in_transit: { label: 'In Transit', variant: 'warning' },
        delivered: { label: 'Delivered', variant: 'success' },
        complete: { label: 'Complete', variant: 'success' },
      };
      return statusMap[String(record.status)] || { label: String(record.status), variant: 'secondary' };
    },
    defaultSort: { field: 'scheduledDelivery', direction: 'asc' },
  },
  search: { enabled: true, fields: ['itemName', 'description', 'notes'], placeholder: 'Search items...' },
  filters: {
    quick: [
      { key: 'critical', label: 'Critical Path', query: { where: { isCriticalPath: true } } },
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
    ],
    advanced: ['status', 'categoryId', 'vendorId', 'isCriticalPath', 'assignedTo'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'technical', label: 'Technical', query: { where: { 'categoryId.code': { $like: 'technical%' } } }, count: true },
        { key: 'logistics', label: 'Logistics', query: { where: { 'categoryId.code': { $like: 'logistics%' } } }, count: true },
        { key: 'hospitality', label: 'Hospitality', query: { where: { 'categoryId.code': { $like: 'hospitality%' } } }, count: true },
        { key: 'staffing', label: 'Staffing', query: { where: { 'categoryId.code': { $like: 'staffing%' } } }, count: true },
        { key: 'safety', label: 'Safety', query: { where: { 'categoryId.code': { $like: 'safety%' } } }, count: true },
        { key: 'marketing', label: 'Marketing', query: { where: { 'categoryId.code': { $like: 'marketing%' } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'timeline'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'fulfillment', label: 'Fulfillment', content: { type: 'relation', entity: 'advanceItemFulfillment', filter: { advanceItemId: '$id' } } },
      ],
      overview: {
        stats: [
          { key: 'totalCost', label: 'Total Cost', value: { type: 'computed', field: 'totalCost' } },
        ],
        blocks: [
          { key: 'specs', title: 'Specifications', content: { type: 'json', field: 'specifications' } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Item Details', fields: ['itemName', 'productionAdvanceId', 'categoryId', 'description'] },
        { key: 'vendor', title: 'Vendor & Cost', fields: ['vendorId', 'quantityRequired', 'quantityConfirmed', 'unitCost'] },
        { key: 'schedule', title: 'Schedule', fields: ['scheduledDelivery', 'loadInTime', 'strikeTime', 'location'] },
        { key: 'assignment', title: 'Assignment', fields: ['status', 'assignedTo', 'isCriticalPath'] },
        { key: 'details', title: 'Details', fields: ['specifications', 'notes'] },
      ],
    },
  },
  views: {
    table: { columns: ['itemName', 'categoryId', 'vendorId', 'status', 'scheduledDelivery', 'location', 'isCriticalPath'] },
    kanban: { groupBy: 'status', cardTitle: 'itemName', cardSubtitle: 'vendorId' },
    timeline: { startField: 'scheduledDelivery', endField: 'strikeTime', titleField: 'itemName' },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/advancing/items/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'modal', modal: 'edit' } },
      { key: 'updateStatus', label: 'Update Status', handler: { type: 'modal', modal: 'statusUpdate' } },
    ],
    bulk: [
      { key: 'updateStatus', label: 'Update Status', handler: { type: 'modal', modal: 'bulkStatus' } },
    ],
    global: [{ key: 'create', label: 'New Item', variant: 'primary', handler: { type: 'modal', modal: 'create' } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});

export const advanceItemFulfillmentSchema = defineSchema({
  identity: {
    name: 'advanceItemFulfillment',
    namePlural: 'Fulfillment Stages',
    slug: 'advancing/fulfillment',
    icon: 'Truck',
    description: 'Fulfillment stage tracking for advance items',
  },
  data: {
    endpoint: '/api/advancing/fulfillment',
    table: 'advance_item_fulfillment',
    primaryKey: 'id',
    fields: {
      advanceItemId: { type: 'relation', label: 'Advance Item', required: true, inTable: true, inForm: true, relation: { table: 'advance_items', labelField: 'item_name' } },
      fulfillmentStage: {
        type: 'select', label: 'Stage', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Requested', value: 'requested', color: 'gray' },
          { label: 'Quoted', value: 'quoted', color: 'blue' },
          { label: 'Ordered', value: 'ordered', color: 'cyan' },
          { label: 'Confirmed', value: 'confirmed', color: 'teal' },
          { label: 'In Production', value: 'in_production', color: 'purple' },
          { label: 'Shipped', value: 'shipped', color: 'indigo' },
          { label: 'In Transit', value: 'in_transit', color: 'violet' },
          { label: 'Delivered', value: 'delivered', color: 'green' },
          { label: 'Inspected', value: 'inspected', color: 'lime' },
          { label: 'Installed', value: 'installed', color: 'emerald' },
          { label: 'Tested', value: 'tested', color: 'teal' },
          { label: 'Operational', value: 'operational', color: 'green' },
          { label: 'Struck', value: 'struck', color: 'orange' },
          { label: 'Returned', value: 'returned', color: 'gray' },
          { label: 'Complete', value: 'complete', color: 'emerald' },
        ],
      },
      stageEnteredAt: { type: 'datetime', label: 'Stage Entered', inTable: true, sortable: true },
      expectedCompletion: { type: 'datetime', label: 'Expected Completion', inTable: true, inForm: true },
      actualCompletion: { type: 'datetime', label: 'Actual Completion', inTable: true },
      percentageComplete: { type: 'number', label: '% Complete', inTable: true, inForm: true, min: 0, max: 100 },
      assignedTo: { type: 'relation', label: 'Assigned To', inTable: true, inForm: true, relation: { table: 'users', labelField: 'full_name' } },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
      evidence: { type: 'json', label: 'Evidence', inDetail: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.fulfillmentStage || 'Unknown Stage'),
    subtitle: (record: Record<string, unknown>) => `${record.percentageComplete || 0}% complete`,
    badge: (record: Record<string, unknown>) => {
      const pct = Number(record.percentageComplete) || 0;
      if (pct === 100) return { label: 'Complete', variant: 'success' };
      if (pct > 0) return { label: `${pct}%`, variant: 'warning' };
      return { label: 'Not Started', variant: 'secondary' };
    },
    defaultSort: { field: 'stageEnteredAt', direction: 'desc' },
  },
  search: { enabled: true, fields: ['notes'], placeholder: 'Search fulfillment...' },
  filters: {
    quick: [
      { key: 'incomplete', label: 'Incomplete', query: { where: { actualCompletion: null } } },
    ],
    advanced: ['fulfillmentStage', 'assignedTo'],
  },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Stages', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: {
        stats: [],
        blocks: [
          { key: 'evidence', title: 'Evidence', content: { type: 'json', field: 'evidence' } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'stage', title: 'Stage Details', fields: ['advanceItemId', 'fulfillmentStage', 'percentageComplete'] },
        { key: 'schedule', title: 'Schedule', fields: ['expectedCompletion', 'assignedTo'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },
  views: {
    table: { columns: ['advanceItemId', 'fulfillmentStage', 'percentageComplete', 'expectedCompletion', 'actualCompletion', 'assignedTo'] },
  },
  actions: {
    row: [
      { key: 'complete', label: 'Mark Complete', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [{ key: 'create', label: 'Add Stage', variant: 'primary', handler: { type: 'modal', modal: 'create' } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});

export const vendorRatingSchema = defineSchema({
  identity: {
    name: 'vendorRating',
    namePlural: 'Vendor Ratings',
    slug: 'advancing/vendors/performance',
    icon: 'Star',
    description: 'Vendor performance ratings and feedback',
  },
  data: {
    endpoint: '/api/advancing/vendors/ratings',
    table: 'vendor_ratings',
    primaryKey: 'id',
    fields: {
      vendorId: { type: 'relation', label: 'Vendor', required: true, inTable: true, inForm: true, relation: { table: 'companies', labelField: 'name', filter: { companyType: 'vendor' } } },
      advanceItemId: { type: 'relation', label: 'Advance Item', inTable: true, inForm: true, relation: { table: 'advance_items', labelField: 'item_name' } },
      eventId: { type: 'relation', label: 'Event', inTable: true, inForm: true, relation: { table: 'events', labelField: 'name' } },
      onTimeDelivery: { type: 'boolean', label: 'On-Time Delivery', inTable: true, inForm: true },
      qualityRating: { type: 'rating', label: 'Quality', inTable: true, inForm: true, min: 1, max: 5 },
      communicationRating: { type: 'rating', label: 'Communication', inTable: true, inForm: true, min: 1, max: 5 },
      professionalismRating: { type: 'rating', label: 'Professionalism', inForm: true, min: 1, max: 5 },
      valueRating: { type: 'rating', label: 'Value', inForm: true, min: 1, max: 5 },
      overallRating: { type: 'rating', label: 'Overall', inTable: true, inForm: true, min: 1, max: 5 },
      wouldRecommend: { type: 'boolean', label: 'Would Recommend', inTable: true, inForm: true },
      issuesEncountered: { type: 'textarea', label: 'Issues Encountered', inForm: true, inDetail: true },
      positiveFeedback: { type: 'textarea', label: 'Positive Feedback', inForm: true, inDetail: true },
      improvementSuggestions: { type: 'textarea', label: 'Improvement Suggestions', inForm: true, inDetail: true },
      ratedAt: { type: 'datetime', label: 'Rated At', inTable: true, sortable: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.vendorId || 'Unknown Vendor'),
    subtitle: (record: Record<string, unknown>) => `${record.overallRating || 0}/5`,
    badge: (record: Record<string, unknown>) => {
      const rating = Number(record.overallRating) || 0;
      if (rating >= 4) return { label: `${rating}/5`, variant: 'success' };
      if (rating >= 3) return { label: `${rating}/5`, variant: 'warning' };
      return { label: `${rating}/5`, variant: 'destructive' };
    },
    defaultSort: { field: 'ratedAt', direction: 'desc' },
  },
  search: { enabled: true, fields: ['issuesEncountered', 'positiveFeedback'], placeholder: 'Search ratings...' },
  filters: {
    quick: [
      { key: 'recommended', label: 'Recommended', query: { where: { wouldRecommend: true } } },
    ],
    advanced: ['vendorId', 'eventId', 'overallRating', 'onTimeDelivery'],
  },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Ratings', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: {
        stats: [],
        blocks: [
          { key: 'feedback', title: 'Feedback', content: { type: 'fields', fields: ['positiveFeedback', 'issuesEncountered', 'improvementSuggestions'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'context', title: 'Context', fields: ['vendorId', 'advanceItemId', 'eventId'] },
        { key: 'ratings', title: 'Ratings', fields: ['overallRating', 'qualityRating', 'communicationRating', 'professionalismRating', 'valueRating'] },
        { key: 'delivery', title: 'Delivery', fields: ['onTimeDelivery', 'wouldRecommend'] },
        { key: 'feedback', title: 'Feedback', fields: ['positiveFeedback', 'issuesEncountered', 'improvementSuggestions'] },
      ],
    },
  },
  views: {
    table: { columns: ['vendorId', 'eventId', 'overallRating', 'qualityRating', 'communicationRating', 'onTimeDelivery', 'wouldRecommend', 'ratedAt'] },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/advancing/vendors/performance/${r.id}` } },
    ],
    bulk: [],
    global: [{ key: 'create', label: 'Add Rating', variant: 'primary', handler: { type: 'modal', modal: 'create' } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});

export const advanceCategorySchema = defineSchema({
  identity: {
    name: 'advanceCategory',
    namePlural: 'Advance Categories',
    slug: 'advancing/categories',
    icon: 'FolderTree',
    description: 'Categories for advance items',
  },
  data: {
    endpoint: '/api/advancing/categories',
    table: 'advance_categories',
    primaryKey: 'id',
    fields: {
      code: { type: 'text', label: 'Code', required: true, inTable: true, inForm: true, sortable: true },
      name: { type: 'text', label: 'Name', required: true, inTable: true, inForm: true, searchable: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      parentCategoryId: { type: 'relation', label: 'Parent Category', inTable: true, inForm: true, relation: { table: 'advance_categories', labelField: 'name' } },
      icon: { type: 'text', label: 'Icon', inForm: true },
      color: { type: 'color', label: 'Color', inTable: true, inForm: true },
      sortOrder: { type: 'number', label: 'Sort Order', inForm: true, default: 0 },
      isActive: { type: 'boolean', label: 'Active', inTable: true, inForm: true, default: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled'),
    subtitle: (record: Record<string, unknown>) => String(record.code || ''),
    badge: (record: Record<string, unknown>) => {
      return record.isActive ? { label: 'Active', variant: 'success' } : { label: 'Inactive', variant: 'secondary' };
    },
    defaultSort: { field: 'sortOrder', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'code', 'description'], placeholder: 'Search categories...' },
  filters: {
    quick: [{ key: 'active', label: 'Active', query: { where: { isActive: true } } }],
    advanced: ['isActive', 'parentCategoryId'],
  },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Categories', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table', 'tree'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: {
        stats: [],
        blocks: [{ key: 'description', title: 'Description', content: { type: 'fields', fields: ['description'] } }],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Category Details', fields: ['code', 'name', 'description', 'parentCategoryId'] },
        { key: 'display', title: 'Display', fields: ['icon', 'color', 'sortOrder', 'isActive'] },
      ],
    },
  },
  views: {
    table: { columns: ['name', 'code', 'parentCategoryId', 'color', 'isActive'] },
    tree: { parentField: 'parentCategoryId', labelField: 'name' },
  },
  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'modal', modal: 'edit' } },
    ],
    bulk: [],
    global: [{ key: 'create', label: 'New Category', variant: 'primary', handler: { type: 'modal', modal: 'create' } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
