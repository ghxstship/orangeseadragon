import { defineSchema } from '../schema/defineSchema';

export const leadScoreSchema = defineSchema({
  identity: {
    name: 'Lead Score',
    namePlural: 'Lead Scores',
    slug: 'modules/business/lead-scoring',
    icon: 'BarChart',
    description: 'Lead scoring rules and configurations',
  },
  data: {
    endpoint: '/api/lead-scores',
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
      category: {
        type: 'select',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Demographic', value: 'demographic' },
          { label: 'Behavioral', value: 'behavioral' },
          { label: 'Engagement', value: 'engagement' },
          { label: 'Firmographic', value: 'firmographic' },
          { label: 'Intent', value: 'intent' },
        ],
      },
      trigger_type: {
        type: 'select',
        label: 'Trigger Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Field Value', value: 'field_value' },
          { label: 'Activity', value: 'activity' },
          { label: 'Page Visit', value: 'page_visit' },
          { label: 'Email Action', value: 'email_action' },
          { label: 'Form Submit', value: 'form_submit' },
          { label: 'Event Attendance', value: 'event_attendance' },
        ],
      },
      trigger_config: {
        type: 'json',
        label: 'Trigger Configuration',
        inForm: true,
        inDetail: true,
        helpText: 'JSON configuration for the trigger conditions',
      },
      points: {
        type: 'number',
        label: 'Points',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        helpText: 'Points to add (positive) or subtract (negative)',
      },
      max_occurrences: {
        type: 'number',
        label: 'Max Occurrences',
        inForm: true,
        inDetail: true,
        helpText: 'Maximum times this rule can apply per lead (blank = unlimited)',
      },
      decay_days: {
        type: 'number',
        label: 'Decay After (Days)',
        inForm: true,
        inDetail: true,
        helpText: 'Points decay after this many days (blank = no decay)',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      priority: {
        type: 'number',
        label: 'Priority',
        inForm: true,
        default: 0,
        helpText: 'Higher priority rules are evaluated first',
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Rule'),
    subtitle: (r: Record<string, unknown>) => `${r.category} • ${Number(r.points) > 0 ? '+' : ''}${r.points} points`,
    badge: (r: Record<string, unknown>) => {
      if (!r.is_active) return { label: 'Inactive', variant: 'secondary' };
      const points = Number(r.points || 0);
      if (points > 0) return { label: `+${points}`, variant: 'default' };
      if (points < 0) return { label: String(points), variant: 'destructive' };
      return { label: '0', variant: 'secondary' };
    },
    defaultSort: { field: 'priority', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search scoring rules...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'behavioral', label: 'Behavioral', query: { where: { category: 'behavioral' } } },
      { key: 'engagement', label: 'Engagement', query: { where: { category: 'engagement' } } },
    ],
    advanced: ['category', 'trigger_type', 'is_active'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'demographic', label: 'Demographic', query: { where: { category: 'demographic' } }, count: true },
        { key: 'behavioral', label: 'Behavioral', query: { where: { category: 'behavioral' } }, count: true },
        { key: 'engagement', label: 'Engagement', query: { where: { category: 'engagement' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'history', label: 'Application History', content: { type: 'related', entity: 'lead_score_event', foreignKey: 'rule_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'applications', label: 'Times Applied', value: { type: 'relation-count', entity: 'lead_score_event', foreignKey: 'rule_id' }, format: 'number' },
          { key: 'points', label: 'Points Value', value: { type: 'field', field: 'points' }, format: 'number' },
        ],
        blocks: [
          { key: 'config', title: 'Rule Configuration', content: { type: 'fields', fields: ['trigger_type', 'trigger_config', 'max_occurrences', 'decay_days'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Rule Info', fields: ['name', 'description', 'category'] },
        { key: 'trigger', title: 'Trigger', fields: ['trigger_type', 'trigger_config'] },
        { key: 'scoring', title: 'Scoring', fields: ['points', 'max_occurrences', 'decay_days'] },
        { key: 'settings', title: 'Settings', fields: ['priority', 'is_active'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'category', 'trigger_type', 'points', 'is_active'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/lead-scoring/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/lead-scoring/${r.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'api', endpoint: '/api/lead-scores/duplicate', method: 'POST' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Rule', variant: 'primary', handler: { type: 'navigate', path: '/business/lead-scoring/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
