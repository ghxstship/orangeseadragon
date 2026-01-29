import { defineSchema } from '../schema/defineSchema';

export const roadmapSchema = defineSchema({
  identity: {
    name: 'roadmap',
    namePlural: 'Roadmaps',
    slug: 'modules/projects/roadmaps',
    icon: 'Route',
    description: 'Strategic roadmaps and timeline planning',
  },
  data: {
    endpoint: '/api/roadmaps',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Roadmap Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      projectId: { type: 'select', label: 'Project', inTable: true, inForm: true, options: [] },
      timeframe: {
        type: 'select', label: 'Timeframe', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Quarterly', value: 'quarterly', color: 'blue' },
          { label: 'Yearly', value: 'yearly', color: 'green' },
          { label: 'Multi-Year', value: 'multi-year', color: 'purple' },
        ],
        default: 'quarterly',
      },
      startDate: { type: 'date', label: 'Start Date', required: true, inTable: true, inForm: true, sortable: true },
      endDate: { type: 'date', label: 'End Date', required: true, inTable: true, inForm: true, sortable: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      isPublic: { type: 'switch', label: 'Public Roadmap', inForm: true, inTable: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Roadmap'),
    subtitle: (record: Record<string, unknown>) => String(record.timeframe),
    badge: (record: Record<string, unknown>) => record.isPublic ? { label: 'Public', variant: 'success' } : { label: 'Private', variant: 'secondary' },
    defaultSort: { field: 'startDate', direction: 'desc' },
  },
  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search roadmaps...' },
  filters: { quick: [], advanced: ['timeframe', 'projectId'] },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Roadmaps', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [{ key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description'] } }] },
    },
    form: { sections: [{ key: 'basic', title: 'Roadmap Details', fields: ['name', 'projectId', 'timeframe', 'startDate', 'endDate', 'description', 'isPublic'] }] },
  },
  views: { table: { columns: ['name', 'projectId', 'timeframe', 'startDate', 'endDate', 'isPublic'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/projects/roadmaps/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Roadmap', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
