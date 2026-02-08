import { defineSchema } from '../schema/defineSchema';

/**
 * BUDGET TEMPLATE ENTITY SCHEMA (SSOT)
 *
 * Reusable budget templates for different production types.
 * Auto-populates line items, phases, and payment milestones
 * when creating a new budget from template.
 */
export const budgetTemplateSchema = defineSchema({
  identity: {
    name: 'Budget Template',
    namePlural: 'Budget Templates',
    slug: 'modules/finance/budget-templates',
    icon: 'FileSpreadsheet',
    description: 'Reusable budget templates for production types',
  },

  data: {
    endpoint: '/api/budget-templates',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Template Name',
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
      budget_type: {
        type: 'select',
        label: 'Budget Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Fixed Price', value: 'fixed_price', color: 'blue' },
          { label: 'Time & Materials', value: 'time_and_materials', color: 'purple' },
          { label: 'Retainer', value: 'retainer', color: 'green' },
          { label: 'Hybrid', value: 'hybrid', color: 'orange' },
          { label: 'Cost Plus', value: 'cost_plus', color: 'cyan' },
        ],
        default: 'fixed_price',
      },
      production_type: {
        type: 'select',
        label: 'Production Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Concert / Festival', value: 'concert_festival' },
          { label: 'Corporate Event', value: 'corporate_event' },
          { label: 'Conference', value: 'conference' },
          { label: 'Trade Show', value: 'trade_show' },
          { label: 'Broadcast / Film', value: 'broadcast_film' },
          { label: 'Theater', value: 'theater' },
          { label: 'Tour', value: 'tour' },
          { label: 'Installation', value: 'installation' },
          { label: 'General', value: 'general' },
        ],
      },
      is_default: {
        type: 'switch',
        label: 'Default Template',
        inTable: true,
        inForm: true,
        default: false,
      },
      template_data: {
        type: 'json',
        label: 'Template Configuration',
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Template'),
    subtitle: (r: Record<string, unknown>) => String(r.production_type || '').replace(/_/g, ' '),
    badge: (r: Record<string, unknown>) => r.is_default ? { label: 'Default', variant: 'primary' } : undefined,
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name'], placeholder: 'Search templates...' },

  filters: {
    quick: [],
    advanced: ['budget_type', 'production_type'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'line-items', label: 'Template Line Items', content: { type: 'related', entity: 'budget_template_line_items', foreignKey: 'template_id' } },
      ],
      overview: {
        stats: [],
        blocks: [],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Template Details', fields: ['name', 'description', 'budget_type', 'production_type', 'is_default'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'budget_type', 'production_type', 'is_default'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/budget-templates/${r.id}` } },
      { key: 'use', label: 'Create Budget from Template', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Template', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
