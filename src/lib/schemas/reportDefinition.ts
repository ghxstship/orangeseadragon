import { defineSchema } from '../schema-engine/defineSchema';

/**
 * REPORT DEFINITION ENTITY SCHEMA (SSOT)
 *
 * Configurable reporting engine with:
 * - Multiple report types (table, chart, pivot, summary, comparison, trend)
 * - Flexible data source with joins, columns, filters, grouping, aggregations
 * - Chart configuration for visual reports
 * - Date range presets and custom ranges
 * - Private, team, and organization visibility
 * - Scheduled delivery via email/Slack/webhook
 */
export const reportDefinitionSchema = defineSchema({
  identity: {
    name: 'Report',
    namePlural: 'Reports',
    slug: 'modules/analytics/reports',
    icon: 'BarChart3',
    description: 'Configurable reports with charts, tables, and scheduled delivery',
  },

  data: {
    endpoint: '/api/report-definitions',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Report Name',
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
      slug: {
        type: 'text',
        label: 'Slug',
        required: true,
        inForm: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Financial', value: 'financial' },
          { label: 'Time', value: 'time' },
          { label: 'Resource', value: 'resource' },
          { label: 'Project', value: 'project' },
          { label: 'Sales', value: 'sales' },
          { label: 'People', value: 'people' },
          { label: 'Custom', value: 'custom' },
        ],
      },
      report_type: {
        type: 'select',
        label: 'Report Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Table', value: 'table' },
          { label: 'Chart', value: 'chart' },
          { label: 'Pivot', value: 'pivot' },
          { label: 'Summary', value: 'summary' },
          { label: 'Comparison', value: 'comparison' },
          { label: 'Trend', value: 'trend' },
        ],
        default: 'table',
      },
      base_entity: {
        type: 'select',
        label: 'Data Source',
        required: true,
        inForm: true,
        options: [
          { label: 'Projects', value: 'project' },
          { label: 'Tasks', value: 'task' },
          { label: 'Time Entries', value: 'time_entry' },
          { label: 'Budgets', value: 'budget' },
          { label: 'Invoices', value: 'invoice' },
          { label: 'Deals', value: 'deal' },
          { label: 'Expenses', value: 'expense' },
          { label: 'Resource Bookings', value: 'resource_booking' },
          { label: 'Contacts', value: 'contact' },
          { label: 'Events', value: 'event' },
        ],
      },
      columns: {
        type: 'code',
        label: 'Columns (JSON)',
        required: true,
        inForm: true,
        inDetail: true,
      },
      filters: {
        type: 'code',
        label: 'Filters (JSON)',
        inForm: true,
        inDetail: true,
      },
      grouping: {
        type: 'code',
        label: 'Grouping (JSON)',
        inForm: true,
        inDetail: true,
      },
      aggregations: {
        type: 'code',
        label: 'Aggregations (JSON)',
        inForm: true,
        inDetail: true,
      },
      chart_type: {
        type: 'select',
        label: 'Chart Type',
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Bar', value: 'bar' },
          { label: 'Line', value: 'line' },
          { label: 'Pie', value: 'pie' },
          { label: 'Donut', value: 'donut' },
          { label: 'Area', value: 'area' },
          { label: 'Scatter', value: 'scatter' },
          { label: 'Heatmap', value: 'heatmap' },
          { label: 'Funnel', value: 'funnel' },
          { label: 'Gauge', value: 'gauge' },
        ],
      },
      default_date_range: {
        type: 'select',
        label: 'Default Date Range',
        inForm: true,
        options: [
          { label: 'Today', value: 'today' },
          { label: 'This Week', value: 'this_week' },
          { label: 'This Month', value: 'this_month' },
          { label: 'This Quarter', value: 'this_quarter' },
          { label: 'This Year', value: 'this_year' },
          { label: 'Last Month', value: 'last_month' },
          { label: 'Last Quarter', value: 'last_quarter' },
          { label: 'All Time', value: 'all_time' },
        ],
        default: 'this_month',
      },
      visibility: {
        type: 'select',
        label: 'Visibility',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Private', value: 'private' },
          { label: 'Team', value: 'team' },
          { label: 'Organization', value: 'organization' },
        ],
        default: 'private',
      },
      is_favorite: {
        type: 'switch',
        label: 'Favorite',
        inTable: true,
        inForm: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Report'),
    subtitle: (r: Record<string, unknown>) => `${r.category} — ${r.report_type}`,
    badge: (r: Record<string, unknown>) => {
      const catMap: Record<string, string> = {
        financial: 'success', time: 'primary', resource: 'warning',
        project: 'secondary', sales: 'default', people: 'primary', custom: 'secondary',
      };
      return { label: String(r.category || ''), variant: catMap[String(r.category)] || 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search reports...' },

  filters: {
    quick: [
      { key: 'favorites', label: 'Favorites', query: { where: { is_favorite: true } } },
      { key: 'financial', label: 'Financial', query: { where: { category: 'financial' } } },
      { key: 'time', label: 'Time', query: { where: { category: 'time' } } },
    ],
    advanced: ['category', 'report_type', 'visibility', 'base_entity'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'favorites', label: 'Favorites', query: { where: { is_favorite: true } }, count: true },
        { key: 'financial', label: 'Financial', query: { where: { category: 'financial' } }, count: true },
        { key: 'time', label: 'Time', query: { where: { category: 'time' } }, count: true },
        { key: 'project', label: 'Project', query: { where: { category: 'project' } }, count: true },
        { key: 'sales', label: 'Sales', query: { where: { category: 'sales' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Report', content: { type: 'overview' } },
        { key: 'snapshots', label: 'Snapshots', content: { type: 'related', entity: 'report_snapshots', foreignKey: 'report_definition_id' } },
        { key: 'schedules', label: 'Schedules', content: { type: 'related', entity: 'scheduled_reports', foreignKey: 'report_definition_id' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'config', title: 'Configuration', content: { type: 'fields', fields: ['base_entity', 'report_type', 'chart_type', 'default_date_range'] } },
          { key: 'data', title: 'Data Definition', content: { type: 'fields', fields: ['columns', 'filters', 'grouping', 'aggregations'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Report Details', fields: ['name', 'description', 'slug', 'category', 'report_type'] },
        { key: 'source', title: 'Data Source', fields: ['base_entity', 'columns', 'filters', 'grouping', 'aggregations'] },
        { key: 'display', title: 'Display', fields: ['chart_type', 'default_date_range'] },
        { key: 'sharing', title: 'Sharing', fields: ['visibility', 'is_favorite'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name', 'category', 'report_type',
        { field: 'visibility', format: { type: 'badge', colorMap: { public: '#22c55e', private: '#6b7280', team: '#3b82f6' } } },
        { field: 'is_favorite', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View Report', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/analytics/reports/${r.id}` } },
      { key: 'run', label: 'Run Now', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'export', label: 'Export', handler: { type: 'function', fn: () => {} } },
      { key: 'schedule', label: 'Schedule', handler: { type: 'function', fn: () => {} } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'export-all', label: 'Export Selected', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Report', variant: 'primary', handler: { type: 'navigate', path: '/analytics/reports/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
