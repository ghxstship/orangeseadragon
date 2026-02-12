import { defineSchema } from '../schema/defineSchema';

/**
 * LABOR RULE SET ENTITY SCHEMA (SSOT)
 *
 * Configurable union/non-union labor rules for:
 * - Overtime calculation (daily/weekly thresholds, multipliers)
 * - Meal penalty tracking (6-hour rule, penalty amounts)
 * - Turnaround violation detection (10-hour minimum)
 * - Rest period enforcement
 * - Weekend/holiday multipliers
 * - Minimum call hours
 * - Per diem rates
 *
 * Supports IATSE, Teamsters, IBEW, UA, SAG-AFTRA, and custom rule sets.
 */
export const laborRuleSetSchema = defineSchema({
  identity: {
    name: 'Labor Rule Set',
    namePlural: 'Labor Rule Sets',
    slug: 'modules/people/labor-rules',
    icon: 'Scale',
    description: 'Union and non-union labor rules for overtime, meals, and turnaround',
  },

  data: {
    endpoint: '/api/labor-rule-sets',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Rule Set Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      rule_type: {
        type: 'select',
        label: 'Rule Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'IATSE', value: 'iatse', color: 'blue' },
          { label: 'Teamsters', value: 'teamsters', color: 'red' },
          { label: 'IBEW', value: 'ibew', color: 'yellow' },
          { label: 'UA', value: 'ua', color: 'green' },
          { label: 'SAG-AFTRA', value: 'sag_aftra', color: 'purple' },
          { label: 'Non-Union', value: 'non_union', color: 'gray' },
          { label: 'Custom', value: 'custom', color: 'orange' },
        ],
        default: 'custom',
      },
      jurisdiction: {
        type: 'text',
        label: 'Jurisdiction',
        inTable: true,
        inForm: true,
        placeholder: 'e.g., New York Local 1, Los Angeles Local 33',
      },
      is_default: {
        type: 'switch',
        label: 'Default Rule Set',
        inTable: true,
        inForm: true,
        default: false,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      // Standard hours
      standard_daily_hours: {
        type: 'number',
        label: 'Standard Daily Hours',
        inForm: true,
        inDetail: true,
        default: 8,
      },
      standard_weekly_hours: {
        type: 'number',
        label: 'Standard Weekly Hours',
        inForm: true,
        inDetail: true,
        default: 40,
      },
      // Overtime
      overtime_after_daily_hours: {
        type: 'number',
        label: 'OT After (daily hours)',
        inForm: true,
        inDetail: true,
        default: 8,
      },
      overtime_multiplier: {
        type: 'number',
        label: 'OT Multiplier',
        inForm: true,
        inDetail: true,
        default: 1.5,
      },
      double_time_after_daily_hours: {
        type: 'number',
        label: 'Double Time After (daily hours)',
        inForm: true,
        inDetail: true,
        default: 12,
      },
      double_time_multiplier: {
        type: 'number',
        label: 'Double Time Multiplier',
        inForm: true,
        inDetail: true,
        default: 2.0,
      },
      golden_time_after_daily_hours: {
        type: 'number',
        label: 'Golden Time After (daily hours)',
        inForm: true,
        inDetail: true,
      },
      golden_time_multiplier: {
        type: 'number',
        label: 'Golden Time Multiplier',
        inForm: true,
        inDetail: true,
      },
      // Meal penalties
      meal_break_required_after_hours: {
        type: 'number',
        label: 'Meal Break Required After (hours)',
        inForm: true,
        inDetail: true,
        default: 6,
      },
      meal_break_duration_minutes: {
        type: 'number',
        label: 'Meal Break Duration (minutes)',
        inForm: true,
        inDetail: true,
        default: 30,
      },
      meal_penalty_amount: {
        type: 'currency',
        label: 'Meal Penalty Amount',
        inForm: true,
        inDetail: true,
        default: 50,
      },
      // Turnaround
      minimum_turnaround_hours: {
        type: 'number',
        label: 'Minimum Turnaround (hours)',
        inForm: true,
        inDetail: true,
        default: 10,
      },
      turnaround_violation_multiplier: {
        type: 'number',
        label: 'Turnaround Violation Multiplier',
        inForm: true,
        inDetail: true,
        default: 1.5,
      },
      // Weekend/Holiday
      saturday_multiplier: {
        type: 'number',
        label: 'Saturday Multiplier',
        inForm: true,
        inDetail: true,
        default: 1.5,
      },
      sunday_multiplier: {
        type: 'number',
        label: 'Sunday Multiplier',
        inForm: true,
        inDetail: true,
        default: 2.0,
      },
      holiday_multiplier: {
        type: 'number',
        label: 'Holiday Multiplier',
        inForm: true,
        inDetail: true,
        default: 2.5,
      },
      // Minimums
      minimum_call_hours: {
        type: 'number',
        label: 'Minimum Call (hours)',
        inForm: true,
        inDetail: true,
        default: 4,
      },
      // Per diem
      per_diem_amount: {
        type: 'currency',
        label: 'Per Diem Amount',
        inForm: true,
        inDetail: true,
      },
      // Dates
      effective_date: {
        type: 'date',
        label: 'Effective Date',
        inTable: true,
        inForm: true,
      },
      expiration_date: {
        type: 'date',
        label: 'Expiration Date',
        inTable: true,
        inForm: true,
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
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Rule Set'),
    subtitle: (r: Record<string, unknown>) => {
      const type = String(r.rule_type || 'custom').replace(/_/g, ' ').toUpperCase();
      return r.jurisdiction ? `${type} · ${r.jurisdiction}` : type;
    },
    badge: (r: Record<string, unknown>) => r.is_active ? { label: 'Active', variant: 'success' } : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name', 'jurisdiction'], placeholder: 'Search labor rules...' },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['rule_type', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'union', label: 'Union', query: { where: {} }, count: true },
        { key: 'non-union', label: 'Non-Union', query: { where: { rule_type: 'non_union' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'overtime', label: 'Overtime Rules', content: { type: 'fields', fields: ['standard_daily_hours', 'standard_weekly_hours', 'overtime_after_daily_hours', 'overtime_multiplier', 'double_time_after_daily_hours', 'double_time_multiplier', 'golden_time_after_daily_hours', 'golden_time_multiplier'] } },
        { key: 'meals', label: 'Meal Rules', content: { type: 'fields', fields: ['meal_break_required_after_hours', 'meal_break_duration_minutes', 'meal_penalty_amount'] } },
        { key: 'turnaround', label: 'Turnaround', content: { type: 'fields', fields: ['minimum_turnaround_hours', 'turnaround_violation_multiplier'] } },
        { key: 'rates', label: 'Rate Multipliers', content: { type: 'fields', fields: ['saturday_multiplier', 'sunday_multiplier', 'holiday_multiplier'] } },
      ],
      overview: {
        stats: [
          { key: 'daily', label: 'Standard Day', value: { type: 'field', field: 'standard_daily_hours' }, suffix: 'hrs' },
          { key: 'ot', label: 'OT After', value: { type: 'field', field: 'overtime_after_daily_hours' }, suffix: 'hrs' },
          { key: 'meal', label: 'Meal After', value: { type: 'field', field: 'meal_break_required_after_hours' }, suffix: 'hrs' },
          { key: 'turnaround', label: 'Min Turnaround', value: { type: 'field', field: 'minimum_turnaround_hours' }, suffix: 'hrs' },
        ],
        blocks: [],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Rule Set Details', fields: ['name', 'description', 'rule_type', 'jurisdiction', 'is_default', 'is_active'] },
        { key: 'hours', title: 'Standard Hours', fields: ['standard_daily_hours', 'standard_weekly_hours'] },
        { key: 'overtime', title: 'Overtime Rules', fields: ['overtime_after_daily_hours', 'overtime_multiplier', 'double_time_after_daily_hours', 'double_time_multiplier', 'golden_time_after_daily_hours', 'golden_time_multiplier'] },
        { key: 'meals', title: 'Meal Penalty Rules', fields: ['meal_break_required_after_hours', 'meal_break_duration_minutes', 'meal_penalty_amount'] },
        { key: 'turnaround', title: 'Turnaround Rules', fields: ['minimum_turnaround_hours', 'turnaround_violation_multiplier'] },
        { key: 'multipliers', title: 'Weekend & Holiday Multipliers', fields: ['saturday_multiplier', 'sunday_multiplier', 'holiday_multiplier'] },
        { key: 'minimums', title: 'Minimums & Per Diem', fields: ['minimum_call_hours', 'per_diem_amount'] },
        { key: 'dates', title: 'Effective Dates', fields: ['effective_date', 'expiration_date'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        'rule_type',
        'jurisdiction',
        { field: 'standard_daily_hours', format: { type: 'number' } },
        { field: 'overtime_after_daily_hours', format: { type: 'number' } },
        { field: 'minimum_turnaround_hours', format: { type: 'number' } },
        { field: 'is_active', format: { type: 'boolean' } },
        { field: 'effective_date', format: { type: 'date' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/labor-rules/${r.id}` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Rule Set', variant: 'primary', handler: { type: 'navigate', path: () => '/people/labor-rules/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
