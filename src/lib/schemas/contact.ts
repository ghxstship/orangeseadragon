import { defineSchema } from '../schema/defineSchema';

export const contactSchema = defineSchema({
  identity: { name: 'contact', namePlural: 'Contacts', slug: 'modules/business/contacts', icon: 'Contact', description: 'Business contacts and relationships' },
  data: {
    endpoint: '/api/contacts', primaryKey: 'id',
    fields: {
      firstName: { type: 'text', label: 'First Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      lastName: { type: 'text', label: 'Last Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      email: { type: 'email', label: 'Email', required: true, inTable: true, inForm: true, searchable: true },
      phone: { type: 'phone', label: 'Phone', inTable: true, inForm: true },
      companyId: { type: 'relation', label: 'Company', inTable: true, inForm: true, relation: { entity: 'company', display: 'name', searchable: true } },
      title: { type: 'text', label: 'Job Title', inTable: true, inForm: true },
      type: { type: 'select', label: 'Type', inTable: true, inForm: true, options: [{ label: 'Client', value: 'client', color: 'blue' }, { label: 'Vendor', value: 'vendor', color: 'green' }, { label: 'Partner', value: 'partner', color: 'purple' }, { label: 'Other', value: 'other', color: 'gray' }] },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => `${r.firstName} ${r.lastName}`, subtitle: (r: Record<string, unknown>) => String(r.title || ''), defaultSort: { field: 'lastName', direction: 'asc' } },
  search: { enabled: true, fields: ['firstName', 'lastName', 'email'], placeholder: 'Search contacts...' },
  filters: { quick: [], advanced: ['type', 'companyId'] },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'clients', label: 'Clients', query: { where: { type: 'client' } }, count: true },
        { key: 'vendors', label: 'Vendors', query: { where: { type: 'vendor' } }, count: true },
        { key: 'partners', label: 'Partners', query: { where: { type: 'partner' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'deals', label: 'Deals', content: { type: 'related', entity: 'deal', foreignKey: 'contact_id', defaultView: 'table', allowCreate: true } },
        { key: 'invoices', label: 'Invoices', content: { type: 'related', entity: 'invoice', foreignKey: 'contact_id', defaultView: 'table' } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
        { key: 'comments', label: 'Comments', content: { type: 'comments' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'deals', label: 'Active Deals', value: { type: 'relation-count', entity: 'deal', foreignKey: 'contact_id' }, onClick: { tab: 'deals' } },
        ],
        blocks: [
          { key: 'contact', title: 'Contact Info', content: { type: 'fields', fields: ['email', 'phone', 'title', 'companyId'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
      sidebar: {
        width: 300,
        collapsible: true,
        defaultState: 'open',
        sections: [
          { key: 'properties', title: 'Properties', content: { type: 'stats', stats: ['type', 'companyId', 'title'] } },
          { key: 'recent_activity', title: 'Recent Activity', content: { type: 'activity', limit: 5 }, collapsible: true },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Contact Details', fields: ['firstName', 'lastName', 'email', 'phone', 'companyId', 'title', 'type', 'notes'] },
      ],
    },
  },
  views: { table: { columns: [
    'firstName',
    'lastName',
    'email',
    'phone',
    { field: 'companyId', format: { type: 'relation', entityType: 'company' } },
    { field: 'type', format: { type: 'badge', colorMap: { primary: '#3b82f6', billing: '#22c55e', technical: '#8b5cf6', executive: '#f59e0b' } } },
  ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/contacts/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Contact', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'company', foreignKey: 'company_id', label: 'Company' },
    ],
    hasMany: [
      { entity: 'deal', foreignKey: 'contact_id', label: 'Deals', cascade: 'nullify' },
      { entity: 'invoice', foreignKey: 'contact_id', label: 'Invoices', cascade: 'nullify' },
      { entity: 'registration', foreignKey: 'contact_id', label: 'Registrations', cascade: 'nullify' },
      { entity: 'activity', foreignKey: 'contact_id', label: 'Activities', cascade: 'delete' },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
