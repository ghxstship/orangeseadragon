import { defineSchema } from '../schema/defineSchema';

export const certificateOfInsuranceSchema = defineSchema({
  identity: {
    name: 'Certificate of Insurance',
    namePlural: 'Certificates of Insurance',
    slug: 'modules/production/certificates-of-insurance',
    icon: 'ShieldCheck',
    description: 'Insurance certificates and coverage documentation',
  },
  data: {
    endpoint: '/api/certificates-of-insurance',
    primaryKey: 'id',
    fields: {
      certificate_number: {
        type: 'text',
        label: 'Certificate #',
        required: true,
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
      insurance_provider: {
        type: 'text',
        label: 'Provider',
        inTable: true,
        inForm: true,
      },
      policy_number: {
        type: 'text',
        label: 'Policy #',
        inTable: true,
        inForm: true,
      },
      coverage_type: {
        type: 'text',
        label: 'Coverage Type',
        inTable: true,
        inForm: true,
      },
      coverage_amount: {
        type: 'currency',
        label: 'Coverage Amount',
        inTable: true,
        inForm: true,
      },
      certificate_holder_name: {
        type: 'text',
        label: 'Certificate Holder',
        inTable: true,
        inForm: true,
      },
      certificate_holder_address: {
        type: 'textarea',
        label: 'Holder Address',
        inForm: true,
        inDetail: true,
      },
      production_id: {
        type: 'select',
        label: 'Production',
        inTable: true,
        inForm: true,
        options: [],
      },
      event_id: {
        type: 'select',
        label: 'Event',
        inForm: true,
        options: [],
      },
      company_id: {
        type: 'select',
        label: 'Company',
        inForm: true,
        options: [],
      },
      vendor_id: {
        type: 'select',
        label: 'Vendor',
        inForm: true,
        options: [],
      },
      effective_date: {
        type: 'date',
        label: 'Effective Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      expiration_date: {
        type: 'date',
        label: 'Expiration Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Expired', value: 'expired', color: 'red' },
          { label: 'Cancelled', value: 'cancelled', color: 'gray' },
        ],
        default: 'active',
      },
      certificate_url: {
        type: 'file',
        label: 'Certificate Document',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || record.certificate_number || 'Certificate'),
    subtitle: (record: Record<string, unknown>) => String(record.insurance_provider || ''),
    badge: (record: Record<string, unknown>) => {
      const status = String(record.status || '');
      if (status === 'active') return { label: 'Active', variant: 'success' };
      if (status === 'expired') return { label: 'Expired', variant: 'destructive' };
      if (status === 'pending') return { label: 'Pending', variant: 'warning' };
      if (status === 'cancelled') return { label: 'Cancelled', variant: 'secondary' };
      return { label: status || 'Unknown', variant: 'secondary' };
    },
    defaultSort: { field: 'expiration_date', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['certificate_number', 'name', 'insurance_provider', 'policy_number'],
    placeholder: 'Search certificates...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['status', 'production_id', 'event_id', 'company_id', 'vendor_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [] },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Certificate Details', fields: ['certificate_number', 'name', 'status'] },
        { key: 'coverage', title: 'Coverage', fields: ['insurance_provider', 'policy_number', 'coverage_type', 'coverage_amount'] },
        { key: 'holder', title: 'Certificate Holder', fields: ['certificate_holder_name', 'certificate_holder_address'] },
        { key: 'relationships', title: 'Relationships', fields: ['production_id', 'event_id', 'company_id', 'vendor_id'] },
        { key: 'dates', title: 'Dates', fields: ['effective_date', 'expiration_date'] },
        { key: 'documents', title: 'Documents', fields: ['certificate_url'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        'certificate_number', 'name', 'insurance_provider', 'coverage_type',
        { field: 'expiration_date', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { active: '#22c55e', expired: '#ef4444', pending: '#f59e0b', revoked: '#6b7280' } } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: Record<string, unknown>) => `/productions/compliance/certificates/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Certificate', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
