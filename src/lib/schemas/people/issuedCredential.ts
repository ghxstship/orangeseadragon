import { defineSchema } from '../../schema-engine/defineSchema';

export const issuedCredentialSchema = defineSchema({
  identity: {
    name: 'Issued Credential',
    namePlural: 'Issued Credentials',
    slug: 'modules/production/credentials',
    icon: 'BadgeCheck',
    description: 'Badges, passes, wristbands, and access credentials',
  },
  data: {
    endpoint: '/api/issued-credentials',
    primaryKey: 'id',
    fields: {
      credential_number: {
        type: 'text',
        label: 'Credential #',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      credential_type_id: {
        type: 'relation',
        label: 'Credential Type',
        required: true,
        inTable: true,
        inForm: true,
      },
      holder_contact_id: {
        type: 'relation',
        label: 'Holder',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      source_type: {
        type: 'select',
        label: 'Source',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Registration', value: 'registration' },
          { label: 'Partner', value: 'partner' },
          { label: 'Talent', value: 'talent' },
          { label: 'Staff', value: 'staff' },
          { label: 'VIP', value: 'vip' },
          { label: 'Press', value: 'press' },
          { label: 'Vendor', value: 'vendor' },
          { label: 'Manual', value: 'manual' },
        ],
      },
      source_entity_id: {
        type: 'text',
        label: 'Source Entity ID',
        inDetail: true,
      },
      valid_from: {
        type: 'datetime',
        label: 'Valid From',
        required: true,
        inForm: true,
        inDetail: true,
      },
      valid_until: {
        type: 'datetime',
        label: 'Valid Until',
        inForm: true,
        inDetail: true,
      },
      status_id: {
        type: 'relation',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
      },
      issued_at: {
        type: 'datetime',
        label: 'Issued At',
        inTable: true,
        inDetail: true,
      },
      issued_by_user_id: {
        type: 'relation',
        label: 'Issued By',
        inDetail: true,
        relation: { entity: 'profile', display: 'full_name' },
      },
      activated_at: {
        type: 'datetime',
        label: 'Activated At',
        inDetail: true,
      },
      printed_at: {
        type: 'datetime',
        label: 'Printed At',
        inTable: true,
        inDetail: true,
      },
      print_count: {
        type: 'number',
        label: 'Print Count',
        inDetail: true,
        default: 0,
      },
      collected_at: {
        type: 'datetime',
        label: 'Collected At',
        inDetail: true,
      },
      suspended_at: {
        type: 'datetime',
        label: 'Suspended At',
        inDetail: true,
      },
      suspended_reason: {
        type: 'textarea',
        label: 'Suspension Reason',
        inDetail: true,
      },
      revoked_at: {
        type: 'datetime',
        label: 'Revoked At',
        inDetail: true,
      },
      revoked_reason: {
        type: 'textarea',
        label: 'Revocation Reason',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.credential_number || 'New Credential'),
    subtitle: (r: Record<string, unknown>) => {
      const holder = r.holder_contact as Record<string, unknown> | undefined;
      return holder ? String(holder.full_name || '') : '';
    },
    badge: (r: Record<string, unknown>) => {
      const status = r.status as Record<string, unknown> | undefined;
      if (!status) return { label: 'Unknown', variant: 'secondary' };
      const code = String(status.code || '');
      const variants: Record<string, string> = {
        pending: 'warning',
        active: 'default',
        suspended: 'warning',
        revoked: 'destructive',
        expired: 'secondary',
      };
      return { label: String(status.name || code), variant: variants[code] || 'secondary' };
    },
    defaultSort: { field: 'issued_at', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['credential_number'],
    placeholder: 'Search by credential number...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { 'status.code': 'active' } } },
      { key: 'pending', label: 'Pending Print', query: { where: { printed_at: null } } },
    ],
    advanced: ['event_id', 'credential_type_id', 'source_type', 'status_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { 'status.code': 'active' } }, count: true },
        { key: 'pending', label: 'Pending Print', query: { where: { printed_at: null } }, count: true },
        { key: 'printed', label: 'Printed', query: { where: { printed_at: { not: null } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'access_log', label: 'Access Log', content: { type: 'related', entity: 'credential_access_log', foreignKey: 'credential_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'scans', label: 'Total Scans', value: { type: 'relation-count', entity: 'credential_access_log', foreignKey: 'credential_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'holder', title: 'Holder', content: { type: 'fields', fields: ['holder_contact_id', 'source_type'] } },
          { key: 'validity', title: 'Validity', content: { type: 'fields', fields: ['valid_from', 'valid_until'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Credential Info', fields: ['event_id', 'credential_type_id', 'holder_contact_id', 'source_type'] },
        { key: 'validity', title: 'Validity', fields: ['valid_from', 'valid_until', 'status_id'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['credential_number', 'holder_contact_id', 'credential_type_id', 'source_type', 'status_id', 'issued_at', 'printed_at'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/credentials/${r.id}` } },
      { key: 'print', label: 'Print', handler: { type: 'api', endpoint: '/api/issued-credentials/{id}/print', method: 'POST' }, condition: (r: Record<string, unknown>) => !r.printed_at },
      { key: 'suspend', label: 'Suspend', variant: 'warning', handler: { type: 'modal', component: 'SuspendCredentialModal' }, condition: (r: Record<string, unknown>) => { const status = r.status as Record<string, unknown> | undefined; return status?.code === 'active'; } },
      { key: 'revoke', label: 'Revoke', variant: 'destructive', handler: { type: 'modal', component: 'RevokeCredentialModal' }, condition: (r: Record<string, unknown>) => { const status = r.status as Record<string, unknown> | undefined; return status?.code !== 'revoked'; } },
    ],
    bulk: [
      { key: 'bulk_print', label: 'Print Selected', handler: { type: 'api', endpoint: '/api/issued-credentials/bulk-print', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'Issue Credential', variant: 'primary', handler: { type: 'navigate', path: '/productions/credentials/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: false },
});
