import { defineSchema } from '../schema/defineSchema';

export const positionSchema = defineSchema({
  identity: { name: 'position', namePlural: 'Positions', slug: 'modules/workforce/positions', icon: 'Briefcase', description: 'Job positions and roles' },
  data: {
    endpoint: '/api/positions', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Position Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      departmentId: { type: 'select', label: 'Department', inTable: true, inForm: true, options: [] },
      category: { type: 'select', label: 'Category', required: true, inTable: true, inForm: true, options: [{ label: 'Production', value: 'production', color: 'blue' }, { label: 'Technical', value: 'technical', color: 'purple' }, { label: 'Operations', value: 'operations', color: 'green' }, { label: 'Admin', value: 'admin', color: 'gray' }] },
      hourlyRate: { type: 'currency', label: 'Hourly Rate', inTable: true, inForm: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      requirements: { type: 'textarea', label: 'Requirements', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled Position'), subtitle: (r: Record<string, unknown>) => String(r.category || ''), defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search positions...' },
  filters: { quick: [], advanced: ['category', 'departmentId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'production', label: 'Production', query: { where: { category: 'production' } } }, { key: 'technical', label: 'Technical', query: { where: { category: 'technical' } } }, { key: 'operations', label: 'Operations', query: { where: { category: 'operations' } } }, { key: 'admin', label: 'Admin', query: { where: { category: 'admin' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'rate', label: 'Hourly Rate', value: { type: 'field', field: 'hourlyRate' }, format: 'currency' }], blocks: [{ key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description', 'requirements'] } }] } }, form: { sections: [{ key: 'basic', title: 'Position Details', fields: ['name', 'departmentId', 'category', 'hourlyRate', 'description', 'requirements'] }] } },
  views: { table: { columns: ['name', 'departmentId', 'category', 'hourlyRate'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/positions/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Position', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'department', foreignKey: 'departmentId', label: 'Department' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
