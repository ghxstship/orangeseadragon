import { defineSchema } from '../schema/defineSchema';

/**
 * CLIENT PORTAL ACCESS ENTITY SCHEMA (SSOT)
 *
 * Client-facing portal with:
 * - Granular permission controls (budgets, invoices, tasks, documents, reports)
 * - Access levels: viewer, commenter, collaborator, admin
 * - Magic link authentication
 * - Login tracking and activity audit
 * - Custom welcome messaging per client
 */
export const clientPortalAccessSchema = defineSchema({
  identity: {
    name: 'Client Portal Access',
    namePlural: 'Client Portal Access',
    slug: 'modules/ecosystem/client-portal',
    icon: 'Globe',
    description: 'Client-facing portal access with granular permissions',
  },

  data: {
    endpoint: '/api/client-portal-access',
    primaryKey: 'id',
    fields: {
      company_id: {
        type: 'relation',
        label: 'Company',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        relation: { entity: 'company', display: 'name' },
      },
      contact_id: {
        type: 'relation',
        label: 'Contact',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        relation: { entity: 'contact', display: 'name' },
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      access_level: {
        type: 'select',
        label: 'Access Level',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Viewer', value: 'viewer', color: 'gray' },
          { label: 'Commenter', value: 'commenter', color: 'blue' },
          { label: 'Collaborator', value: 'collaborator', color: 'green' },
          { label: 'Admin', value: 'admin', color: 'purple' },
        ],
        default: 'viewer',
      },
      last_login_at: {
        type: 'datetime',
        label: 'Last Login',
        inTable: true,
        inDetail: true,
        readOnly: true,
      },
      login_count: {
        type: 'number',
        label: 'Login Count',
        inDetail: true,
        readOnly: true,
        default: 0,
      },
      can_view_budgets: {
        type: 'switch',
        label: 'View Budgets',
        inForm: true,
        inDetail: true,
        default: false,
      },
      can_view_invoices: {
        type: 'switch',
        label: 'View Invoices',
        inForm: true,
        inDetail: true,
        default: true,
      },
      can_view_tasks: {
        type: 'switch',
        label: 'View Tasks',
        inForm: true,
        inDetail: true,
        default: false,
      },
      can_view_documents: {
        type: 'switch',
        label: 'View Documents',
        inForm: true,
        inDetail: true,
        default: true,
      },
      can_view_reports: {
        type: 'switch',
        label: 'View Reports',
        inForm: true,
        inDetail: true,
        default: false,
      },
      can_comment: {
        type: 'switch',
        label: 'Can Comment',
        inForm: true,
        inDetail: true,
        default: true,
      },
      can_approve: {
        type: 'switch',
        label: 'Can Approve',
        inForm: true,
        inDetail: true,
        default: false,
      },
      can_upload: {
        type: 'switch',
        label: 'Can Upload',
        inForm: true,
        inDetail: true,
        default: false,
      },
      custom_welcome_message: {
        type: 'textarea',
        label: 'Welcome Message',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.contact_id || 'Client'),
    subtitle: (r: Record<string, unknown>) => `${r.access_level} — ${r.is_active ? 'Active' : 'Inactive'}`,
    badge: (r: Record<string, unknown>) => ({
      label: r.is_active ? 'Active' : 'Inactive',
      variant: r.is_active ? 'success' : 'secondary',
    }),
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['contact_id', 'company_id'],
    placeholder: 'Search portal access...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'inactive', label: 'Inactive', query: { where: { is_active: false } } },
    ],
    advanced: ['access_level', 'is_active', 'can_approve'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'admins', label: 'Admins', query: { where: { access_level: 'admin' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'shared', label: 'Shared Items', content: { type: 'related', entity: 'client_shared_items', foreignKey: 'portal_access_id' } },
        { key: 'comments', label: 'Comments', content: { type: 'related', entity: 'client_comments', foreignKey: 'portal_access_id' } },
        { key: 'approvals', label: 'Approvals', content: { type: 'related', entity: 'client_approvals', foreignKey: 'responded_by_portal_id' } },
      ],
      overview: {
        stats: [
          { key: 'logins', label: 'Logins', value: { type: 'field', field: 'login_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'permissions', title: 'Permissions', content: { type: 'fields', fields: ['can_view_budgets', 'can_view_invoices', 'can_view_tasks', 'can_view_documents', 'can_view_reports', 'can_comment', 'can_approve', 'can_upload'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'client', title: 'Client', fields: ['company_id', 'contact_id', 'access_level', 'is_active'] },
        { key: 'permissions', title: 'Permissions', fields: ['can_view_budgets', 'can_view_invoices', 'can_view_tasks', 'can_view_documents', 'can_view_reports', 'can_comment', 'can_approve', 'can_upload'] },
        { key: 'branding', title: 'Branding', fields: ['custom_welcome_message'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['contact_id', 'company_id', 'access_level', 'is_active', 'last_login_at', 'login_count'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/ecosystem/client-portal/${r.id}` } },
      { key: 'deactivate', label: 'Deactivate', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'activate', label: 'Activate', handler: { type: 'function', fn: () => {} } },
      { key: 'deactivate', label: 'Deactivate', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'invite', label: 'Invite Client', variant: 'primary', handler: { type: 'navigate', path: '/ecosystem/client-portal/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
