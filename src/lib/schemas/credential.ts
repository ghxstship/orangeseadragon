import { defineSchema } from '../schema/defineSchema';

export const credentialSchema = defineSchema({
  identity: {
    name: 'credential',
    namePlural: 'Credentials',
    slug: 'modules/workforce/credentials',
    icon: 'KeyRound',
    description: 'Staff credentials, licenses, and permits',
  },
  data: {
    endpoint: '/api/user-credentials',
    primaryKey: 'id',
    fields: {
      credential_number: {
        type: 'text',
        label: 'Credential #',
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      credential_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Certification', value: 'certification', color: 'blue' },
          { label: 'License', value: 'license', color: 'purple' },
          { label: 'Permit', value: 'permit', color: 'amber' },
          { label: 'Training', value: 'training', color: 'green' },
          { label: 'Degree', value: 'degree', color: 'gray' },
          { label: 'Other', value: 'other', color: 'slate' },
        ],
      },
      user_id: {
        type: 'select',
        label: 'Person',
        required: true,
        inTable: true,
        inForm: true,
        options: [],
      },
      issuing_authority: {
        type: 'text',
        label: 'Issuing Authority',
        inTable: true,
        inForm: true,
      },
      issue_date: {
        type: 'date',
        label: 'Issue Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      expiry_date: {
        type: 'date',
        label: 'Expiry Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Expired', value: 'expired', color: 'red' },
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Revoked', value: 'revoked', color: 'gray' },
        ],
        default: 'active',
      },
      document_url: {
        type: 'file',
        label: 'Document',
        inForm: true,
        inDetail: true,
      },
      verified_at: {
        type: 'datetime',
        label: 'Verified At',
        inDetail: true,
      },
      verified_by: {
        type: 'select',
        label: 'Verified By',
        inDetail: true,
        options: [],
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || r.credential_number || 'Credential'),
    subtitle: (r: Record<string, unknown>) => String(r.credential_type || ''),
    badge: (r: Record<string, unknown>) => {
      const status = String(r.status || '');
      if (status === 'active') return { label: 'Active', variant: 'success' };
      if (status === 'expired') return { label: 'Expired', variant: 'destructive' };
      if (status === 'pending') return { label: 'Pending', variant: 'warning' };
      return { label: status || 'Unknown', variant: 'secondary' };
    },
    defaultSort: { field: 'expiry_date', direction: 'asc' },
  },
  search: { enabled: true, fields: ['name', 'credential_number', 'issuing_authority'], placeholder: 'Search credentials...' },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['credential_type', 'status', 'user_id', 'expiry_date'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list', 'calendar'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [] },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Credential Details', fields: ['credential_number', 'name', 'credential_type', 'status'] },
        { key: 'relationships', title: 'Assignment', fields: ['user_id', 'issuing_authority'] },
        { key: 'dates', title: 'Dates', fields: ['issue_date', 'expiry_date'] },
        { key: 'documents', title: 'Documentation', fields: ['document_url'] },
      ],
    },
  },
  views: {
    table: { columns: [
      'credential_number', 'name', 'credential_type',
      { field: 'user_id', format: { type: 'relation', entityType: 'person' } },
      { field: 'status', format: { type: 'badge', colorMap: { active: '#22c55e', expired: '#ef4444', pending: '#f59e0b', revoked: '#6b7280' } } },
      { field: 'expiry_date', format: { type: 'date' } },
      'issuing_authority',
    ] },
    list: {
      titleField: 'name',
      subtitleField: 'credential_type',
      metaFields: ['expiry_date', 'issuing_authority'],
      showChevron: true,
    },
    calendar: {
      titleField: 'name',
      startField: 'expiry_date',
      colorField: 'status',
    },
  },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/credentials/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'Add Credential', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'user_id', label: 'User' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
