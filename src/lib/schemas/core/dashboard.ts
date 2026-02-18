import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * DASHBOARD ENTITY SCHEMA (SSOT)
 *
 * Configurable dashboard system with:
 * - Grid-based widget layout
 * - Multiple widget types (metric, chart, table, list, progress, comparison)
 * - Report-linked widgets with auto-refresh
 * - Private, team, and organization visibility
 * - Default dashboards per role
 */
export const dashboardSchema = defineSchema({
  identity: {
    name: 'Dashboard',
    namePlural: 'Dashboards',
    slug: 'modules/analytics/dashboards',
    icon: 'LayoutDashboard',
    description: 'Configurable dashboards with widgets and KPIs',
  },

  data: {
    endpoint: '/api/dashboards',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Dashboard Name',
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
      icon: {
        type: 'text',
        label: 'Icon',
        inForm: true,
      },
      layout_type: {
        type: 'select',
        label: 'Layout',
        inForm: true,
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'Freeform', value: 'freeform' },
          { label: 'Columns', value: 'columns' },
        ],
        default: 'grid',
      },
      column_count: {
        type: 'number',
        label: 'Grid Columns',
        inForm: true,
        default: 12,
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
          { label: 'Public', value: 'public' },
        ],
        default: 'private',
      },
      is_default: {
        type: 'switch',
        label: 'Default Dashboard',
        inTable: true,
        inForm: true,
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
        ],
        default: 'this_month',
      },
    },
    computed: {
      widget_count: {
        label: 'Widgets',
        computation: {
          type: 'relation-count',
          entity: 'dashboard_widgets',
          foreignKey: 'dashboard_id',
        },
        format: 'number',
        inTable: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Dashboard'),
    subtitle: (r: Record<string, unknown>) => String(r.description || ''),
    badge: (r: Record<string, unknown>) => r.is_default
      ? { label: 'Default', variant: 'primary' }
      : { label: String(r.visibility || 'private'), variant: 'secondary' },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search dashboards...' },

  filters: {
    quick: [
      { key: 'my', label: 'My Dashboards', query: { where: { visibility: 'private' } } },
      { key: 'shared', label: 'Shared', query: { where: { visibility: 'organization' } } },
    ],
    advanced: ['visibility', 'is_default'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'defaults', label: 'Defaults', query: { where: { is_default: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Dashboard', content: { type: 'overview' } },
        { key: 'widgets', label: 'Widgets', content: { type: 'related', entity: 'dashboard_widgets', foreignKey: 'dashboard_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'widgets', label: 'Widgets', value: { type: 'relation-count', entity: 'dashboard_widgets', foreignKey: 'dashboard_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'config', title: 'Configuration', content: { type: 'fields', fields: ['layout_type', 'column_count', 'default_date_range', 'visibility'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Dashboard Details', fields: ['name', 'description', 'slug', 'icon'] },
        { key: 'layout', title: 'Layout', fields: ['layout_type', 'column_count', 'default_date_range'] },
        { key: 'sharing', title: 'Sharing', fields: ['visibility', 'is_default'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'widget_count', 'visibility', 'is_default'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'Open Dashboard', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/analytics/dashboards/${r.slug || r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/analytics/dashboards/${r.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
      { key: 'set-default', label: 'Set as Default', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => !r.is_default },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Dashboard', variant: 'primary', handler: { type: 'navigate', path: '/analytics/dashboards/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
