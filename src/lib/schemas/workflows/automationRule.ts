import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * AUTOMATION RULE ENTITY SCHEMA (SSOT)
 *
 * No-code workflow automation with:
 * - Entity-based triggers (created, updated, status_changed, field_changed)
 * - Schedule-based triggers (cron)
 * - Date-reached triggers
 * - Configurable action chains (update field, create task, send notification, etc.)
 * - Execution logging and run limits
 */
export const automationRuleSchema = defineSchema({
  identity: {
    name: 'Automation Rule',
    namePlural: 'Automation Rules',
    slug: 'modules/operations/automations',
    icon: 'Zap',
    description: 'No-code workflow automations with triggers and actions',
  },

  data: {
    endpoint: '/api/automation-rules',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Rule Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
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
      trigger_entity: {
        type: 'select',
        label: 'Trigger Entity',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Task', value: 'task' },
          { label: 'Project', value: 'project' },
          { label: 'Deal', value: 'deal' },
          { label: 'Invoice', value: 'invoice' },
          { label: 'Budget', value: 'budget' },
          { label: 'Time Entry', value: 'time_entry' },
          { label: 'Expense', value: 'expense' },
          { label: 'Contact', value: 'contact' },
          { label: 'Event', value: 'event' },
          { label: 'Resource Booking', value: 'resource_booking' },
        ],
      },
      trigger_event: {
        type: 'select',
        label: 'Trigger Event',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Created', value: 'created' },
          { label: 'Updated', value: 'updated' },
          { label: 'Deleted', value: 'deleted' },
          { label: 'Status Changed', value: 'status_changed' },
          { label: 'Field Changed', value: 'field_changed' },
          { label: 'Date Reached', value: 'date_reached' },
          { label: 'Schedule', value: 'schedule' },
        ],
      },
      trigger_conditions: {
        type: 'code',
        label: 'Trigger Conditions (JSON)',
        inForm: true,
        inDetail: true,
        helpText: 'JSON array of condition objects: [{ "field": "status", "operator": "equals", "value": "done" }]',
      },
      actions: {
        type: 'code',
        label: 'Actions (JSON)',
        required: true,
        inForm: true,
        inDetail: true,
        helpText: 'JSON array of action objects: [{ "type": "update_field", "field": "status", "value": "in_review" }]',
      },
      cron_expression: {
        type: 'text',
        label: 'Cron Expression',
        inForm: true,
        inDetail: true,
        helpText: 'For schedule triggers only (e.g. "0 9 * * 1" = every Monday 9am)',
      },
      run_count: {
        type: 'number',
        label: 'Run Count',
        inTable: true,
        inDetail: true,
      },
      max_runs: {
        type: 'number',
        label: 'Max Runs',
        inForm: true,
        inDetail: true,
        helpText: 'Leave empty for unlimited',
      },
      last_run_at: {
        type: 'datetime',
        label: 'Last Run',
        inTable: true,
        inDetail: true,
      },
      next_run_at: {
        type: 'datetime',
        label: 'Next Run',
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Rule'),
    subtitle: (r: Record<string, unknown>) => `When ${r.trigger_entity} is ${r.trigger_event}`,
    badge: (r: Record<string, unknown>) => r.is_active
      ? { label: 'Active', variant: 'success' }
      : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search automations...' },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'inactive', label: 'Inactive', query: { where: { is_active: false } } },
    ],
    advanced: ['trigger_entity', 'trigger_event', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'inactive', label: 'Inactive', query: { where: { is_active: false } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'executions', label: 'Execution Log', content: { type: 'related', entity: 'automation_executions', foreignKey: 'automation_rule_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'runs', label: 'Total Runs', value: { type: 'field', field: 'run_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'trigger', title: 'Trigger', content: { type: 'fields', fields: ['trigger_entity', 'trigger_event', 'trigger_conditions', 'cron_expression'] } },
          { key: 'actions', title: 'Actions', content: { type: 'fields', fields: ['actions'] } },
          { key: 'limits', title: 'Limits', content: { type: 'fields', fields: ['max_runs', 'run_count', 'last_run_at', 'next_run_at'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Rule Details', fields: ['name', 'description', 'is_active'] },
        { key: 'trigger', title: 'Trigger', fields: ['trigger_entity', 'trigger_event', 'trigger_conditions', 'cron_expression'] },
        { key: 'actions', title: 'Actions', fields: ['actions'] },
        { key: 'limits', title: 'Limits', fields: ['max_runs'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name', 'trigger_entity', 'trigger_event',
        { field: 'is_active', format: { type: 'boolean' } },
        { field: 'run_count', format: { type: 'number' } },
        { field: 'last_run_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/automations/${r.id}` } },
      { key: 'toggle', label: 'Toggle Active', handler: { type: 'function', fn: () => {} } },
      { key: 'run-now', label: 'Run Now', variant: 'primary', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.is_active === true },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Automation', variant: 'primary', handler: { type: 'navigate', path: '/operations/automations/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
