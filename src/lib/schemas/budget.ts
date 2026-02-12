import { defineSchema } from '../schema/defineSchema';

/**
 * BUDGET ENTITY SCHEMA (SSOT)
 *
 * Full-featured budget management with:
 * - Budget types (fixed, T&M, retainer, hybrid, cost-plus)
 * - Budget phases for production lifecycle tracking
 * - Alert thresholds for spend monitoring
 * - Profitability tracking (revenue - costs = margin)
 * - Markup/agency fee calculation
 * - Retainer management
 * - Progressive billing via payment milestones
 * - Production-specific budget categories
 */
export const budgetSchema = defineSchema({
  identity: {
    name: 'budget',
    namePlural: 'Budgets',
    slug: 'modules/finance/budgets',
    icon: 'PiggyBank',
    description: 'Project and event budgets with profitability tracking',
  },

  data: {
    endpoint: '/api/budgets',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Budget Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      budget_type: {
        type: 'select',
        label: 'Budget Type',
        required: true,
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
      project_id: {
        type: 'relation',
        label: 'Project',
        inTable: true,
        inForm: true,
        relation: { entity: 'project', display: 'name' },
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      parent_budget_id: {
        type: 'relation',
        label: 'Parent Budget',
        inForm: true,
        inDetail: true,
        relation: { entity: 'budget', display: 'name' },
      },
      department_id: {
        type: 'relation',
        label: 'Department',
        inForm: true,
        relation: { entity: 'department', display: 'name' },
      },
      period_type: {
        type: 'select',
        label: 'Period Type',
        required: true,
        inForm: true,
        options: [
          { label: 'Annual', value: 'annual' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Project', value: 'project' },
          { label: 'Event', value: 'event' },
        ],
        default: 'project',
      },
      total_amount: {
        type: 'currency',
        label: 'Total Budget',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      revenue_amount: {
        type: 'currency',
        label: 'Revenue',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      cost_amount: {
        type: 'currency',
        label: 'Costs',
        inTable: true,
        inDetail: true,
      },
      invoiced_amount: {
        type: 'currency',
        label: 'Invoiced',
        inTable: true,
        inDetail: true,
      },
      draft_invoice_amount: {
        type: 'currency',
        label: 'Draft Invoices',
        inDetail: true,
      },
      currency: {
        type: 'text',
        label: 'Currency',
        inForm: true,
        default: 'USD',
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Pending Approval', value: 'pending_approval', color: 'yellow' },
          { label: 'Approved', value: 'approved', color: 'blue' },
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Closed', value: 'closed', color: 'slate' },
        ],
        default: 'draft',
      },
      start_date: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      // Markup & Agency Fee
      markup_type: {
        type: 'select',
        label: 'Markup Type',
        inForm: true,
        inDetail: true,
        options: [
          { label: 'None', value: 'none' },
          { label: 'Percentage', value: 'percentage' },
          { label: 'Flat Fee', value: 'flat_fee' },
          { label: 'Cost Plus', value: 'cost_plus' },
        ],
        default: 'none',
      },
      markup_value: {
        type: 'number',
        label: 'Markup Value',
        inForm: true,
        inDetail: true,
      },
      agency_fee_amount: {
        type: 'currency',
        label: 'Agency Fee',
        inForm: true,
        inDetail: true,
      },
      // Alert Thresholds
      alert_threshold_warning: {
        type: 'number',
        label: 'Warning Threshold %',
        inForm: true,
        default: 75,
      },
      alert_threshold_critical: {
        type: 'number',
        label: 'Critical Threshold %',
        inForm: true,
        default: 90,
      },
      // Retainer fields
      retainer_amount: {
        type: 'currency',
        label: 'Retainer Amount',
        inForm: true,
        inDetail: true,
      },
      retainer_hours: {
        type: 'number',
        label: 'Retainer Hours',
        inForm: true,
        inDetail: true,
      },
      retainer_period: {
        type: 'select',
        label: 'Retainer Period',
        inForm: true,
        options: [
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Annually', value: 'annually' },
        ],
      },
      retainer_rollover: {
        type: 'switch',
        label: 'Rollover Unused Hours',
        inForm: true,
        default: false,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
    computed: {
      profit_amount: {
        label: 'Profit',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const revenue = Number(r.revenue_amount) || 0;
            const cost = Number(r.cost_amount) || 0;
            return revenue - cost;
          },
        },
        format: 'currency',
        inTable: true,
        inDetail: true,
      },
      profit_margin: {
        label: 'Margin',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const revenue = Number(r.revenue_amount) || 0;
            const cost = Number(r.cost_amount) || 0;
            if (revenue === 0) return 0;
            return Math.round(((revenue - cost) / revenue) * 100);
          },
        },
        format: 'percentage',
        inTable: true,
        inDetail: true,
      },
      burn_percentage: {
        label: 'Burn %',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const total = Number(r.total_amount) || 0;
            const cost = Number(r.cost_amount) || 0;
            if (total === 0) return 0;
            return Math.round((cost / total) * 100);
          },
        },
        format: 'percentage',
        inTable: true,
        inDetail: true,
      },
      available_to_invoice: {
        label: 'Available to Invoice',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const total = Number(r.total_amount) || 0;
            const invoiced = Number(r.invoiced_amount) || 0;
            const draft = Number(r.draft_invoice_amount) || 0;
            return total - invoiced - draft;
          },
        },
        format: 'currency',
        inDetail: true,
      },
      health_status: {
        label: 'Health',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const total = Number(r.total_amount) || 0;
            const cost = Number(r.cost_amount) || 0;
            if (total === 0) return 'healthy';
            const pct = (cost / total) * 100;
            const exceeded = Number(r.alert_threshold_exceeded) || 100;
            const critical = Number(r.alert_threshold_critical) || 90;
            const warning = Number(r.alert_threshold_warning) || 75;
            if (pct >= exceeded) return 'exceeded';
            if (pct >= critical) return 'critical';
            if (pct >= warning) return 'warning';
            return 'healthy';
          },
        },
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Budget'),
    subtitle: (r: Record<string, unknown>) => {
      const type = String(r.budget_type || 'fixed_price').replace(/_/g, ' ');
      return `${type} · $${Number(r.total_amount || 0).toLocaleString()}`;
    },
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        draft: { label: 'Draft', variant: 'secondary' },
        pending_approval: { label: 'Pending', variant: 'warning' },
        approved: { label: 'Approved', variant: 'primary' },
        active: { label: 'Active', variant: 'success' },
        closed: { label: 'Closed', variant: 'secondary' },
      };
      return statusMap[String(r.status)] || { label: String(r.status), variant: 'secondary' };
    },
    defaultSort: { field: 'start_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search budgets...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'over-budget', label: 'Over Budget', query: { where: {} } },
    ],
    advanced: ['status', 'budget_type', 'project_id', 'event_id', 'department_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
        { key: 'pending', label: 'Pending Approval', query: { where: { status: 'pending_approval' } }, count: true },
        { key: 'closed', label: 'Closed', query: { where: { status: 'closed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'line-items', label: 'Line Items', content: { type: 'related', entity: 'budget_line_items', foreignKey: 'budget_id', allowCreate: true } },
        { key: 'phases', label: 'Phases', content: { type: 'related', entity: 'budget_phases', foreignKey: 'budget_id', allowCreate: true } },
        { key: 'milestones', label: 'Payment Milestones', content: { type: 'related', entity: 'payment_milestones', foreignKey: 'budget_id', allowCreate: true } },
        { key: 'expenses', label: 'Expenses', content: { type: 'related', entity: 'expenses', foreignKey: 'budget_id', defaultView: 'table', allowCreate: true } },
        { key: 'invoices', label: 'Invoices', content: { type: 'related', entity: 'invoices', foreignKey: 'project_id', defaultView: 'table' } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'total', label: 'Total Budget', value: { type: 'field', field: 'total_amount' }, format: 'currency' },
          { key: 'revenue', label: 'Revenue', value: { type: 'field', field: 'revenue_amount' }, format: 'currency' },
          { key: 'cost', label: 'Costs', value: { type: 'field', field: 'cost_amount' }, format: 'currency' },
          { key: 'profit', label: 'Profit', value: { type: 'computed', compute: (r: Record<string, unknown>) => (Number(r.revenue_amount) || 0) - (Number(r.cost_amount) || 0) }, format: 'currency' },
          { key: 'margin', label: 'Margin', value: { type: 'computed', compute: (r: Record<string, unknown>) => { const rev = Number(r.revenue_amount) || 0; const cost = Number(r.cost_amount) || 0; return rev === 0 ? 0 : Math.round(((rev - cost) / rev) * 100); } }, format: 'percentage' },
          { key: 'burn', label: 'Burn %', value: { type: 'computed', compute: (r: Record<string, unknown>) => { const total = Number(r.total_amount) || 0; const cost = Number(r.cost_amount) || 0; return total === 0 ? 0 : Math.round((cost / total) * 100); } }, format: 'percentage' },
        ],
        blocks: [
          { key: 'billing', title: 'Billing Status', content: { type: 'fields', fields: ['invoiced_amount', 'draft_invoice_amount'] } },
          { key: 'markup', title: 'Markup & Fees', content: { type: 'fields', fields: ['markup_type', 'markup_value', 'agency_fee_amount'] } },
          { key: 'thresholds', title: 'Alert Thresholds', content: { type: 'fields', fields: ['alert_threshold_warning', 'alert_threshold_critical'] } },
        ],
      },
      sidebar: {
        width: 320,
        collapsible: true,
        defaultState: 'open',
        sections: [
          { key: 'properties', title: 'Properties', content: { type: 'stats', stats: ['budget_type', 'status', 'project_id', 'start_date', 'end_date'] } },
          { key: 'health', title: 'Budget Health', content: { type: 'stats', stats: ['total_amount', 'cost_amount', 'revenue_amount'] } },
          { key: 'quick_actions', title: 'Quick Actions', content: { type: 'quick-actions', actions: ['submit-expense', 'generate-invoice'] } },
          { key: 'recent_activity', title: 'Recent Activity', content: { type: 'activity', limit: 5 }, collapsible: true },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Budget Details',
          fields: ['name', 'budget_type', 'period_type', 'status'],
        },
        {
          key: 'relationships',
          title: 'Relationships',
          fields: ['project_id', 'event_id', 'department_id', 'parent_budget_id'],
        },
        {
          key: 'financial',
          title: 'Financial',
          fields: ['total_amount', 'revenue_amount', 'currency'],
        },
        {
          key: 'dates',
          title: 'Timeline',
          fields: ['start_date', 'end_date'],
        },
        {
          key: 'markup',
          title: 'Markup & Agency Fee',
          fields: ['markup_type', 'markup_value', 'agency_fee_amount'],
        },
        {
          key: 'retainer',
          title: 'Retainer Settings',
          fields: ['retainer_amount', 'retainer_hours', 'retainer_period', 'retainer_rollover'],
          condition: (values: Record<string, unknown>) => values.budget_type === 'retainer',
        },
        {
          key: 'alerts',
          title: 'Alert Thresholds',
          fields: ['alert_threshold_warning', 'alert_threshold_critical'],
        },
        {
          key: 'notes',
          title: 'Notes',
          fields: ['notes'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'budget_type', format: { type: 'badge', colorMap: { project: '#3b82f6', department: '#8b5cf6', event: '#f59e0b', overhead: '#6b7280' } } },
        { field: 'project_id', format: { type: 'relation', entityType: 'project' } },
        { field: 'total_amount', format: { type: 'currency' } },
        { field: 'cost_amount', format: { type: 'currency' } },
        { field: 'profit_amount', format: { type: 'currency' } },
        { field: 'profit_margin', format: { type: 'percentage' } },
        { field: 'burn_percentage', format: { type: 'percentage' } },
        { field: 'health_status', format: { type: 'badge', colorMap: { healthy: '#22c55e', warning: '#eab308', critical: '#ef4444', over_budget: '#dc2626' } } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending_approval: '#eab308', approved: '#3b82f6', active: '#22c55e', closed: '#6b7280' } } },
      ],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'draft', label: 'Draft', color: 'gray' },
        { value: 'pending_approval', label: 'Pending', color: 'yellow' },
        { value: 'approved', label: 'Approved', color: 'blue' },
        { value: 'active', label: 'Active', color: 'green' },
        { value: 'closed', label: 'Closed', color: 'slate' },
      ],
      card: {
        title: 'name',
        subtitle: 'project_id',
        fields: ['total_amount', 'burn_percentage'],
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/budgets/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/budgets/${r.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/budgets/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending_approval' },
    ],
    bulk: [
      { key: 'approve', label: 'Approve Selected', handler: { type: 'api', endpoint: '/api/budgets/bulk-approve', method: 'POST' } },
      { key: 'export', label: 'Export', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Budget', variant: 'primary', handler: { type: 'navigate', path: () => '/finance/budgets/new' } },
      { key: 'from-template', label: 'From Template', handler: { type: 'function', fn: () => {} } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
