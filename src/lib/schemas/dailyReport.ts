import { defineSchema } from '../schema/defineSchema';

/**
 * DAILY REPORT ENTITY SCHEMA (SSOT)
 */
export const dailyReportSchema = defineSchema({
  identity: {
    name: 'Daily Report',
    namePlural: 'Daily Reports',
    slug: 'operations/comms/daily-reports',
    icon: 'FileText',
    description: 'End-of-day summaries and reports',
  },

  data: {
    endpoint: '/api/daily-reports',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
      },
      report_date: {
        type: 'date',
        label: 'Report Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      weather_conditions: {
        type: 'text',
        label: 'Weather',
        inTable: true,
        inForm: true,
      },
      attendance: {
        type: 'number',
        label: 'Attendance',
        inTable: true,
        inForm: true,
      },
      highlights: {
        type: 'textarea',
        label: 'Highlights',
        inForm: true,
        inDetail: true,
      },
      issues: {
        type: 'textarea',
        label: 'Issues',
        inForm: true,
        inDetail: true,
      },
      incidents_count: {
        type: 'number',
        label: 'Incidents',
        inTable: true,
        inForm: true,
      },
      medical_count: {
        type: 'number',
        label: 'Medical',
        inForm: true,
        inDetail: true,
      },
      ejections_count: {
        type: 'number',
        label: 'Ejections',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      submitted_by: {
        type: 'relation',
        label: 'Submitted By',
        inTable: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Submitted', value: 'submitted' },
          { label: 'Approved', value: 'approved' },
        ],
      },
    },
  },

  display: {
    title: (record) => record.title || 'Daily Report',
    subtitle: (record) => record.report_date || '',
    badge: (record) => {
      if (record.status === 'approved') return { label: 'Approved', variant: 'success' };
      if (record.status === 'submitted') return { label: 'Submitted', variant: 'default' };
      return { label: 'Draft', variant: 'secondary' };
    },
    defaultSort: { field: 'report_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'highlights', 'issues'],
    placeholder: 'Search reports...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'draft', label: 'Drafts', query: { where: { status: 'draft' } } },
    ],
    advanced: ['status', 'event_id', 'report_date'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Reports', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'incidents', label: 'Incidents', content: { type: 'related', entity: 'incidents', foreignKey: 'daily_report_id' } },
      ],
      overview: {
        stats: [],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Report Details',
          fields: ['title', 'event_id', 'report_date', 'status'],
        },
        {
          key: 'conditions',
          title: 'Conditions',
          fields: ['weather_conditions', 'attendance'],
        },
        {
          key: 'summary',
          title: 'Summary',
          fields: ['highlights', 'issues'],
        },
        {
          key: 'stats',
          title: 'Statistics',
          fields: ['incidents_count', 'medical_count', 'ejections_count', 'notes'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['title', 'event_id', 'report_date', 'attendance', 'incidents_count', 'status'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/operations/comms/daily-reports/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/operations/comms/daily-reports/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Report', variant: 'primary', handler: { type: 'navigate', path: () => '/operations/comms/daily-reports/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
