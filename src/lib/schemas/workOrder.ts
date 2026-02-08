/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const workOrderSchema = defineSchema({
  identity: {
    name: 'work_order',
    namePlural: 'Work Orders',
    slug: 'modules/operations/work-orders',
    icon: 'Wrench',
    description: 'Installation, strike, and maintenance work orders',
  },

  data: {
    endpoint: '/api/work-orders',
    primaryKey: 'id',
    fields: {
      work_order_number: {
        type: 'text',
        label: 'Work Order #',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      work_order_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Install', value: 'install', color: 'blue' },
          { label: 'Strike', value: 'strike', color: 'orange' },
          { label: 'Maintenance', value: 'maintenance', color: 'purple' },
          { label: 'Repair', value: 'repair', color: 'red' },
          { label: 'Inspection', value: 'inspection', color: 'cyan' },
        ],
      },
      production_id: {
        type: 'select',
        label: 'Production',
        inTable: true,
        inForm: true,
        options: [],
      },
      event_id: {
        type: 'select',
        label: 'Event',
        inForm: true,
        options: [],
      },
      venue_id: {
        type: 'select',
        label: 'Venue',
        inTable: true,
        inForm: true,
        options: [],
      },
      scheduled_start: {
        type: 'datetime',
        label: 'Scheduled Start',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      scheduled_end: {
        type: 'datetime',
        label: 'Scheduled End',
        inForm: true,
      },
      actual_start: {
        type: 'datetime',
        label: 'Actual Start',
        inDetail: true,
      },
      actual_end: {
        type: 'datetime',
        label: 'Actual End',
        inDetail: true,
      },
      crew_lead_id: {
        type: 'select',
        label: 'Crew Lead',
        inTable: true,
        inForm: true,
        options: [],
      },
      crew_size: {
        type: 'number',
        label: 'Crew Size',
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
          { label: 'Scheduled', value: 'scheduled', color: 'blue' },
          { label: 'In Progress', value: 'in_progress', color: 'yellow' },
          { label: 'On Hold', value: 'on_hold', color: 'orange' },
          { label: 'Completed', value: 'completed', color: 'green' },
          { label: 'Verified', value: 'verified', color: 'emerald' },
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
          { label: 'Low', value: 'low', color: 'gray' },
          { label: 'Medium', value: 'medium', color: 'blue' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Urgent', value: 'urgent', color: 'red' },
        ],
        default: 'medium',
      },
      completion_percentage: {
        type: 'number',
        label: 'Completion %',
        inTable: true,
        inDetail: true,
      },
      scope_of_work: {
        type: 'textarea',
        label: 'Scope of Work',
        inForm: true,
        inDetail: true,
      },
      special_requirements: {
        type: 'textarea',
        label: 'Special Requirements',
        inForm: true,
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
    title: (record: any) => record.name || record.work_order_number,
    subtitle: (record: any) => record.work_order_type || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        draft: 'secondary', scheduled: 'primary', in_progress: 'warning',
        on_hold: 'warning', completed: 'success', verified: 'success', cancelled: 'destructive',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'scheduled_start', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['work_order_number', 'name', 'description'],
    placeholder: 'Search work orders...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: { in: ['scheduled', 'in_progress'] } } } },
      { key: 'today', label: 'Today', query: { where: { scheduled_start: { gte: '{{startOfDay}}', lt: '{{endOfDay}}' } } } },
    ],
    advanced: ['status', 'work_order_type', 'priority', 'production_id', 'crew_lead_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Work Orders', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: { in: ['scheduled', 'in_progress'] } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'calendar', 'list', 'timeline'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'crew', label: 'Crew', content: { type: 'related', entity: 'crew_assignments', foreignKey: 'work_order_id' } },
        { key: 'punch-items', label: 'Punch Items', content: { type: 'related', entity: 'punch_items', foreignKey: 'work_order_id' } },
      ],
      overview: {
        stats: [
          { key: 'completion', label: 'Completion', value: { type: 'field', field: 'completion_percentage' }, format: 'percentage' },
          { key: 'crew_size', label: 'Crew Size', value: { type: 'field', field: 'crew_size' }, format: 'number' },
        ],
        blocks: [
          { key: 'scope', title: 'Scope of Work', content: { type: 'fields', fields: ['scope_of_work', 'special_requirements'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['work_order_number', 'name', 'description', 'work_order_type'] },
        { key: 'relationships', title: 'Relationships', fields: ['production_id', 'event_id', 'venue_id'] },
        { key: 'schedule', title: 'Schedule', fields: ['scheduled_start', 'scheduled_end', 'crew_lead_id', 'crew_size'] },
        { key: 'status', title: 'Status', fields: ['status', 'priority', 'completion_percentage'] },
        { key: 'details', title: 'Details', fields: ['scope_of_work', 'special_requirements', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['work_order_number', 'name', 'work_order_type', 'production_id', 'status', 'scheduled_start', 'crew_lead_id'],
    },
    list: {
      titleField: 'name',
      subtitleField: 'work_order_type',
      metaFields: ['scheduled_start', 'crew_lead_id'],
      showChevron: true,
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'draft', label: 'Draft', color: 'gray' },
        { value: 'scheduled', label: 'Scheduled', color: 'blue' },
        { value: 'in_progress', label: 'In Progress', color: 'yellow' },
        { value: 'on_hold', label: 'On Hold', color: 'orange' },
        { value: 'completed', label: 'Completed', color: 'green' },
        { value: 'verified', label: 'Verified', color: 'emerald' },
      ],
      card: {
        title: 'name',
        subtitle: 'work_order_type',
        fields: ['scheduled_start', 'priority'],
      },
    },
    calendar: {
      titleField: 'name',
      startField: 'scheduled_start',
      endField: 'scheduled_end',
      colorField: 'status',
    },
    timeline: {
      titleField: 'name',
      startField: 'scheduled_start',
      endField: 'scheduled_end',
      groupField: 'work_order_type',
      progressField: 'completion_percentage',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/operations/work-orders/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Work Order', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Work Order') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
