import { defineSchema } from '../schema-engine/defineSchema';

/**
 * VENDOR PORTAL ACCESS ENTITY SCHEMA (SSOT)
 * 
 * Manages external vendor access to event operations,
 * including document sharing, schedule visibility, and communication.
 */
export const vendorPortalAccessSchema = defineSchema({
  identity: {
    name: 'vendor_portal_access',
    namePlural: 'Vendor Portal Access',
    slug: 'modules/operations/vendor-portal',
    icon: 'Building2',
    description: 'External vendor portal access and permissions',
  },

  data: {
    endpoint: '/api/vendor-portal-access',
    primaryKey: 'id',
    fields: {
      vendor_id: {
        type: 'relation',
        label: 'Vendor',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
      },
      contact_name: {
        type: 'text',
        label: 'Contact Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      contact_email: {
        type: 'email',
        label: 'Contact Email',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      contact_phone: {
        type: 'text',
        label: 'Contact Phone',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Suspended', value: 'suspended', color: 'orange' },
          { label: 'Revoked', value: 'revoked', color: 'red' },
          { label: 'Expired', value: 'expired', color: 'gray' },
        ],
        default: 'pending',
      },
      access_level: {
        type: 'select',
        label: 'Access Level',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'View Only', value: 'view', color: 'gray' },
          { label: 'Standard', value: 'standard', color: 'blue' },
          { label: 'Full', value: 'full', color: 'green' },
        ],
        default: 'standard',
      },
      permissions: {
        type: 'json',
        label: 'Permissions',
        inForm: true,
        inDetail: true,
      },
      access_token: {
        type: 'text',
        label: 'Access Token',
        inDetail: true,
      },
      token_expires_at: {
        type: 'datetime',
        label: 'Token Expires',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      last_login_at: {
        type: 'datetime',
        label: 'Last Login',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      login_count: {
        type: 'number',
        label: 'Login Count',
        inDetail: true,
      },
      invited_by_id: {
        type: 'relation',
        label: 'Invited By',
        inDetail: true,
      },
      invited_at: {
        type: 'datetime',
        label: 'Invited At',
        inDetail: true,
      },
      activated_at: {
        type: 'datetime',
        label: 'Activated At',
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
    computed: {
      is_expired: {
        label: 'Expired',
        computation: {
          type: 'derived',
          compute: (access: Record<string, unknown>) => {
            if (!access.token_expires_at) return false;
            return new Date(access.token_expires_at as string) < new Date();
          },
        },
        inTable: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.contact_name || 'Unknown Contact'),
    subtitle: (r: Record<string, unknown>) => String(r.contact_email || ''),
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        pending: { label: 'Pending', variant: 'warning' },
        active: { label: 'Active', variant: 'primary' },
        suspended: { label: 'Suspended', variant: 'warning' },
        revoked: { label: 'Revoked', variant: 'destructive' },
        expired: { label: 'Expired', variant: 'secondary' },
      };
      return statusMap[r.status as string] || { label: 'Unknown', variant: 'secondary' };
    },
    defaultSort: { field: 'last_login_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['contact_name', 'contact_email'],
    placeholder: 'Search vendor contacts...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
    ],
    advanced: ['status', 'access_level', 'event_id', 'vendor_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'expired', label: 'Expired', query: { where: { status: 'expired' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity Log', content: { type: 'activity' } },
        { key: 'documents', label: 'Shared Documents', content: { type: 'related', entity: 'vendor_documents', foreignKey: 'portal_access_id' } },
      ],
      overview: {
        stats: [
          { key: 'logins', label: 'Total Logins', value: { type: 'field', field: 'login_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'contact', title: 'Contact', content: { type: 'fields', fields: ['contact_name', 'contact_email', 'contact_phone'] } },
          { key: 'access', title: 'Access', content: { type: 'fields', fields: ['access_level', 'token_expires_at', 'last_login_at'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'vendor', title: 'Vendor', fields: ['vendor_id', 'event_id'] },
        { key: 'contact', title: 'Contact', fields: ['contact_name', 'contact_email', 'contact_phone'] },
        { key: 'access', title: 'Access', fields: ['status', 'access_level', 'token_expires_at'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['contact_name', 'contact_email', 'vendor_id', 'status', 'access_level', 'last_login_at', 'is_expired'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/vendor-portal/${r.id}` } },
      { key: 'resend', label: 'Resend Invite', handler: { type: 'function', fn: () => {} } },
      { key: 'revoke', label: 'Revoke Access', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'activate', label: 'Activate', handler: { type: 'function', fn: () => {} } },
      { key: 'revoke', label: 'Revoke', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'invite', label: 'Invite Vendor', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

/**
 * VENDOR DOCUMENT ENTITY SCHEMA
 * Documents shared with vendors through the portal
 */
export const vendorDocumentSchema = defineSchema({
  identity: {
    name: 'vendor_document',
    namePlural: 'Vendor Documents',
    slug: 'modules/operations/vendor-documents',
    icon: 'FileText',
    description: 'Documents shared with vendors',
  },

  data: {
    endpoint: '/api/vendor-documents',
    primaryKey: 'id',
    fields: {
      portal_access_id: {
        type: 'relation',
        label: 'Portal Access',
        required: true,
        inTable: true,
      },
      document_id: {
        type: 'relation',
        relation: { entity: 'document', display: 'name' },
        label: 'Document',
        required: true,
        inTable: true,
        inForm: true,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Contract', value: 'contract', color: 'blue' },
          { label: 'Schedule', value: 'schedule', color: 'green' },
          { label: 'Floor Plan', value: 'floor_plan', color: 'purple' },
          { label: 'Technical Specs', value: 'tech_specs', color: 'cyan' },
          { label: 'Safety', value: 'safety', color: 'red' },
          { label: 'Other', value: 'other', color: 'gray' },
        ],
      },
      shared_at: {
        type: 'datetime',
        label: 'Shared At',
        inTable: true,
        sortable: true,
      },
      shared_by_id: {
        type: 'relation',
        label: 'Shared By',
        inDetail: true,
      },
      viewed_at: {
        type: 'datetime',
        label: 'Last Viewed',
        inTable: true,
      },
      view_count: {
        type: 'number',
        label: 'Views',
        inTable: true,
      },
      requires_acknowledgment: {
        type: 'switch',
        label: 'Requires Acknowledgment',
        inForm: true,
        inDetail: true,
      },
      acknowledged_at: {
        type: 'datetime',
        label: 'Acknowledged At',
        inDetail: true,
      },
      expires_at: {
        type: 'datetime',
        label: 'Expires At',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Document'),
    subtitle: (r: Record<string, unknown>) => String(r.category || ''),
    badge: (r: Record<string, unknown>) => ({ label: String(r.category), variant: 'secondary' }),
    defaultSort: { field: 'shared_at', direction: 'desc' },
  },

  search: { enabled: true, fields: ['name'], placeholder: 'Search documents...' },
  filters: { quick: [], advanced: ['category'] },

  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [] },
    },
    form: {
      sections: [
        { key: 'document', title: 'Document', fields: ['name', 'document_id', 'category'] },
        { key: 'settings', title: 'Settings', fields: ['requires_acknowledgment', 'expires_at'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'category', 'shared_at', 'viewed_at', 'view_count'],
    },
  },

  actions: { row: [], bulk: [], global: [] },
  permissions: { create: true, read: true, update: true, delete: true },
});

/**
 * VENDOR PERMISSION TYPES
 */
export interface VendorPermissions {
  view_schedule: boolean;
  view_floor_plan: boolean;
  view_contacts: boolean;
  view_documents: boolean;
  download_documents: boolean;
  submit_requests: boolean;
  view_weather: boolean;
  receive_notifications: boolean;
  chat_enabled: boolean;
}

export const DEFAULT_VENDOR_PERMISSIONS: Record<string, VendorPermissions> = {
  view: {
    view_schedule: true,
    view_floor_plan: true,
    view_contacts: false,
    view_documents: true,
    download_documents: false,
    submit_requests: false,
    view_weather: true,
    receive_notifications: false,
    chat_enabled: false,
  },
  standard: {
    view_schedule: true,
    view_floor_plan: true,
    view_contacts: true,
    view_documents: true,
    download_documents: true,
    submit_requests: true,
    view_weather: true,
    receive_notifications: true,
    chat_enabled: false,
  },
  full: {
    view_schedule: true,
    view_floor_plan: true,
    view_contacts: true,
    view_documents: true,
    download_documents: true,
    submit_requests: true,
    view_weather: true,
    receive_notifications: true,
    chat_enabled: true,
  },
};
