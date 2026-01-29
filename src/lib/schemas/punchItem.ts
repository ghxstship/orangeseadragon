import { defineSchema } from '../schema/defineSchema';

export const punchItemSchema = defineSchema({
  identity: {
    name: 'punch_item',
    namePlural: 'Punch Items',
    slug: 'modules/operations/punch-items',
    icon: 'Pin',
    description: 'QC punch items and deficiency tracking',
  },

  data: {
    endpoint: '/api/punch-items',
    primaryKey: 'id',
    fields: {
      item_number: {
        type: 'text',
        label: 'Item #',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
        searchable: true,
      },
      title: {
        type: 'text',
        label: 'Title',
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
      production_id: {
        type: 'select',
        label: 'Production',
        inTable: true,
        inForm: true,
        options: [],
      },
      work_order_id: {
        type: 'select',
        label: 'Work Order',
        inForm: true,
        options: [],
      },
      inspection_id: {
        type: 'select',
        label: 'Inspection',
        inForm: true,
        options: [],
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Structural', value: 'structural' },
          { label: 'Electrical', value: 'electrical' },
          { label: 'Finish', value: 'finish' },
          { label: 'Safety', value: 'safety' },
          { label: 'Cosmetic', value: 'cosmetic' },
          { label: 'Functional', value: 'functional' },
          { label: 'Other', value: 'other' },
        ],
      },
      priority: {
        type: 'select',
        label: 'Priority',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Low', value: 'low', color: 'gray' },
          { label: 'Medium', value: 'medium', color: 'blue' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Critical', value: 'critical', color: 'red' },
        ],
        default: 'medium',
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Open', value: 'open', color: 'blue' },
          { label: 'In Progress', value: 'in_progress', color: 'yellow' },
          { label: 'Pending Review', value: 'pending_review', color: 'purple' },
          { label: 'Resolved', value: 'resolved', color: 'green' },
          { label: 'Deferred', value: 'deferred', color: 'gray' },
        ],
        default: 'open',
      },
      assigned_to_id: {
        type: 'select',
        label: 'Assigned To',
        inTable: true,
        inForm: true,
        options: [],
      },
      reported_by_id: {
        type: 'select',
        label: 'Reported By',
        inForm: true,
        options: [],
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      resolved_date: {
        type: 'date',
        label: 'Resolved Date',
        inDetail: true,
      },
      photo_url: {
        type: 'url',
        label: 'Photo',
        inForm: true,
        inDetail: true,
      },
      resolution_notes: {
        type: 'textarea',
        label: 'Resolution Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record: any) => record.title || record.item_number,
    subtitle: (record: any) => record.location || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        open: 'primary', in_progress: 'warning', pending_review: 'primary',
        resolved: 'success', deferred: 'secondary',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'due_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['item_number', 'title', 'description', 'location'],
    placeholder: 'Search punch items...',
  },

  filters: {
    quick: [
      { key: 'open', label: 'Open', query: { where: { status: 'open' } } },
      { key: 'overdue', label: 'Overdue', query: { where: { due_date: { lt: '{{now}}' }, status: { notIn: ['resolved', 'deferred'] } } } },
    ],
    advanced: ['status', 'priority', 'category', 'production_id', 'assigned_to_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Items', query: { where: {} }, count: true },
        { key: 'open', label: 'Open', query: { where: { status: { in: ['open', 'in_progress'] } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'resolution_notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['item_number', 'title', 'description', 'category'] },
        { key: 'relationships', title: 'Relationships', fields: ['production_id', 'work_order_id', 'inspection_id'] },
        { key: 'location', title: 'Location', fields: ['location', 'photo_url'] },
        { key: 'assignment', title: 'Assignment', fields: ['assigned_to_id', 'reported_by_id', 'due_date'] },
        { key: 'status', title: 'Status', fields: ['status', 'priority', 'resolved_date', 'resolution_notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['item_number', 'title', 'production_id', 'status', 'priority', 'assigned_to_id', 'due_date'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/modules/operations/punch-items/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Punch Item', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Punch Item') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
