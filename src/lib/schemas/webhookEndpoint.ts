import { defineSchema } from '../schema/defineSchema';

/**
 * WEBHOOK ENDPOINT ENTITY SCHEMA (SSOT)
 *
 * Outbound webhook management with:
 * - Event subscription filtering
 * - Custom headers and secret signing
 * - Retry configuration with exponential backoff
 * - Delivery tracking with success/failure stats
 */
export const webhookEndpointSchema = defineSchema({
  identity: {
    name: 'Webhook Endpoint',
    namePlural: 'Webhook Endpoints',
    slug: 'modules/ecosystem/webhooks',
    icon: 'Webhook',
    description: 'Outbound webhook endpoints with event subscriptions and delivery tracking',
  },

  data: {
    endpoint: '/api/webhook-endpoints',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      url: {
        type: 'url',
        label: 'Endpoint URL',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      secret: {
        type: 'text',
        label: 'Signing Secret',
        inForm: true,
        inDetail: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      events: {
        type: 'multiselect',
        label: 'Subscribed Events',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Project Created', value: 'project.created' },
          { label: 'Project Updated', value: 'project.updated' },
          { label: 'Task Created', value: 'task.created' },
          { label: 'Task Completed', value: 'task.completed' },
          { label: 'Invoice Created', value: 'invoice.created' },
          { label: 'Invoice Paid', value: 'invoice.paid' },
          { label: 'Payment Received', value: 'payment.received' },
          { label: 'Deal Won', value: 'deal.won' },
          { label: 'Deal Lost', value: 'deal.lost' },
          { label: 'Time Entry Created', value: 'time_entry.created' },
          { label: 'Budget Alert', value: 'budget.alert' },
          { label: 'Approval Requested', value: 'approval.requested' },
          { label: 'Approval Completed', value: 'approval.completed' },
          { label: 'Document Uploaded', value: 'document.uploaded' },
          { label: 'Client Comment', value: 'client_comment.created' },
        ],
      },
      custom_headers: {
        type: 'json',
        label: 'Custom Headers',
        inForm: true,
        inDetail: true,
      },
      max_retries: {
        type: 'number',
        label: 'Max Retries',
        inForm: true,
        inDetail: true,
        default: 3,
      },
      retry_delay_seconds: {
        type: 'number',
        label: 'Retry Delay (seconds)',
        inForm: true,
        inDetail: true,
        default: 60,
      },
      last_triggered_at: {
        type: 'datetime',
        label: 'Last Triggered',
        inTable: true,
        inDetail: true,
        readOnly: true,
      },
      success_count: {
        type: 'number',
        label: 'Successes',
        inTable: true,
        inDetail: true,
        readOnly: true,
        default: 0,
      },
      failure_count: {
        type: 'number',
        label: 'Failures',
        inTable: true,
        inDetail: true,
        readOnly: true,
        default: 0,
      },
      last_response_code: {
        type: 'number',
        label: 'Last Response Code',
        inDetail: true,
        readOnly: true,
      },
      last_error: {
        type: 'text',
        label: 'Last Error',
        inDetail: true,
        readOnly: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Webhook'),
    subtitle: (r: Record<string, unknown>) => String(r.url || ''),
    badge: (r: Record<string, unknown>) => ({
      label: r.is_active ? 'Active' : 'Inactive',
      variant: r.is_active ? 'success' : 'secondary',
    }),
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'url'],
    placeholder: 'Search webhooks...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'failing', label: 'Failing', query: { where: { last_response_code: { gte: 400 } } } },
    ],
    advanced: ['is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'deliveries', label: 'Delivery Log', content: { type: 'related', entity: 'webhook_deliveries', foreignKey: 'webhook_endpoint_id' } },
      ],
      overview: {
        stats: [
          { key: 'successes', label: 'Successes', value: { type: 'field', field: 'success_count' }, format: 'number' },
          { key: 'failures', label: 'Failures', value: { type: 'field', field: 'failure_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'config', title: 'Configuration', content: { type: 'fields', fields: ['url', 'events', 'max_retries', 'retry_delay_seconds', 'custom_headers'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Endpoint', fields: ['name', 'url', 'secret', 'is_active'] },
        { key: 'events', title: 'Events', fields: ['events'] },
        { key: 'retry', title: 'Retry Configuration', fields: ['max_retries', 'retry_delay_seconds', 'custom_headers'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'url', 'is_active', 'events', 'success_count', 'failure_count', 'last_triggered_at'],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/ecosystem/webhooks/${r.id}/edit` } },
      { key: 'test', label: 'Send Test', variant: 'secondary', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'activate', label: 'Activate', handler: { type: 'function', fn: () => {} } },
      { key: 'deactivate', label: 'Deactivate', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Webhook', variant: 'primary', handler: { type: 'navigate', path: '/ecosystem/webhooks/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
