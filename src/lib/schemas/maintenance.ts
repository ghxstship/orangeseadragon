import { defineSchema } from '../schema/defineSchema';

export const maintenanceSchema = defineSchema({
  identity: { name: 'maintenance', namePlural: 'Maintenance', slug: 'modules/assets/maintenance', icon: 'Wrench', description: 'Asset maintenance records' },
  data: {
    endpoint: '/api/asset_maintenance', primaryKey: 'id',
    fields: {
      assetId: { type: 'select', label: 'Asset', required: true, inTable: true, inForm: true, options: [] },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'Preventive', value: 'preventive', color: 'blue' }, { label: 'Corrective', value: 'corrective', color: 'orange' }, { label: 'Emergency', value: 'emergency', color: 'red' }] },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Scheduled', value: 'scheduled', color: 'blue' }, { label: 'In Progress', value: 'in_progress', color: 'yellow' }, { label: 'Completed', value: 'completed', color: 'green' }, { label: 'Cancelled', value: 'cancelled', color: 'gray' }], default: 'scheduled' },
      scheduledDate: { type: 'date', label: 'Scheduled Date', required: true, inTable: true, inForm: true, sortable: true },
      completedDate: { type: 'date', label: 'Completed Date', inTable: true, inForm: true },
      cost: { type: 'currency', label: 'Cost', inTable: true, inForm: true },
      description: { type: 'textarea', label: 'Description', required: true, inForm: true, inDetail: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => `${r.type} Maintenance`, subtitle: (r: Record<string, unknown>) => String(r.scheduledDate || ''), badge: (r: Record<string, unknown>) => r.status === 'completed' ? { label: 'Completed', variant: 'success' } : r.status === 'in_progress' ? { label: 'In Progress', variant: 'warning' } : { label: 'Scheduled', variant: 'secondary' }, defaultSort: { field: 'scheduledDate', direction: 'desc' } },
  search: { enabled: true, fields: ['description'], placeholder: 'Search maintenance...' },
  filters: { quick: [{ key: 'scheduled', label: 'Scheduled', query: { where: { status: 'scheduled' } } }], advanced: ['type', 'status', 'assetId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'cost', label: 'Cost', value: { type: 'field', field: 'cost' }, format: 'currency' }], blocks: [{ key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description', 'notes'] } }] } }, form: { sections: [{ key: 'basic', title: 'Maintenance Details', fields: ['assetId', 'type', 'status', 'scheduledDate', 'completedDate', 'cost', 'description', 'notes'] }] } },
  views: { table: { columns: ['assetId', 'type', 'status', 'scheduledDate', 'cost'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/assets/maintenance/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'Schedule Maintenance', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
