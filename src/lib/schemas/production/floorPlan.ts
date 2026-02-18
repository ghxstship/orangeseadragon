import { defineSchema } from '../../schema-engine/defineSchema';

export const floorPlanSchema = defineSchema({
  identity: { name: 'floorPlan', namePlural: 'Floor Plans', slug: 'modules/operations/floor-plans', icon: 'Map', description: 'Venue floor plans and layouts' },
  data: {
    endpoint: '/api/floor_plans', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      venueId: { type: 'select', label: 'Venue', required: true, inTable: true, inForm: true, options: [] },
      version: { type: 'text', label: 'Version', inTable: true, inForm: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Draft', value: 'draft', color: 'gray' }, { label: 'Active', value: 'active', color: 'green' }, { label: 'Archived', value: 'archived', color: 'red' }], default: 'draft' },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => `v${r.version || '1.0'}`, badge: (r: Record<string, unknown>) => r.status === 'active' ? { label: 'Active', variant: 'success' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search floor plans...' },
  filters: { quick: [], advanced: ['status', 'venueId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true }, { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true }, { key: 'archived', label: 'Archived', query: { where: { status: 'archived' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Details', fields: ['name', 'venueId', 'version', 'status', 'description'] }] } },
  views: { table: { columns: [
        'name',
        { field: 'venueId', format: { type: 'relation', entityType: 'venue' } },
        { field: 'version', format: { type: 'number' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/floor-plans/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Floor Plan', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'venue', foreignKey: 'venueId', label: 'Venue' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
