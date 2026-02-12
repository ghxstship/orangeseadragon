import { defineSchema } from '../schema/defineSchema';

/**
 * OAUTH CONNECTION ENTITY SCHEMA (SSOT)
 *
 * Third-party OAuth integration management with:
 * - 13 supported providers (Google, Microsoft, Slack, QuickBooks, Xero, etc.)
 * - Token lifecycle management (access, refresh, expiry)
 * - Sync status tracking with error reporting
 * - Scope-based permission grants
 */
export const oauthConnectionSchema = defineSchema({
  identity: {
    name: 'OAuth Connection',
    namePlural: 'OAuth Connections',
    slug: 'modules/ecosystem/oauth-connections',
    icon: 'Link2',
    description: 'Third-party OAuth integrations with sync tracking',
  },

  data: {
    endpoint: '/api/oauth-connections',
    primaryKey: 'id',
    fields: {
      user_id: {
        type: 'relation',
        label: 'Connected By',
        required: true,
        inTable: true,
        inDetail: true,
        relation: { entity: 'people', display: 'name' },
      },
      provider: {
        type: 'select',
        label: 'Provider',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Google', value: 'google', color: 'red' },
          { label: 'Microsoft', value: 'microsoft', color: 'blue' },
          { label: 'Slack', value: 'slack', color: 'purple' },
          { label: 'QuickBooks', value: 'quickbooks', color: 'green' },
          { label: 'Xero', value: 'xero', color: 'blue' },
          { label: 'HubSpot', value: 'hubspot', color: 'orange' },
          { label: 'Salesforce', value: 'salesforce', color: 'blue' },
          { label: 'Jira', value: 'jira', color: 'blue' },
          { label: 'Asana', value: 'asana', color: 'red' },
          { label: 'GitHub', value: 'github', color: 'gray' },
          { label: 'Figma', value: 'figma', color: 'purple' },
          { label: 'Dropbox', value: 'dropbox', color: 'blue' },
          { label: 'Box', value: 'box', color: 'blue' },
        ],
      },
      provider_user_id: {
        type: 'text',
        label: 'Provider User ID',
        inDetail: true,
        readOnly: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      scopes: {
        type: 'multiselect',
        label: 'Granted Scopes',
        inDetail: true,
        readOnly: true,
        options: [],
      },
      token_expires_at: {
        type: 'datetime',
        label: 'Token Expires',
        inDetail: true,
        readOnly: true,
      },
      last_synced_at: {
        type: 'datetime',
        label: 'Last Synced',
        inTable: true,
        inDetail: true,
        readOnly: true,
      },
      sync_status: {
        type: 'select',
        label: 'Sync Status',
        inTable: true,
        inDetail: true,
        readOnly: true,
        options: [
          { label: 'Idle', value: 'idle', color: 'gray' },
          { label: 'Syncing', value: 'syncing', color: 'blue' },
          { label: 'Error', value: 'error', color: 'red' },
          { label: 'Paused', value: 'paused', color: 'yellow' },
        ],
        default: 'idle',
      },
      sync_error: {
        type: 'text',
        label: 'Sync Error',
        inDetail: true,
        readOnly: true,
      },
      metadata: {
        type: 'json',
        label: 'Metadata',
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.provider || 'Connection'),
    subtitle: (r: Record<string, unknown>) => `${r.sync_status} — Last synced: ${r.last_synced_at || 'Never'}`,
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, string> = {
        idle: 'secondary', syncing: 'primary', error: 'destructive', paused: 'warning',
      };
      return { label: String(r.sync_status || 'idle'), variant: statusMap[String(r.sync_status)] || 'secondary' };
    },
    defaultSort: { field: 'provider', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['provider'],
    placeholder: 'Search connections...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'errors', label: 'Errors', query: { where: { sync_status: 'error' } } },
    ],
    advanced: ['provider', 'is_active', 'sync_status'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'errors', label: 'Errors', query: { where: { sync_status: 'error' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'connection', title: 'Connection Details', content: { type: 'fields', fields: ['provider', 'provider_user_id', 'scopes', 'token_expires_at'] } },
          { key: 'sync', title: 'Sync Status', content: { type: 'fields', fields: ['sync_status', 'last_synced_at', 'sync_error'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'provider', title: 'Provider', fields: ['provider', 'is_active'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'provider',
        { field: 'user_id', format: { type: 'relation', entityType: 'person' } },
        { field: 'is_active', format: { type: 'boolean' } },
        { field: 'sync_status', format: { type: 'badge', colorMap: { synced: '#22c55e', syncing: '#3b82f6', error: '#ef4444', pending: '#f59e0b' } } },
        { field: 'last_synced_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'sync', label: 'Sync Now', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'disconnect', label: 'Disconnect', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'connect', label: 'Connect Provider', variant: 'primary', handler: { type: 'navigate', path: '/ecosystem/integrations/connect' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
