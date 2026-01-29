import { defineSchema } from '../schema/defineSchema';

export const partnerSchema = defineSchema({
  identity: {
    name: 'Partner',
    namePlural: 'Partners',
    slug: 'modules/production/partners',
    icon: 'Handshake',
    description: 'Sponsors, exhibitors, vendors, and other event partners',
  },
  data: {
    endpoint: '/api/event-partners',
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
      company_id: {
        type: 'relation',
        label: 'Company',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'company', display: 'name' },
      },
      partner_type_id: {
        type: 'relation',
        label: 'Partner Type',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'partner_type', display: 'name' },
      },
      sponsorship_level_id: {
        type: 'relation',
        label: 'Sponsorship Level',
        inTable: true,
        inForm: true,
        relation: { entity: 'sponsorship_level', display: 'name' },
      },
      status_id: {
        type: 'relation',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'status', display: 'name', filter: { domain: 'partner' } },
      },
      contract_id: {
        type: 'relation',
        label: 'Contract',
        inForm: true,
        inDetail: true,
        relation: { entity: 'contract', display: 'name' },
      },
      display_name: {
        type: 'text',
        label: 'Display Name',
        inForm: true,
        inDetail: true,
        helpText: 'Override company name for this event',
      },
      display_logo_url: {
        type: 'image',
        label: 'Display Logo',
        inForm: true,
        inDetail: true,
        helpText: 'Override company logo for this event',
      },
      display_description: {
        type: 'textarea',
        label: 'Display Description',
        inForm: true,
        inDetail: true,
      },
      display_website_url: {
        type: 'url',
        label: 'Display Website',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      if (r.display_name) return String(r.display_name);
      const company = r.company as Record<string, unknown> | undefined;
      return company ? String(company.name || 'Untitled') : 'Untitled';
    },
    subtitle: (r: Record<string, unknown>) => {
      const partnerType = r.partner_type as Record<string, unknown> | undefined;
      const level = r.sponsorship_level as Record<string, unknown> | undefined;
      const parts = [];
      if (partnerType) parts.push(String(partnerType.name || ''));
      if (level) parts.push(String(level.name || ''));
      return parts.join(' • ');
    },
    badge: (r: Record<string, unknown>) => {
      const status = r.status as Record<string, unknown> | undefined;
      if (!status) return { label: 'Unknown', variant: 'secondary' };
      const code = String(status.code || '');
      const variants: Record<string, string> = {
        pending: 'warning',
        confirmed: 'default',
        active: 'default',
        cancelled: 'destructive',
      };
      return { label: String(status.name || code), variant: variants[code] || 'secondary' };
    },
    defaultSort: { field: 'company_id', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['display_name'],
    placeholder: 'Search partners...',
  },
  filters: {
    quick: [
      { key: 'sponsors', label: 'Sponsors', query: { where: { 'partner_type.code': 'sponsor' } } },
      { key: 'exhibitors', label: 'Exhibitors', query: { where: { 'partner_type.code': 'exhibitor' } } },
      { key: 'vendors', label: 'Vendors', query: { where: { 'partner_type.code': 'vendor' } } },
    ],
    advanced: ['event_id', 'partner_type_id', 'sponsorship_level_id', 'status_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'sponsors', label: 'Sponsors', query: { where: { 'partner_type.code': 'sponsor' } }, count: true },
        { key: 'exhibitors', label: 'Exhibitors', query: { where: { 'partner_type.code': 'exhibitor' } }, count: true },
        { key: 'vendors', label: 'Vendors', query: { where: { 'partner_type.code': 'vendor' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'benefits', label: 'Benefits', content: { type: 'related', entity: 'partner_benefit_granted', foreignKey: 'partner_id' } },
        { key: 'deliverables', label: 'Deliverables', content: { type: 'related', entity: 'partner_deliverable', foreignKey: 'partner_id' } },
        { key: 'contacts', label: 'Contacts', content: { type: 'related', entity: 'partner_contact', foreignKey: 'partner_id' } },
        { key: 'booth', label: 'Booth', content: { type: 'related', entity: 'booth_assignment', foreignKey: 'partner_id' } },
        { key: 'credentials', label: 'Credentials', content: { type: 'related', entity: 'issued_credential', foreignKey: 'source_entity_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'benefits', label: 'Benefits', value: { type: 'relation-count', entity: 'partner_benefit_granted', foreignKey: 'partner_id' }, format: 'number' },
          { key: 'deliverables', label: 'Deliverables', value: { type: 'relation-count', entity: 'partner_deliverable', foreignKey: 'partner_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'company', title: 'Company', content: { type: 'fields', fields: ['company_id', 'contract_id'] } },
          { key: 'display', title: 'Display Settings', content: { type: 'fields', fields: ['display_name', 'display_description', 'display_website_url'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Partner Info', fields: ['event_id', 'company_id', 'partner_type_id', 'sponsorship_level_id', 'status_id'] },
        { key: 'contract', title: 'Contract', fields: ['contract_id'] },
        { key: 'display', title: 'Display Overrides', fields: ['display_name', 'display_logo_url', 'display_description', 'display_website_url'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['company_id', 'event_id', 'partner_type_id', 'sponsorship_level_id', 'status_id'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/partners/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/partners/${r.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Partner', variant: 'primary', handler: { type: 'navigate', path: '/productions/partners/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
