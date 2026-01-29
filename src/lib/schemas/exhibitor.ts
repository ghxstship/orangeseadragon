import { defineSchema } from '../schema/defineSchema';

export const exhibitorSchema = defineSchema({
  identity: {
    name: 'exhibitor',
    namePlural: 'Exhibitors',
    slug: 'modules/production/exhibitors',
    icon: 'Store',
    description: 'Event exhibitors and booth management',
  },
  data: {
    endpoint: '/api/exhibitors',
    primaryKey: 'id',
    fields: {
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      company_name: {
        type: 'text',
        label: 'Company Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      contact_id: {
        type: 'relation',
        label: 'Primary Contact',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      booth_number: {
        type: 'text',
        label: 'Booth Number',
        inTable: true,
        inForm: true,
      },
      booth_size: {
        type: 'select',
        label: 'Booth Size',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Standard (10x10)', value: 'standard' },
          { label: 'Premium (10x20)', value: 'premium' },
          { label: 'Island (20x20)', value: 'island' },
          { label: 'Custom', value: 'custom' },
        ],
      },
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Technology', value: 'technology' },
          { label: 'Services', value: 'services' },
          { label: 'Products', value: 'products' },
          { label: 'Food & Beverage', value: 'food_beverage' },
          { label: 'Entertainment', value: 'entertainment' },
          { label: 'Other', value: 'other' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Setup Complete', value: 'setup_complete' },
          { label: 'Active', value: 'active' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        default: 'pending',
      },
      contract_amount: {
        type: 'currency',
        label: 'Contract Amount',
        inTable: true,
        inForm: true,
      },
      payment_status: {
        type: 'select',
        label: 'Payment Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Unpaid', value: 'unpaid' },
          { label: 'Partial', value: 'partial' },
          { label: 'Paid', value: 'paid' },
        ],
        default: 'unpaid',
      },
      setup_date: {
        type: 'date',
        label: 'Setup Date',
        inForm: true,
        inDetail: true,
      },
      teardown_date: {
        type: 'date',
        label: 'Teardown Date',
        inForm: true,
        inDetail: true,
      },
      special_requirements: {
        type: 'textarea',
        label: 'Special Requirements',
        inForm: true,
        inDetail: true,
      },
      leads_collected: {
        type: 'number',
        label: 'Leads Collected',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.company_name || 'New Exhibitor'),
    subtitle: (r: Record<string, unknown>) => r.booth_number ? `Booth ${r.booth_number}` : '',
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        pending: 'warning',
        confirmed: 'default',
        setup_complete: 'default',
        active: 'success',
        cancelled: 'destructive',
      };
      return { label: String(r.status || 'pending'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'company_name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['company_name', 'booth_number'],
    placeholder: 'Search exhibitors...',
  },
  filters: {
    quick: [
      { key: 'confirmed', label: 'Confirmed', query: { where: { status: 'confirmed' } } },
    ],
    advanced: ['event_id', 'category', 'status', 'payment_status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'confirmed', label: 'Confirmed', query: { where: { status: 'confirmed' } }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'leads', label: 'Leads', content: { type: 'related', entity: 'exhibitor_lead', foreignKey: 'exhibitor_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'leads', label: 'Leads Collected', value: { type: 'field', field: 'leads_collected' }, format: 'number' },
          { key: 'contract', label: 'Contract Amount', value: { type: 'field', field: 'contract_amount' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Exhibitor Details', content: { type: 'fields', fields: ['company_name', 'contact_id', 'booth_number', 'booth_size', 'category', 'status'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Exhibitor Details', fields: ['event_id', 'company_name', 'contact_id', 'category', 'status'] },
        { key: 'booth', title: 'Booth', fields: ['booth_number', 'booth_size', 'setup_date', 'teardown_date'] },
        { key: 'contract', title: 'Contract', fields: ['contract_amount', 'payment_status'] },
        { key: 'requirements', title: 'Requirements', fields: ['special_requirements'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['company_name', 'event_id', 'booth_number', 'category', 'contract_amount', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/exhibitors/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Exhibitor', variant: 'primary', handler: { type: 'navigate', path: '/productions/exhibitors/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
