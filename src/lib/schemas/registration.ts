import { defineSchema } from '../schema/defineSchema';

export const registrationSchema = defineSchema({
  identity: {
    name: 'registration',
    namePlural: 'Registrations',
    slug: 'modules/production/registration',
    icon: 'Ticket',
    description: 'Event registrations and attendee management',
  },
  data: {
    endpoint: '/api/registrations',
    primaryKey: 'id',
    fields: {
      confirmation_number: {
        type: 'text',
        label: 'Confirmation #',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      contact_id: {
        type: 'relation',
        label: 'Registrant',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      registration_type_id: {
        type: 'relation',
        label: 'Registration Type',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'registration_type', display: 'name' },
      },
      status_id: {
        type: 'relation',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'status', display: 'name', filter: { domain: 'registration' } },
      },
      currency_id: {
        type: 'relation',
        label: 'Currency',
        required: true,
        inForm: true,
        relation: { entity: 'currency', display: 'code' },
      },
      registered_at: {
        type: 'datetime',
        label: 'Registered At',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      confirmed_at: {
        type: 'datetime',
        label: 'Confirmed At',
        inDetail: true,
      },
      cancelled_at: {
        type: 'datetime',
        label: 'Cancelled At',
        inDetail: true,
      },
      cancellation_reason: {
        type: 'textarea',
        label: 'Cancellation Reason',
        inDetail: true,
        inForm: true,
      },
      checked_in_at: {
        type: 'datetime',
        label: 'Checked In At',
        inTable: true,
        inDetail: true,
      },
      source: {
        type: 'select',
        label: 'Source',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Online', value: 'online' },
          { label: 'On-site', value: 'onsite' },
          { label: 'Phone', value: 'phone' },
          { label: 'Import', value: 'import' },
          { label: 'API', value: 'api' },
        ],
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.confirmation_number || 'New Registration'),
    subtitle: (r: Record<string, unknown>) => {
      const contact = r.contact as Record<string, unknown> | undefined;
      return contact ? String(contact.full_name || '') : '';
    },
    badge: (r: Record<string, unknown>) => {
      const status = r.status as Record<string, unknown> | undefined;
      if (!status) return { label: 'Unknown', variant: 'secondary' };
      const code = String(status.code || '');
      const variants: Record<string, string> = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'destructive',
        refunded: 'secondary',
        checked_in: 'success',
      };
      return { label: String(status.name || code), variant: variants[code] || 'secondary' };
    },
    defaultSort: { field: 'registered_at', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['confirmation_number'],
    placeholder: 'Search by confirmation number...',
  },
  filters: {
    quick: [
      { key: 'checked_in', label: 'Checked In', query: { where: { checked_in_at: { not: null } } } },
      { key: 'not_checked_in', label: 'Not Checked In', query: { where: { checked_in_at: null } } },
    ],
    advanced: ['status_id', 'registration_type_id', 'source'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'checked_in', label: 'Checked In', query: { where: { checked_in_at: { not: null } } }, count: true },
        { key: 'not_checked_in', label: 'Not Checked In', query: { where: { checked_in_at: null } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'tickets', label: 'Tickets', content: { type: 'related', entity: 'registration_line_item', foreignKey: 'registration_id' } },
        { key: 'sessions', label: 'Sessions', content: { type: 'related', entity: 'session_registration', foreignKey: 'registration_id' } },
        { key: 'credentials', label: 'Credentials', content: { type: 'related', entity: 'issued_credential', foreignKey: 'source_entity_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'total', label: 'Total Amount', value: { type: 'computed', compute: (r: Record<string, unknown>) => Number(r.total_cents || 0) / 100 }, format: 'currency' },
        ],
        blocks: [
          { key: 'contact', title: 'Registrant', content: { type: 'fields', fields: ['contact_id'] } },
          { key: 'event', title: 'Event', content: { type: 'fields', fields: ['event_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Registration Details', fields: ['event_id', 'contact_id', 'registration_type_id', 'status_id', 'currency_id', 'source'] },
        { key: 'notes', title: 'Notes', fields: ['notes', 'cancellation_reason'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['confirmation_number', 'contact_id', 'event_id', 'registration_type_id', 'status_id', 'registered_at', 'checked_in_at'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/registration/${r.id}` } },
      { key: 'check_in', label: 'Check In', variant: 'primary', handler: { type: 'api', endpoint: '/api/registrations', method: 'POST' }, condition: (r: Record<string, unknown>) => !r.checked_in_at },
      { key: 'cancel', label: 'Cancel', variant: 'destructive', handler: { type: 'api', endpoint: '/api/registrations', method: 'POST' }, condition: (r: Record<string, unknown>) => { const status = r.status as Record<string, unknown> | undefined; return status?.code !== 'cancelled'; } },
    ],
    bulk: [
      { key: 'bulk_check_in', label: 'Check In Selected', handler: { type: 'api', endpoint: '/api/registrations/bulk-check-in', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'New Registration', variant: 'primary', handler: { type: 'navigate', path: '/productions/registration/new' } },
      { key: 'import', label: 'Import', handler: { type: 'modal', component: 'ImportModal' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});
