import { defineSchema } from '../schema/defineSchema';

export const incidentSchema = defineSchema({
  identity: { name: 'incident', namePlural: 'Incidents', slug: 'modules/operations/incidents', icon: 'AlertTriangle', description: 'Incident reports and tracking' },
  data: {
    endpoint: '/api/incident_reports', primaryKey: 'id',
    fields: {
      title: { type: 'text', label: 'Title', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', inTable: true, inForm: true, options: [] },
      venueId: { type: 'select', label: 'Venue', inTable: true, inForm: true, options: [] },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'Medical', value: 'medical', color: 'red' }, { label: 'Security', value: 'security', color: 'orange' }, { label: 'Safety', value: 'safety', color: 'yellow' }, { label: 'Other', value: 'other', color: 'gray' }] },
      severity: { type: 'select', label: 'Severity', required: true, inTable: true, inForm: true, options: [{ label: 'Critical', value: 'critical', color: 'red' }, { label: 'High', value: 'high', color: 'orange' }, { label: 'Medium', value: 'medium', color: 'yellow' }, { label: 'Low', value: 'low', color: 'gray' }] },
      status: { type: 'select', label: 'Status', required: true, inTable: true, inForm: true, options: [{ label: 'Open', value: 'open', color: 'red' }, { label: 'In Progress', value: 'in-progress', color: 'yellow' }, { label: 'Resolved', value: 'resolved', color: 'green' }, { label: 'Closed', value: 'closed', color: 'gray' }], default: 'open' },
      reportedAt: { type: 'datetime', label: 'Reported At', required: true, inTable: true, inForm: true, sortable: true },
      description: { type: 'textarea', label: 'Description', required: true, inForm: true, inDetail: true },
      resolution: { type: 'textarea', label: 'Resolution', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.title || 'Untitled Incident'), subtitle: (r: Record<string, unknown>) => String(r.type || ''), badge: (r: Record<string, unknown>) => ({ label: String(r.severity), variant: r.severity === 'critical' ? 'destructive' : 'secondary' }), defaultSort: { field: 'reportedAt', direction: 'desc' } },
  search: { enabled: true, fields: ['title', 'description'], placeholder: 'Search incidents...' },
  filters: { quick: [{ key: 'open', label: 'Open', query: { where: { status: 'open' } } }], advanced: ['type', 'severity', 'status'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'open', label: 'Open', query: { where: { status: 'open' } }, count: true }, { key: 'in-progress', label: 'In Progress', query: { where: { status: 'in-progress' } }, count: true }, { key: 'resolved', label: 'Resolved', query: { where: { status: 'resolved' } } }, { key: 'closed', label: 'Closed', query: { where: { status: 'closed' } } }], defaultView: 'table', availableViews: ['table', 'kanban'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [], blocks: [{ key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description', 'resolution'] } }] } }, form: { sections: [{ key: 'basic', title: 'Incident Details', fields: ['title', 'eventId', 'venueId', 'type', 'severity', 'status', 'reportedAt'] }, { key: 'details', title: 'Details', fields: ['description', 'resolution'] }] } },
  views: { table: { columns: ['title', 'type', 'severity', 'status', 'reportedAt'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/incidents/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'Report Incident', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
