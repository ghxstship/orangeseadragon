import { defineSchema } from '../schema/defineSchema';

export const techSpecSchema = defineSchema({
  identity: {
    name: 'techSpec',
    namePlural: 'Tech Specs',
    slug: 'modules/production/tech-specs',
    icon: 'Settings',
    description: 'Technical specifications and requirements',
  },
  data: {
    endpoint: '/api/tech_specs',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      venueId: { type: 'select', label: 'Venue', inTable: true, inForm: true, options: [] },
      category: {
        type: 'select', label: 'Category', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Audio', value: 'audio', color: 'blue' },
          { label: 'Lighting', value: 'lighting', color: 'yellow' },
          { label: 'Video', value: 'video', color: 'purple' },
          { label: 'Staging', value: 'staging', color: 'gray' },
          { label: 'Power', value: 'power', color: 'red' },
        ],
      },
      specifications: { type: 'textarea', label: 'Specifications', inForm: true, inDetail: true },
      attachments: { type: 'file', label: 'Attachments', inForm: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Spec'),
    subtitle: (record: Record<string, unknown>) => String(record.category || ''),
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'specifications'], placeholder: 'Search tech specs...' },
  filters: { quick: [], advanced: ['category', 'eventId', 'venueId'] },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'audio', label: 'Audio', query: { where: { category: 'audio' } } },
        { key: 'lighting', label: 'Lighting', query: { where: { category: 'lighting' } } },
        { key: 'video', label: 'Video', query: { where: { category: 'video' } } },
        { key: 'staging', label: 'Staging', query: { where: { category: 'staging' } } },
        { key: 'power', label: 'Power', query: { where: { category: 'power' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [{ key: 'specs', title: 'Specifications', content: { type: 'fields', fields: ['specifications'] } }] },
    },
    form: { sections: [{ key: 'basic', title: 'Tech Spec Details', fields: ['name', 'eventId', 'venueId', 'category', 'specifications', 'attachments'] }] },
  },
  views: { table: { columns: ['name', 'category', 'eventId', 'venueId'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/tech-specs/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Spec', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
