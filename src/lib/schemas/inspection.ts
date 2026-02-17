/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const inspectionSchema = defineSchema({
  identity: {
    name: 'inspection',
    namePlural: 'Inspections',
    slug: 'modules/operations/inspections',
    icon: 'Search',
    description: 'QC, safety, and regulatory inspections',
  },

  data: {
    endpoint: '/api/inspections',
    primaryKey: 'id',
    fields: {
      inspection_number: {
        type: 'text',
        label: 'Inspection #',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
        searchable: true,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      inspection_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'QC', value: 'qc', color: 'blue' },
          { label: 'Safety', value: 'safety', color: 'orange' },
          { label: 'Client Walkthrough', value: 'client_walkthrough', color: 'purple' },
          { label: 'Final Signoff', value: 'final_signoff', color: 'green' },
          { label: 'Regulatory', value: 'regulatory', color: 'red' },
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
        type: 'relation',
        label: 'Event',
        inForm: true,
      },
      work_order_id: {
        type: 'relation',
        label: 'Work Order',
        inForm: true,
        relation: { entity: 'workOrder', display: 'work_order_number' },
      },
      scheduled_date: {
        type: 'date',
        label: 'Scheduled Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      scheduled_time: {
        type: 'time',
        label: 'Scheduled Time',
        inForm: true,
      },
      actual_date: {
        type: 'date',
        label: 'Actual Date',
        inDetail: true,
      },
      inspector_id: {
        type: 'select',
        label: 'Inspector',
        inTable: true,
        inForm: true,
        options: [],
      },
      inspector_name: {
        type: 'text',
        label: 'Inspector Name',
        inForm: true,
      },
      inspector_company: {
        type: 'text',
        label: 'Inspector Company',
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Scheduled', value: 'scheduled', color: 'blue' },
          { label: 'In Progress', value: 'in_progress', color: 'yellow' },
          { label: 'Passed', value: 'passed', color: 'green' },
          { label: 'Failed', value: 'failed', color: 'red' },
          { label: 'Conditional', value: 'conditional', color: 'orange' },
          { label: 'Cancelled', value: 'cancelled', color: 'gray' },
        ],
        default: 'scheduled',
      },
      result: {
        type: 'text',
        label: 'Result',
        inDetail: true,
      },
      findings: {
        type: 'textarea',
        label: 'Findings',
        inForm: true,
        inDetail: true,
      },
      recommendations: {
        type: 'textarea',
        label: 'Recommendations',
        inForm: true,
        inDetail: true,
      },
      report_url: {
        type: 'url',
        label: 'Report URL',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record: any) => record.name || record.inspection_number,
    subtitle: (record: any) => record.inspection_type || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        scheduled: 'primary', in_progress: 'warning', passed: 'success',
        failed: 'destructive', conditional: 'warning', cancelled: 'secondary',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'scheduled_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['inspection_number', 'name', 'inspector_name'],
    placeholder: 'Search inspections...',
  },

  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: { status: 'scheduled' } } },
      { key: 'failed', label: 'Failed', query: { where: { status: 'failed' } } },
    ],
    advanced: ['status', 'inspection_type', 'production_id', 'inspector_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Inspections', query: { where: {} }, count: true },
        { key: 'upcoming', label: 'Upcoming', query: { where: { status: 'scheduled' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'calendar', 'list', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'punch-items', label: 'Punch Items', content: { type: 'related', entity: 'punch_items', foreignKey: 'inspection_id' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'findings', title: 'Findings & Recommendations', content: { type: 'fields', fields: ['findings', 'recommendations'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['inspection_number', 'name', 'inspection_type', 'status'] },
        { key: 'relationships', title: 'Relationships', fields: ['production_id', 'event_id', 'work_order_id'] },
        { key: 'schedule', title: 'Schedule', fields: ['scheduled_date', 'scheduled_time', 'actual_date'] },
        { key: 'inspector', title: 'Inspector', fields: ['inspector_id', 'inspector_name', 'inspector_company'] },
        { key: 'results', title: 'Results', fields: ['result', 'findings', 'recommendations', 'report_url'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'inspection_number',
        'name',
        'inspection_type',
        { field: 'production_id', format: { type: 'relation', entityType: 'project' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        { field: 'scheduled_date', format: { type: 'date' } },
        { field: 'inspector_id', format: { type: 'relation', entityType: 'person' } },
      ],
    },
    list: {
      titleField: 'name',
      subtitleField: 'inspection_type',
      metaFields: ['scheduled_date', 'inspector_id'],
      showChevron: true,
    },
    calendar: {
      titleField: 'name',
      startField: 'scheduled_date',
      colorField: 'status',
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'scheduled', label: 'Scheduled', color: 'blue' },
        { value: 'in_progress', label: 'In Progress', color: 'yellow' },
        { value: 'passed', label: 'Passed', color: 'green' },
        { value: 'failed', label: 'Failed', color: 'red' },
        { value: 'conditional', label: 'Conditional', color: 'orange' },
      ],
      card: {
        title: 'name',
        subtitle: 'inspection_type',
        fields: ['scheduled_date', 'inspector_id'],
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/operations/inspections/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Inspection', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'workOrder', foreignKey: 'work_order_id', label: 'Work Order' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
