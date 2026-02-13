import { defineSchema } from '../schema/defineSchema';

export const sprintSchema = defineSchema({
  identity: {
    name: 'sprint',
    namePlural: 'Sprints',
    slug: 'modules/projects/sprints',
    icon: 'Rocket',
    description: 'Manage sprint cycles and iterations',
  },
  data: {
    endpoint: '/api/sprints',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Sprint Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      projectId: { type: 'select', label: 'Project', required: true, inTable: true, inForm: true, options: [] },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Planned', value: 'planned', color: 'gray' },
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Completed', value: 'completed', color: 'blue' },
        ],
        default: 'planned',
      },
      startDate: { type: 'date', label: 'Start Date', required: true, inTable: true, inForm: true, sortable: true },
      endDate: { type: 'date', label: 'End Date', required: true, inTable: true, inForm: true, sortable: true },
      goal: { type: 'textarea', label: 'Sprint Goal', inForm: true, inDetail: true },
      velocity: { type: 'number', label: 'Velocity', inTable: true, inForm: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Sprint'),
    subtitle: (record: Record<string, unknown>) => `${record.startDate} - ${record.endDate}`,
    badge: (record: Record<string, unknown>) => {
      if (record.status === 'active') return { label: 'Active', variant: 'success' };
      if (record.status === 'completed') return { label: 'Completed', variant: 'secondary' };
      return { label: 'Planned', variant: 'warning' };
    },
    defaultSort: { field: 'startDate', direction: 'desc' },
  },
  search: { enabled: true, fields: ['name', 'goal'], placeholder: 'Search sprints...' },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
    ],
    advanced: ['status', 'projectId'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Sprints', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: {
        stats: [{ key: 'velocity', label: 'Velocity', value: { type: 'field', field: 'velocity' } }],
        blocks: [{ key: 'goal', title: 'Sprint Goal', content: { type: 'fields', fields: ['goal'] } }],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Sprint Information', fields: ['name', 'projectId', 'status', 'goal'] },
        { key: 'dates', title: 'Timeline', fields: ['startDate', 'endDate', 'velocity'] },
      ],
    },
  },
  views: { table: { columns: [
    'name',
    { field: 'projectId', format: { type: 'relation', entityType: 'project' } },
    { field: 'status', format: { type: 'badge', colorMap: { planning: '#6b7280', active: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' } } },
    { field: 'startDate', format: { type: 'date' } },
    { field: 'endDate', format: { type: 'date' } },
    { field: 'velocity', format: { type: 'number' } },
  ] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/sprints/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Sprint', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  relationships: {
    belongsTo: [
      { entity: 'project', foreignKey: 'projectId', label: 'Project' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
