import { defineSchema } from '../../schema-engine/defineSchema';

export const riderSchema = defineSchema({
  identity: {
    name: 'rider',
    namePlural: 'Riders',
    slug: 'modules/production/riders',
    icon: 'FileText',
    description: 'Artist and technical riders',
  },
  data: {
    endpoint: '/api/riders',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Rider Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      artistId: { type: 'select', label: 'Artist', inTable: true, inForm: true, options: [] },
      type: {
        type: 'select', label: 'Type', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Technical', value: 'technical', color: 'blue' },
          { label: 'Hospitality', value: 'hospitality', color: 'green' },
          { label: 'Security', value: 'security', color: 'red' },
        ],
      },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Approved', value: 'approved', color: 'green' },
          { label: 'Rejected', value: 'rejected', color: 'red' },
        ],
        default: 'draft',
      },
      content: { type: 'textarea', label: 'Content', inForm: true, inDetail: true },
      attachments: { type: 'file', label: 'Attachments', inForm: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Rider'),
    subtitle: (record: Record<string, unknown>) => String(record.type || ''),
    badge: (record: Record<string, unknown>) => {
      if (record.status === 'approved') return { label: 'Approved', variant: 'success' };
      if (record.status === 'rejected') return { label: 'Rejected', variant: 'destructive' };
      return { label: 'Draft', variant: 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'content'], placeholder: 'Search riders...' },
  filters: { quick: [{ key: 'approved', label: 'Approved', query: { where: { status: 'approved' } } }], advanced: ['type', 'status'] },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'technical', label: 'Technical', query: { where: { type: 'technical' } }, count: true },
        { key: 'hospitality', label: 'Hospitality', query: { where: { type: 'hospitality' } } },
        { key: 'security', label: 'Security', query: { where: { type: 'security' } } },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [{ key: 'content', title: 'Content', content: { type: 'fields', fields: ['content'] } }] },
    },
    form: { sections: [{ key: 'basic', title: 'Rider Details', fields: ['name', 'artistId', 'type', 'status', 'content', 'attachments'] }] },
  },
  views: { table: { columns: [
        'name',
        { field: 'artistId', format: { type: 'relation', entityType: 'artist' } },
        'type',
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
      ] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/riders/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Rider', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
