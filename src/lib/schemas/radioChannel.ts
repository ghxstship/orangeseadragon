import { defineSchema } from '../schema/defineSchema';

export const radioChannelSchema = defineSchema({
  identity: { name: 'radioChannel', namePlural: 'Radio Channels', slug: 'modules/operations/radio', icon: 'Radio', description: 'Radio channel assignments' },
  data: {
    endpoint: '/api/radio_channels', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Channel Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      channel: { type: 'text', label: 'Channel Number', required: true, inTable: true, inForm: true },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      departmentId: { type: 'select', label: 'Department', inTable: true, inForm: true, options: [] },
      frequency: { type: 'text', label: 'Frequency', inTable: true, inForm: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled Channel'), subtitle: (r: Record<string, unknown>) => `Ch ${r.channel}`, defaultSort: { field: 'channel', direction: 'asc' } },
  search: { enabled: true, fields: ['name', 'channel'], placeholder: 'Search channels...' },
  filters: { quick: [], advanced: ['eventId', 'departmentId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All Channels', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Channel Details', fields: ['name', 'channel', 'frequency', 'eventId', 'departmentId', 'notes'] }] } },
  views: { table: { columns: ['name', 'channel', 'frequency', 'departmentId'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/radio/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Channel', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
