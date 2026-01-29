import { defineSchema } from '../schema/defineSchema';

export const teamSchema = defineSchema({
  identity: {
    name: 'team',
    namePlural: 'Teams',
    slug: 'modules/projects/teams',
    icon: 'Users',
    description: 'Manage project teams and members',
  },
  data: {
    endpoint: '/api/teams',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Team Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      projectId: { type: 'select', label: 'Project', inTable: true, inForm: true, options: [] },
      leadId: { type: 'select', label: 'Team Lead', inTable: true, inForm: true, options: [] },
      memberCount: { type: 'number', label: 'Members', inTable: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      color: { type: 'text', label: 'Team Color', inForm: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Team'),
    subtitle: (record: Record<string, unknown>) => `${record.memberCount || 0} members`,
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search teams...' },
  filters: { quick: [], advanced: ['projectId'] },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Teams', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [{ key: 'members', label: 'Members', value: { type: 'field', field: 'memberCount' } }], blocks: [] },
    },
    form: { sections: [{ key: 'basic', title: 'Team Details', fields: ['name', 'projectId', 'leadId', 'description', 'color'] }] },
  },
  views: { table: { columns: ['name', 'projectId', 'leadId', 'memberCount'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/projects/teams/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Team', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
