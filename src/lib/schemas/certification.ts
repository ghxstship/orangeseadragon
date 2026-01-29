import { defineSchema } from '../schema/defineSchema';

export const certificationSchema = defineSchema({
  identity: { name: 'certification', namePlural: 'Certifications', slug: 'modules/workforce/certifications', icon: 'Award', description: 'Staff certifications and qualifications' },
  data: {
    endpoint: '/api/user_certifications', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Certification Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      personId: { type: 'select', label: 'Person', required: true, inTable: true, inForm: true, options: [] },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'Safety', value: 'safety', color: 'red' }, { label: 'Technical', value: 'technical', color: 'blue' }, { label: 'Medical', value: 'medical', color: 'green' }, { label: 'License', value: 'license', color: 'purple' }] },
      issuedDate: { type: 'date', label: 'Issued Date', required: true, inTable: true, inForm: true },
      expiryDate: { type: 'date', label: 'Expiry Date', inTable: true, inForm: true, sortable: true },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Valid', value: 'valid', color: 'green' }, { label: 'Expired', value: 'expired', color: 'red' }, { label: 'Pending', value: 'pending', color: 'yellow' }], default: 'valid' },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => String(r.type || ''), badge: (r: Record<string, unknown>) => r.status === 'valid' ? { label: 'Valid', variant: 'success' } : r.status === 'expired' ? { label: 'Expired', variant: 'destructive' } : { label: 'Pending', variant: 'warning' }, defaultSort: { field: 'expiryDate', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search certifications...' },
  filters: { quick: [{ key: 'expiring', label: 'Expiring Soon', query: { where: {} } }], advanced: ['type', 'status', 'personId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Certification Details', fields: ['name', 'personId', 'type', 'issuedDate', 'expiryDate', 'status', 'notes'] }] } },
  views: { table: { columns: ['name', 'personId', 'type', 'expiryDate', 'status'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/certifications/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'Add Certification', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
