import { defineSchema } from '../schema/defineSchema';

export const departmentSchema = defineSchema({
  identity: {
    name: 'department',
    namePlural: 'Departments',
    slug: 'modules/production/departments',
    icon: '🏢',
    description: 'Production departments and crews',
  },
  data: {
    endpoint: '/api/departments',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Department Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      code: { type: 'text', label: 'Code', required: true, inTable: true, inForm: true },
      headId: { type: 'select', label: 'Department Head', inTable: true, inForm: true, options: [] },
      color: { type: 'text', label: 'Color', inForm: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      memberCount: { type: 'number', label: 'Members', inTable: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Department'),
    subtitle: (record: Record<string, unknown>) => String(record.code || ''),
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'code'], placeholder: 'Search departments...' },
  filters: { quick: [], advanced: [] },
  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All Departments', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [{ key: 'members', label: 'Members', value: { type: 'field', field: 'memberCount' } }], blocks: [] },
    },
    form: { sections: [{ key: 'basic', title: 'Department Details', fields: ['name', 'code', 'headId', 'color', 'description'] }] },
  },
  views: { table: { columns: ['name', 'code', 'headId', 'memberCount'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/production/departments/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Department', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
