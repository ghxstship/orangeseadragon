/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const dailySiteReportSchema = defineSchema({
  identity: {
    name: 'daily_site_report',
    namePlural: 'Daily Site Reports',
    slug: 'modules/operations/daily-reports',
    icon: 'FileText',
    description: 'Daily site reports and progress updates',
  },

  data: {
    endpoint: '/api/daily-site-reports',
    primaryKey: 'id',
    fields: {
      report_number: {
        type: 'text',
        label: 'Report #',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
        searchable: true,
      },
      report_date: {
        type: 'date',
        label: 'Report Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      production_id: {
        type: 'select',
        label: 'Production',
        required: true,
        inTable: true,
        inForm: true,
        options: [],
      },
      submitted_by_id: {
        type: 'select',
        label: 'Submitted By',
        inTable: true,
        inForm: true,
        options: [],
      },
      weather_conditions: {
        type: 'text',
        label: 'Weather',
        inForm: true,
        inDetail: true,
      },
      temperature_high: {
        type: 'number',
        label: 'High Temp (°F)',
        inForm: true,
      },
      temperature_low: {
        type: 'number',
        label: 'Low Temp (°F)',
        inForm: true,
      },
      crew_count: {
        type: 'number',
        label: 'Crew Count',
        inTable: true,
        inForm: true,
      },
      hours_worked: {
        type: 'number',
        label: 'Hours Worked',
        inTable: true,
        inForm: true,
      },
      work_completed: {
        type: 'textarea',
        label: 'Work Completed',
        inForm: true,
        inDetail: true,
      },
      work_planned: {
        type: 'textarea',
        label: 'Work Planned (Next Day)',
        inForm: true,
        inDetail: true,
      },
      delays: {
        type: 'textarea',
        label: 'Delays/Issues',
        inForm: true,
        inDetail: true,
      },
      safety_incidents: {
        type: 'textarea',
        label: 'Safety Incidents',
        inForm: true,
        inDetail: true,
      },
      visitor_log: {
        type: 'textarea',
        label: 'Visitor Log',
        inForm: true,
        inDetail: true,
      },
      materials_received: {
        type: 'textarea',
        label: 'Materials Received',
        inForm: true,
        inDetail: true,
      },
      equipment_on_site: {
        type: 'textarea',
        label: 'Equipment On Site',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Additional Notes',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Submitted', value: 'submitted', color: 'blue' },
          { label: 'Reviewed', value: 'reviewed', color: 'green' },
        ],
        default: 'draft',
      },
    },
  },

  display: {
    title: (record: any) => record.report_number,
    subtitle: (record: any) => record.report_date || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        draft: 'secondary', submitted: 'primary', reviewed: 'success',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'report_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['report_number', 'work_completed'],
    placeholder: 'Search reports...',
  },

  filters: {
    quick: [
      { key: 'today', label: 'Today', query: { where: { report_date: '{{today}}' } } },
      { key: 'this-week', label: 'This Week', query: { where: { report_date: { gte: '{{startOfWeek}}' } } } },
    ],
    advanced: ['status', 'production_id', 'submitted_by_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Reports', query: { where: {} }, count: true },
        { key: 'recent', label: 'Recent', query: { where: { report_date: { gte: '{{now - 7d}}' } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'photos', label: 'Photos', content: { type: 'related', entity: 'report_photos', foreignKey: 'report_id' } },
      ],
      overview: {
        stats: [
          { key: 'crew', label: 'Crew Count', value: { type: 'field', field: 'crew_count' }, format: 'number' },
          { key: 'hours', label: 'Hours Worked', value: { type: 'field', field: 'hours_worked' }, format: 'number' },
        ],
        blocks: [
          { key: 'work', title: 'Work Summary', content: { type: 'fields', fields: ['work_completed', 'work_planned', 'delays'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['report_number', 'report_date', 'production_id', 'submitted_by_id', 'status'] },
        { key: 'weather', title: 'Weather', fields: ['weather_conditions', 'temperature_high', 'temperature_low'] },
        { key: 'crew', title: 'Crew', fields: ['crew_count', 'hours_worked'] },
        { key: 'work', title: 'Work Summary', fields: ['work_completed', 'work_planned', 'delays'] },
        { key: 'safety', title: 'Safety & Visitors', fields: ['safety_incidents', 'visitor_log'] },
        { key: 'materials', title: 'Materials & Equipment', fields: ['materials_received', 'equipment_on_site'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['report_number', 'report_date', 'production_id', 'crew_count', 'hours_worked', 'status', 'submitted_by_id'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/operations/daily-reports/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Report', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Report') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
