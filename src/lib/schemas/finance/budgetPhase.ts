import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * BUDGET PHASE ENTITY SCHEMA (SSOT)
 *
 * Subdivides budgets into production lifecycle phases for
 * granular spend tracking per phase.
 */
export const budgetPhaseSchema = defineSchema({
  identity: {
    name: 'Budget Phase',
    namePlural: 'Budget Phases',
    slug: 'modules/finance/budget-phases',
    icon: 'Layers',
    description: 'Budget phases for production lifecycle tracking',
  },

  data: {
    endpoint: '/api/budget-phases',
    primaryKey: 'id',
    fields: {
      budget_id: {
        type: 'relation',
        label: 'Budget',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'budget', display: 'name' },
      },
      name: {
        type: 'text',
        label: 'Phase Name',
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
      phase_order: {
        type: 'number',
        label: 'Order',
        required: true,
        inTable: true,
        inForm: true,
        default: 0,
      },
      production_phase: {
        type: 'select',
        label: 'Production Phase',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pitch', value: 'pitch', color: 'gray' },
          { label: 'Pre-Production', value: 'pre_production', color: 'blue' },
          { label: 'Advance', value: 'advance', color: 'cyan' },
          { label: 'Load-In', value: 'load_in', color: 'purple' },
          { label: 'Show Day', value: 'show_day', color: 'emerald' },
          { label: 'Load-Out', value: 'load_out', color: 'orange' },
          { label: 'Strike', value: 'strike', color: 'red' },
          { label: 'Settlement', value: 'settlement', color: 'yellow' },
          { label: 'Post-Mortem', value: 'post_mortem', color: 'slate' },
        ],
      },
      start_date: {
        type: 'date',
        label: 'Start Date',
        inTable: true,
        inForm: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        inTable: true,
        inForm: true,
      },
      planned_amount: {
        type: 'currency',
        label: 'Planned Amount',
        required: true,
        inTable: true,
        inForm: true,
      },
      actual_amount: {
        type: 'currency',
        label: 'Actual Amount',
        inTable: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Planned', value: 'planned', color: 'gray' },
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Completed', value: 'completed', color: 'blue' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
        ],
        default: 'planned',
      },
    },
    computed: {
      variance: {
        label: 'Variance',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const planned = Number(r.planned_amount) || 0;
            const actual = Number(r.actual_amount) || 0;
            return planned - actual;
          },
        },
        format: 'currency',
        inTable: true,
        inDetail: true,
      },
      variance_percent: {
        label: 'Variance %',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const planned = Number(r.planned_amount) || 0;
            const actual = Number(r.actual_amount) || 0;
            if (planned === 0) return 0;
            return Math.round(((planned - actual) / planned) * 100);
          },
        },
        format: 'percentage',
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Phase'),
    subtitle: (r: Record<string, unknown>) => `$${Number(r.planned_amount || 0).toLocaleString()}`,
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        planned: { label: 'Planned', variant: 'secondary' },
        active: { label: 'Active', variant: 'success' },
        completed: { label: 'Completed', variant: 'primary' },
        cancelled: { label: 'Cancelled', variant: 'destructive' },
      };
      return statusMap[String(r.status)] || { label: String(r.status), variant: 'secondary' };
    },
    defaultSort: { field: 'phase_order', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name'], placeholder: 'Search phases...' },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['status', 'production_phase', 'budget_id'],
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
      ],
      overview: {
        stats: [
          { key: 'planned', label: 'Planned', value: { type: 'field', field: 'planned_amount' }, format: 'currency' },
          { key: 'actual', label: 'Actual', value: { type: 'field', field: 'actual_amount' }, format: 'currency' },
        ],
        blocks: [],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Phase Details', fields: ['budget_id', 'name', 'description', 'production_phase', 'phase_order'] },
        { key: 'financial', title: 'Financial', fields: ['planned_amount', 'status'] },
        { key: 'dates', title: 'Timeline', fields: ['start_date', 'end_date'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'production_phase', 'planned_amount', 'actual_amount', 'variance', 'status', 'phase_order'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/budgets/${r.budget_id}/phases/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Phase', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'budget', foreignKey: 'budget_id', label: 'Budget' },
    ],
  },



  permissions: { create: true, read: true, update: true, delete: true },
});
