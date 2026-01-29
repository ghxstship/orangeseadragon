import { defineSchema } from '../schema/defineSchema';

export const advancingSchema = defineSchema({
  identity: {
    name: 'advancing',
    namePlural: 'Advancing',
    slug: 'modules/production/advancing',
    icon: 'Phone',
    description: 'Artist and production advancing',
  },
  data: {
    endpoint: '/api/advancing',
    primaryKey: 'id',
    fields: {
      title: { type: 'text', label: 'Title', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', required: true, inTable: true, inForm: true, options: [] },
      artistId: { type: 'select', label: 'Artist', inTable: true, inForm: true, options: [] },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'In Progress', value: 'in-progress', color: 'blue' },
          { label: 'Completed', value: 'completed', color: 'green' },
        ],
        default: 'pending',
      },
      dueDate: { type: 'date', label: 'Due Date', inTable: true, inForm: true, sortable: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.title || 'Untitled'),
    subtitle: (record: Record<string, unknown>) => String(record.dueDate || ''),
    badge: (record: Record<string, unknown>) => {
      if (record.status === 'completed') return { label: 'Completed', variant: 'success' };
      if (record.status === 'in-progress') return { label: 'In Progress', variant: 'warning' };
      return { label: 'Pending', variant: 'secondary' };
    },
    defaultSort: { field: 'dueDate', direction: 'asc' },
  },
  search: { enabled: true, fields: ['title'], placeholder: 'Search advancing...' },
  filters: { quick: [{ key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } }], advanced: ['status', 'eventId'] },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Items', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [{ key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } }] },
    },
    form: { sections: [{ key: 'basic', title: 'Advancing Details', fields: ['title', 'eventId', 'artistId', 'status', 'dueDate', 'notes'] }] },
  },
  views: { table: { columns: ['title', 'eventId', 'artistId', 'status', 'dueDate'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/production/advancing/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Item', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
