import { defineSchema } from '../schema/defineSchema';

export const showSchema = defineSchema({
  identity: {
    name: 'show',
    namePlural: 'Shows',
    slug: 'modules/production/shows',
    icon: 'Theater',
    description: 'Manage show productions and performances',
  },
  data: {
    endpoint: '/api/show_calls',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Show Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', required: true, inTable: true, inForm: true, options: [] },
      artist: { type: 'text', label: 'Artist/Performer', required: true, inTable: true, inForm: true, searchable: true },
      startTime: { type: 'datetime', label: 'Start Time', required: true, inTable: true, inForm: true, sortable: true },
      endTime: { type: 'datetime', label: 'End Time', required: true, inTable: true, inForm: true },
      stage: { type: 'text', label: 'Stage', inTable: true, inForm: true },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Scheduled', value: 'scheduled', color: 'blue' },
          { label: 'Confirmed', value: 'confirmed', color: 'green' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
        ],
        default: 'scheduled',
      },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Show'),
    subtitle: (record: Record<string, unknown>) => String(record.artist || ''),
    badge: (record: Record<string, unknown>) => {
      if (record.status === 'confirmed') return { label: 'Confirmed', variant: 'success' };
      if (record.status === 'cancelled') return { label: 'Cancelled', variant: 'destructive' };
      return { label: 'Scheduled', variant: 'secondary' };
    },
    defaultSort: { field: 'startTime', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'artist'], placeholder: 'Search shows...' },
  filters: { quick: [{ key: 'confirmed', label: 'Confirmed', query: { where: { status: 'confirmed' } } }], advanced: ['status', 'eventId'] },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Shows', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table', 'calendar'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [{ key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } }] },
    },
    form: { sections: [{ key: 'basic', title: 'Show Details', fields: ['name', 'eventId', 'artist', 'stage', 'status', 'startTime', 'endTime', 'notes'] }] },
  },
  views: { table: { columns: ['name', 'artist', 'eventId', 'stage', 'startTime', 'status'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/production/shows/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Show', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
