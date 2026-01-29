import { defineSchema } from '../schema/defineSchema';

export const runsheetSchema = defineSchema({
  identity: {
    name: 'runsheet',
    namePlural: 'Runsheets',
    slug: 'modules/production/runsheets',
    icon: 'ScrollText',
    description: 'Event runsheets and schedules',
  },
  data: {
    endpoint: '/api/runsheets',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Runsheet Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', required: true, inTable: true, inForm: true, options: [] },
      date: { type: 'date', label: 'Date', required: true, inTable: true, inForm: true, sortable: true },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Published', value: 'published', color: 'green' },
          { label: 'Locked', value: 'locked', color: 'blue' },
        ],
        default: 'draft',
      },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Runsheet'),
    subtitle: (record: Record<string, unknown>) => String(record.date || ''),
    badge: (record: Record<string, unknown>) => {
      if (record.status === 'published') return { label: 'Published', variant: 'success' };
      if (record.status === 'locked') return { label: 'Locked', variant: 'secondary' };
      return { label: 'Draft', variant: 'warning' };
    },
    defaultSort: { field: 'date', direction: 'desc' },
  },
  search: { enabled: true, fields: ['name'], placeholder: 'Search runsheets...' },
  filters: { quick: [{ key: 'published', label: 'Published', query: { where: { status: 'published' } } }], advanced: ['status', 'eventId'] },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Runsheets', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [{ key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } }] },
    },
    form: { sections: [{ key: 'basic', title: 'Runsheet Details', fields: ['name', 'eventId', 'date', 'status', 'notes'] }] },
  },
  views: { table: { columns: ['name', 'eventId', 'date', 'status'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/production/runsheets/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Runsheet', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
