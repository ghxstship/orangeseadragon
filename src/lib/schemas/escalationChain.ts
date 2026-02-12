import { defineSchema } from '../schema/defineSchema';

/**
 * ESCALATION CHAIN ENTITY SCHEMA (SSOT)
 * 
 * Defines automated escalation workflows for incidents based on
 * severity, type, and time thresholds.
 */
export const escalationChainSchema = defineSchema({
  identity: {
    name: 'escalation_chain',
    namePlural: 'Escalation Chains',
    slug: 'modules/operations/escalation-chains',
    icon: 'GitBranch',
    description: 'Automated incident escalation workflows',
  },

  data: {
    endpoint: '/api/escalation-chains',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Chain Name',
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
      incident_type: {
        type: 'select',
        label: 'Incident Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'All Types', value: 'all', color: 'gray' },
          { label: 'Medical', value: 'medical', color: 'red' },
          { label: 'Security', value: 'security', color: 'orange' },
          { label: 'Safety', value: 'safety', color: 'yellow' },
          { label: 'Fire', value: 'fire', color: 'red' },
          { label: 'Weather', value: 'weather', color: 'blue' },
          { label: 'Crowd', value: 'crowd', color: 'purple' },
          { label: 'Technical', value: 'technical', color: 'cyan' },
        ],
        default: 'all',
      },
      min_severity: {
        type: 'select',
        label: 'Minimum Severity',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Critical', value: 'critical', color: 'red' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Medium', value: 'medium', color: 'yellow' },
          { label: 'Low', value: 'low', color: 'gray' },
        ],
        default: 'high',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      venue_id: {
        type: 'relation',
        label: 'Venue',
        inForm: true,
      },
      steps: {
        type: 'json',
        label: 'Escalation Steps',
        inForm: true,
        inDetail: true,
      },
      notification_channels: {
        type: 'json',
        label: 'Notification Channels',
        inForm: true,
        inDetail: true,
      },
      auto_escalate: {
        type: 'switch',
        label: 'Auto-Escalate',
        inForm: true,
        inDetail: true,
        default: true,
      },
      created_by_id: {
        type: 'relation',
        label: 'Created By',
        inDetail: true,
      },
    },
    computed: {
      step_count: {
        label: 'Steps',
        computation: {
          type: 'derived',
          compute: (chain: Record<string, unknown>) => {
            const steps = chain.steps as unknown[];
            return Array.isArray(steps) ? steps.length : 0;
          },
        },
        inTable: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Chain'),
    subtitle: (r: Record<string, unknown>) => `${r.incident_type} - ${r.min_severity}+`,
    badge: (r: Record<string, unknown>) => ({
      label: r.is_active ? 'Active' : 'Inactive',
      variant: r.is_active ? 'primary' : 'secondary',
    }),
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search escalation chains...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['incident_type', 'min_severity', 'is_active', 'event_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'steps', label: 'Steps', content: { type: 'custom', component: 'EscalationStepsEditor' } },
        { key: 'history', label: 'Trigger History', content: { type: 'related', entity: 'escalation_logs', foreignKey: 'chain_id' } },
      ],
      overview: {
        stats: [
          { key: 'steps', label: 'Steps', value: { type: 'field', field: 'step_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'config', title: 'Configuration', content: { type: 'fields', fields: ['incident_type', 'min_severity', 'auto_escalate'] } },
          { key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Chain Details', fields: ['name', 'description', 'is_active'] },
        { key: 'triggers', title: 'Trigger Conditions', fields: ['incident_type', 'min_severity', 'event_id', 'venue_id'] },
        { key: 'behavior', title: 'Behavior', fields: ['auto_escalate'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name', 'incident_type',
        { field: 'min_severity', format: { type: 'badge', colorMap: { low: '#3b82f6', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' } } },
        { field: 'step_count', format: { type: 'number' } },
        { field: 'is_active', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/escalation-chains/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/escalation-chains/${r.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Chain', variant: 'primary', handler: { type: 'function', fn: () => {} } },
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
 * ESCALATION STEP INTERFACE
 * Defines the structure of each step in an escalation chain
 */
export interface EscalationStep {
  id: string;
  order: number;
  name: string;
  delay_minutes: number;
  notify_roles: string[];
  notify_users: string[];
  notify_teams: string[];
  notification_methods: ('push' | 'sms' | 'email' | 'radio' | 'phone')[];
  message_template: string;
  require_acknowledgment: boolean;
  acknowledgment_timeout_minutes: number;
  auto_proceed_on_timeout: boolean;
  actions: EscalationAction[];
}

export interface EscalationAction {
  type: 'assign' | 'notify' | 'create_task' | 'call_api' | 'send_alert';
  config: Record<string, unknown>;
}
