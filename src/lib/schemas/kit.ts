import { defineSchema } from '../schema/defineSchema';

export const kitSchema = defineSchema({
  identity: { name: 'kit', namePlural: 'Kits', slug: 'modules/assets/kits', icon: 'Boxes', description: 'Equipment kits and bundles' },
  data: {
    endpoint: '/api/asset_kits', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Kit Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      code: { type: 'text', label: 'Kit Code', inTable: true, inForm: true },
      categoryId: { type: 'select', label: 'Category', inTable: true, inForm: true, options: [] },
      itemCount: { type: 'number', label: 'Items', inTable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Available', value: 'available', color: 'green' }, { label: 'In Use', value: 'in-use', color: 'blue' }, { label: 'Maintenance', value: 'maintenance', color: 'yellow' }], default: 'available' },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled Kit'), subtitle: (r: Record<string, unknown>) => `${r.itemCount || 0} items`, badge: (r: Record<string, unknown>) => r.status === 'available' ? { label: 'Available', variant: 'success' } : { label: String(r.status), variant: 'secondary' }, defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name', 'code'], placeholder: 'Search kits...' },
  filters: { quick: [{ key: 'available', label: 'Available', query: { where: { status: 'available' } } }], advanced: ['status', 'categoryId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'available', label: 'Available', query: { where: { status: 'available' } }, count: true }, { key: 'in-use', label: 'In Use', query: { where: { status: 'in-use' } }, count: true }, { key: 'maintenance', label: 'Maintenance', query: { where: { status: 'maintenance' } }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'items', label: 'Items', value: { type: 'field', field: 'itemCount' } }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Kit Details', fields: ['name', 'code', 'categoryId', 'status', 'description'] }] } },
  views: { table: { columns: [
        'name',
        'code',
        { field: 'categoryId', format: { type: 'relation', entityType: 'category' } },
        { field: 'itemCount', format: { type: 'number' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/assets/kits/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Kit', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
