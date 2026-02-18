import { defineSchema } from '../schema-engine/defineSchema';

export const boardSchema = defineSchema({
  identity: {
    name: 'board',
    namePlural: 'Boards',
    slug: 'modules/projects/boards',
    icon: 'LayoutGrid',
    description: 'Kanban boards for visual project management',
  },
  data: {
    endpoint: '/api/boards',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Board Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      projectId: { type: 'select', label: 'Project', required: true, inTable: true, inForm: true, options: [] },
      type: {
        type: 'select', label: 'Board Type', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Kanban', value: 'kanban', color: 'blue' },
          { label: 'Scrum', value: 'scrum', color: 'green' },
          { label: 'Custom', value: 'custom', color: 'gray' },
        ],
        default: 'kanban',
      },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      isDefault: { type: 'switch', label: 'Default Board', inForm: true, inTable: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Board'),
    subtitle: (record: Record<string, unknown>) => String(record.type),
    badge: (record: Record<string, unknown>) => record.isDefault ? { label: 'Default', variant: 'success' } : undefined,
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search boards...' },
  filters: { quick: [{ key: 'kanban', label: 'Kanban', query: { where: { type: 'kanban' } } }], advanced: ['type', 'projectId'] },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'kanban', label: 'Kanban', query: { where: { type: 'kanban' } } },
        { key: 'scrum', label: 'Scrum', query: { where: { type: 'scrum' } } },
        { key: 'custom', label: 'Custom', query: { where: { type: 'custom' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [{ key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description'] } }] },
    },
    form: { sections: [{ key: 'basic', title: 'Board Details', fields: ['name', 'projectId', 'type', 'description', 'isDefault'] }] },
  },
  views: { table: { columns: [
        'name',
        { field: 'projectId', format: { type: 'relation', entityType: 'project' } },
        'type',
        { field: 'isDefault', format: { type: 'boolean' } },
      ] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/boards/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Board', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  relationships: {
    belongsTo: [
      { entity: 'project', foreignKey: 'projectId', label: 'Project' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
