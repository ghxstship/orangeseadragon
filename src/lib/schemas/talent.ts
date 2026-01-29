import { defineSchema } from '../schema/defineSchema';

export const talentSchema = defineSchema({
  identity: {
    name: 'talent',
    namePlural: 'Talent',
    slug: 'modules/production/talent',
    icon: 'Mic2',
    description: 'Speakers, performers, artists, and other talent',
  },
  data: {
    endpoint: '/api/talent',
    primaryKey: 'id',
    fields: {
      contact_id: {
        type: 'relation',
        label: 'Contact',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      talent_type_id: {
        type: 'relation',
        label: 'Talent Type',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'talent_type', display: 'name' },
      },
      stage_name: {
        type: 'text',
        label: 'Stage Name',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      professional_bio: {
        type: 'richtext',
        label: 'Professional Bio',
        inForm: true,
        inDetail: true,
      },
      headshot_url: {
        type: 'image',
        label: 'Headshot',
        inForm: true,
        inDetail: true,
      },
      professional_title: {
        type: 'text',
        label: 'Professional Title',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      represented_company: {
        type: 'text',
        label: 'Company/Organization',
        inForm: true,
        inDetail: true,
      },
      booking_rate_cents: {
        type: 'currency',
        label: 'Booking Rate',
        inForm: true,
        inDetail: true,
      },
      booking_rate_type: {
        type: 'select',
        label: 'Rate Type',
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Flat Fee', value: 'flat' },
          { label: 'Hourly', value: 'hourly' },
          { label: 'Daily', value: 'daily' },
          { label: 'Per Event', value: 'per_event' },
        ],
      },
      currency_id: {
        type: 'relation',
        label: 'Currency',
        inForm: true,
        relation: { entity: 'currency', display: 'code' },
      },
      agent_contact_id: {
        type: 'relation',
        label: 'Agent/Manager',
        inForm: true,
        inDetail: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      status_id: {
        type: 'relation',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'status', display: 'name', filter: { domain: 'talent' } },
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      if (r.stage_name) return String(r.stage_name);
      const contact = r.contact as Record<string, unknown> | undefined;
      return contact ? String(contact.full_name || 'Untitled') : 'Untitled';
    },
    subtitle: (r: Record<string, unknown>) => {
      const talentType = r.talent_type as Record<string, unknown> | undefined;
      const title = r.professional_title ? String(r.professional_title) : '';
      const type = talentType ? String(talentType.name || '') : '';
      return [type, title].filter(Boolean).join(' • ');
    },
    badge: (r: Record<string, unknown>) => {
      const status = r.status as Record<string, unknown> | undefined;
      if (!status) return { label: 'Unknown', variant: 'secondary' };
      return { label: String(status.name || ''), variant: 'default' };
    },
    defaultSort: { field: 'stage_name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['stage_name', 'professional_title'],
    placeholder: 'Search talent...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'speakers', label: 'Speakers', query: { where: { 'talent_type.code': 'speaker' } } },
      { key: 'performers', label: 'Performers', query: { where: { 'talent_type.code': 'performer' } } },
    ],
    advanced: ['talent_type_id', 'status_id', 'is_active'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'speakers', label: 'Speakers', query: { where: { 'talent_type.code': 'speaker' } }, count: true },
        { key: 'performers', label: 'Performers', query: { where: { 'talent_type.code': 'performer' } }, count: true },
        { key: 'artists', label: 'Artists', query: { where: { 'talent_type.code': 'artist' } }, count: true },
      ],
      defaultView: 'cards',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'skills', label: 'Skills', content: { type: 'related', entity: 'talent_skill', foreignKey: 'talent_id' } },
        { key: 'media', label: 'Media', content: { type: 'related', entity: 'talent_media', foreignKey: 'talent_id' } },
        { key: 'bookings', label: 'Bookings', content: { type: 'related', entity: 'session_talent', foreignKey: 'talent_id' } },
        { key: 'riders', label: 'Riders', content: { type: 'related', entity: 'talent_rider', foreignKey: 'talent_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'bookings', label: 'Total Bookings', value: { type: 'relation-count', entity: 'session_talent', foreignKey: 'talent_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'bio', title: 'Biography', content: { type: 'fields', fields: ['professional_bio'] } },
          { key: 'contact', title: 'Contact Info', content: { type: 'fields', fields: ['contact_id', 'agent_contact_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Info', fields: ['contact_id', 'talent_type_id', 'stage_name', 'professional_title', 'represented_company'] },
        { key: 'profile', title: 'Profile', fields: ['headshot_url', 'professional_bio'] },
        { key: 'booking', title: 'Booking Info', fields: ['booking_rate_cents', 'booking_rate_type', 'currency_id', 'agent_contact_id'] },
        { key: 'status', title: 'Status', fields: ['status_id', 'is_active'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['contact_id', 'stage_name', 'talent_type_id', 'professional_title', 'status_id', 'is_active'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/talent/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/talent/${r.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Talent', variant: 'primary', handler: { type: 'navigate', path: '/productions/talent/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
