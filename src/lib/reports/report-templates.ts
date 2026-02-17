/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPORT TEMPLATES REGISTRY — 50+ Pre-Built Reports
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Declarative report definitions. Each template specifies:
 * - Data source (Supabase table/view/RPC)
 * - Metrics (what to measure)
 * - Dimensions (how to group/slice)
 * - Chart type and defaults
 *
 * The ReportViewer component renders any template dynamically.
 */

import type { ReportTemplateDefinition, ReportCategory } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL REPORTS (15)
// ─────────────────────────────────────────────────────────────────────────────

const financialReports: ReportTemplateDefinition[] = [
  {
    id: 'revenue-by-month',
    name: 'Revenue by Month',
    description: 'Monthly revenue trend with year-over-year comparison',
    category: 'financial',
    icon: 'TrendingUp',
    chartType: 'bar',
    dataSource: 'invoices',
    metrics: [
      { key: 'revenue', label: 'Revenue', field: 'total', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'created_at', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['revenue', 'trend'],
  },
  {
    id: 'revenue-by-client',
    name: 'Revenue by Client',
    description: 'Revenue breakdown by client company',
    category: 'financial',
    icon: 'Building',
    chartType: 'horizontal-bar',
    dataSource: 'invoices',
    metrics: [
      { key: 'revenue', label: 'Revenue', field: 'total', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'client', label: 'Client', field: 'company_id', groupBy: true, sortDirection: 'desc' },
    ],
    defaultPeriod: 'year',
    tags: ['revenue', 'client'],
  },
  {
    id: 'revenue-by-service',
    name: 'Revenue by Service Type',
    description: 'Revenue split across service categories',
    category: 'financial',
    icon: 'PieChart',
    chartType: 'donut',
    dataSource: 'invoice_line_items',
    metrics: [
      { key: 'revenue', label: 'Revenue', field: 'amount', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'service', label: 'Service', field: 'service_type', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['revenue', 'service'],
  },
  {
    id: 'profit-loss',
    name: 'Profit & Loss',
    description: 'Revenue minus costs with monthly profit margin',
    category: 'financial',
    icon: 'DollarSign',
    chartType: 'stacked-area',
    dataSource: 'financial_summary',
    metrics: [
      { key: 'revenue', label: 'Revenue', field: 'revenue', aggregation: 'sum', format: 'currency', color: 'hsl(var(--semantic-success))' },
      { key: 'cost', label: 'Cost', field: 'cost', aggregation: 'sum', format: 'currency', color: 'hsl(var(--destructive))' },
      { key: 'profit', label: 'Profit', field: 'profit', aggregation: 'sum', format: 'currency', color: 'hsl(var(--primary))' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'period', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['profit', 'loss', 'margin'],
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    description: 'Cash inflows vs outflows over time',
    category: 'financial',
    icon: 'ArrowLeftRight',
    chartType: 'area',
    dataSource: 'payments',
    metrics: [
      { key: 'inflow', label: 'Inflow', field: 'amount_in', aggregation: 'sum', format: 'currency', color: 'hsl(var(--semantic-success))' },
      { key: 'outflow', label: 'Outflow', field: 'amount_out', aggregation: 'sum', format: 'currency', color: 'hsl(var(--destructive))' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'created_at', groupBy: true },
    ],
    defaultPeriod: 'quarter',
    tags: ['cash', 'flow'],
  },
  {
    id: 'ar-aging',
    name: 'Accounts Receivable Aging',
    description: 'Outstanding invoices grouped by aging bucket',
    category: 'financial',
    icon: 'Clock',
    chartType: 'bar',
    dataSource: 'invoices',
    metrics: [
      { key: 'outstanding', label: 'Outstanding', field: 'amount_due', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'bucket', label: 'Aging Bucket', field: 'aging_bucket', groupBy: true },
    ],
    filters: [{ field: 'status', operator: 'in', value: ['sent', 'overdue'] }],
    tags: ['ar', 'aging', 'collections'],
  },
  {
    id: 'ap-aging',
    name: 'Accounts Payable Aging',
    description: 'Outstanding bills grouped by aging bucket',
    category: 'financial',
    icon: 'Clock',
    chartType: 'bar',
    dataSource: 'expenses',
    metrics: [
      { key: 'outstanding', label: 'Outstanding', field: 'amount', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'bucket', label: 'Aging Bucket', field: 'aging_bucket', groupBy: true },
    ],
    filters: [{ field: 'status', operator: 'in', value: ['pending', 'approved'] }],
    tags: ['ap', 'aging', 'payables'],
  },
  {
    id: 'budget-vs-actual',
    name: 'Budget vs Actual',
    description: 'Planned budget compared to actual spend per project',
    category: 'financial',
    icon: 'BarChart3',
    chartType: 'bar',
    dataSource: 'budgets',
    metrics: [
      { key: 'budget', label: 'Budget', field: 'total_budget', aggregation: 'sum', format: 'currency', color: 'hsl(var(--primary))' },
      { key: 'actual', label: 'Actual', field: 'total_spent', aggregation: 'sum', format: 'currency', color: 'hsl(var(--semantic-warning))' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true },
    ],
    tags: ['budget', 'variance'],
  },
  {
    id: 'expense-by-category',
    name: 'Expenses by Category',
    description: 'Expense distribution across categories',
    category: 'financial',
    icon: 'Receipt',
    chartType: 'donut',
    dataSource: 'expenses',
    metrics: [
      { key: 'total', label: 'Total', field: 'amount', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'category', label: 'Category', field: 'category', groupBy: true },
    ],
    defaultPeriod: 'quarter',
    tags: ['expense', 'category'],
  },
  {
    id: 'profitability-by-project',
    name: 'Profitability by Project',
    description: 'Profit margin per project with revenue and cost breakdown',
    category: 'financial',
    icon: 'Target',
    chartType: 'horizontal-bar',
    dataSource: 'project_profitability',
    metrics: [
      { key: 'margin', label: 'Margin %', field: 'margin_percent', aggregation: 'avg', format: 'percentage' },
      { key: 'revenue', label: 'Revenue', field: 'revenue', aggregation: 'sum', format: 'currency' },
      { key: 'cost', label: 'Cost', field: 'cost', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true, sortDirection: 'desc' },
    ],
    tags: ['profitability', 'project', 'margin'],
  },
  {
    id: 'recurring-revenue',
    name: 'Recurring Revenue (MRR)',
    description: 'Monthly recurring revenue from retainers and subscriptions',
    category: 'financial',
    icon: 'Repeat',
    chartType: 'line',
    dataSource: 'recurring_invoices',
    metrics: [
      { key: 'mrr', label: 'MRR', field: 'amount', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'next_date', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['mrr', 'recurring', 'revenue'],
  },
  {
    id: 'average-project-value',
    name: 'Average Project Value',
    description: 'Average revenue per project over time',
    category: 'financial',
    icon: 'Calculator',
    chartType: 'line',
    dataSource: 'projects',
    metrics: [
      { key: 'avg_value', label: 'Avg Value', field: 'budget', aggregation: 'avg', format: 'currency' },
      { key: 'count', label: 'Projects', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'created_at', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['project', 'value', 'average'],
  },
  {
    id: 'vendor-spend',
    name: 'Vendor Spend Analysis',
    description: 'Spending breakdown by vendor',
    category: 'financial',
    icon: 'Truck',
    chartType: 'horizontal-bar',
    dataSource: 'purchase_orders',
    metrics: [
      { key: 'spend', label: 'Total Spend', field: 'total', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'vendor', label: 'Vendor', field: 'vendor_id', groupBy: true, sortDirection: 'desc' },
    ],
    defaultPeriod: 'year',
    tags: ['vendor', 'spend', 'procurement'],
  },
  {
    id: 'invoice-collection-rate',
    name: 'Invoice Collection Rate',
    description: 'Percentage of invoices collected on time vs late',
    category: 'financial',
    icon: 'CheckCircle',
    chartType: 'donut',
    dataSource: 'invoices',
    metrics: [
      { key: 'count', label: 'Invoices', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'status', label: 'Collection Status', field: 'collection_status', groupBy: true },
    ],
    tags: ['invoice', 'collection', 'payment'],
  },
  {
    id: 'revenue-forecast',
    name: 'Revenue Forecast',
    description: 'Projected revenue based on pipeline and active projects',
    category: 'financial',
    icon: 'TrendingUp',
    chartType: 'area',
    dataSource: 'revenue_forecast',
    metrics: [
      { key: 'actual', label: 'Actual', field: 'actual_revenue', aggregation: 'sum', format: 'currency', color: 'hsl(var(--primary))' },
      { key: 'forecast', label: 'Forecast', field: 'forecast_revenue', aggregation: 'sum', format: 'currency', color: 'hsl(var(--muted-foreground))' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'period', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['revenue', 'forecast', 'projection'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILIZATION REPORTS (10)
// ─────────────────────────────────────────────────────────────────────────────

const utilizationReports: ReportTemplateDefinition[] = [
  {
    id: 'billable-utilization',
    name: 'Billable Utilization',
    description: 'Billable hours as percentage of available capacity',
    category: 'utilization',
    icon: 'Clock',
    chartType: 'bar',
    dataSource: 'time_entries',
    metrics: [
      { key: 'billable', label: 'Billable Hours', field: 'hours', aggregation: 'sum', format: 'hours' },
      { key: 'utilization', label: 'Utilization %', field: 'utilization_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'person', label: 'Person', field: 'user_id', groupBy: true, sortDirection: 'desc' },
    ],
    filters: [{ field: 'billable', operator: 'eq', value: true }],
    targets: [{ metricKey: 'utilization', value: 80, label: 'Target', color: 'hsl(var(--semantic-success))' }],
    defaultPeriod: 'month',
    tags: ['utilization', 'billable', 'capacity'],
  },
  {
    id: 'utilization-by-team',
    name: 'Utilization by Team',
    description: 'Team-level billable utilization rates',
    category: 'utilization',
    icon: 'Users',
    chartType: 'bar',
    dataSource: 'time_entries',
    metrics: [
      { key: 'utilization', label: 'Utilization %', field: 'utilization_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'team', label: 'Team', field: 'department', groupBy: true },
    ],
    targets: [{ metricKey: 'utilization', value: 80, label: 'Target' }],
    defaultPeriod: 'month',
    tags: ['utilization', 'team'],
  },
  {
    id: 'utilization-trend',
    name: 'Utilization Trend',
    description: 'Monthly utilization rate over time',
    category: 'utilization',
    icon: 'TrendingUp',
    chartType: 'line',
    dataSource: 'time_entries',
    metrics: [
      { key: 'utilization', label: 'Utilization %', field: 'utilization_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'date', groupBy: true },
    ],
    targets: [{ metricKey: 'utilization', value: 80, label: 'Target' }],
    defaultPeriod: 'year',
    tags: ['utilization', 'trend'],
  },
  {
    id: 'hours-by-project',
    name: 'Hours by Project',
    description: 'Time spent per project',
    category: 'utilization',
    icon: 'FolderOpen',
    chartType: 'horizontal-bar',
    dataSource: 'time_entries',
    metrics: [
      { key: 'hours', label: 'Hours', field: 'hours', aggregation: 'sum', format: 'hours' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true, sortDirection: 'desc' },
    ],
    defaultPeriod: 'month',
    tags: ['hours', 'project', 'time'],
  },
  {
    id: 'hours-by-person',
    name: 'Hours by Person',
    description: 'Total hours logged per team member',
    category: 'utilization',
    icon: 'User',
    chartType: 'horizontal-bar',
    dataSource: 'time_entries',
    metrics: [
      { key: 'billable', label: 'Billable', field: 'billable_hours', aggregation: 'sum', format: 'hours', color: 'hsl(var(--primary))' },
      { key: 'non_billable', label: 'Non-Billable', field: 'non_billable_hours', aggregation: 'sum', format: 'hours', color: 'hsl(var(--muted-foreground))' },
    ],
    dimensions: [
      { key: 'person', label: 'Person', field: 'user_id', groupBy: true },
    ],
    defaultPeriod: 'month',
    tags: ['hours', 'person', 'billable'],
  },
  {
    id: 'overtime-report',
    name: 'Overtime Report',
    description: 'Hours exceeding standard capacity per person',
    category: 'utilization',
    icon: 'AlertTriangle',
    chartType: 'bar',
    dataSource: 'time_entries',
    metrics: [
      { key: 'overtime', label: 'Overtime Hours', field: 'overtime_hours', aggregation: 'sum', format: 'hours' },
    ],
    dimensions: [
      { key: 'person', label: 'Person', field: 'user_id', groupBy: true, sortDirection: 'desc' },
    ],
    defaultPeriod: 'month',
    tags: ['overtime', 'capacity'],
  },
  {
    id: 'absence-report',
    name: 'Absence Report',
    description: 'Time off taken by type and person',
    category: 'utilization',
    icon: 'CalendarOff',
    chartType: 'bar',
    dataSource: 'leave_requests',
    metrics: [
      { key: 'days', label: 'Days Off', field: 'duration_days', aggregation: 'sum', format: 'days' },
    ],
    dimensions: [
      { key: 'type', label: 'Leave Type', field: 'leave_type', groupBy: true },
    ],
    defaultPeriod: 'quarter',
    tags: ['absence', 'leave', 'time-off'],
  },
  {
    id: 'capacity-forecast',
    name: 'Capacity Forecast',
    description: 'Available vs booked capacity for upcoming months',
    category: 'utilization',
    icon: 'Calendar',
    chartType: 'stacked-area',
    dataSource: 'resource_bookings',
    metrics: [
      { key: 'booked', label: 'Booked', field: 'booked_hours', aggregation: 'sum', format: 'hours', color: 'hsl(var(--primary))' },
      { key: 'available', label: 'Available', field: 'available_hours', aggregation: 'sum', format: 'hours', color: 'hsl(var(--muted-foreground))' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'period', groupBy: true },
    ],
    defaultPeriod: 'quarter',
    tags: ['capacity', 'forecast', 'planning'],
  },
  {
    id: 'average-hourly-rate',
    name: 'Average Hourly Rate',
    description: 'Effective hourly rate (revenue / billable hours)',
    category: 'utilization',
    icon: 'DollarSign',
    chartType: 'line',
    dataSource: 'time_entries',
    metrics: [
      { key: 'rate', label: 'Avg Rate', field: 'effective_rate', aggregation: 'avg', format: 'currency' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'date', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['rate', 'hourly', 'effective'],
  },
  {
    id: 'non-billable-breakdown',
    name: 'Non-Billable Time Breakdown',
    description: 'Where non-billable hours are being spent',
    category: 'utilization',
    icon: 'PieChart',
    chartType: 'donut',
    dataSource: 'time_entries',
    metrics: [
      { key: 'hours', label: 'Hours', field: 'hours', aggregation: 'sum', format: 'hours' },
    ],
    dimensions: [
      { key: 'category', label: 'Category', field: 'non_billable_category', groupBy: true },
    ],
    filters: [{ field: 'billable', operator: 'eq', value: false }],
    defaultPeriod: 'month',
    tags: ['non-billable', 'overhead'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SALES REPORTS (10)
// ─────────────────────────────────────────────────────────────────────────────

const salesReports: ReportTemplateDefinition[] = [
  {
    id: 'pipeline-value',
    name: 'Pipeline Value',
    description: 'Total deal value by pipeline stage',
    category: 'sales',
    icon: 'GitBranch',
    chartType: 'funnel',
    dataSource: 'deals',
    metrics: [
      { key: 'value', label: 'Value', field: 'value', aggregation: 'sum', format: 'currency' },
      { key: 'count', label: 'Deals', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'stage', label: 'Stage', field: 'stage', groupBy: true },
    ],
    tags: ['pipeline', 'deals', 'funnel'],
  },
  {
    id: 'win-loss-rate',
    name: 'Win/Loss Rate',
    description: 'Deal win rate over time',
    category: 'sales',
    icon: 'Target',
    chartType: 'line',
    dataSource: 'deals',
    metrics: [
      { key: 'win_rate', label: 'Win Rate %', field: 'win_rate', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'closed_at', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['win', 'loss', 'conversion'],
  },
  {
    id: 'sales-by-rep',
    name: 'Sales by Representative',
    description: 'Revenue closed per sales representative',
    category: 'sales',
    icon: 'UserCheck',
    chartType: 'horizontal-bar',
    dataSource: 'deals',
    metrics: [
      { key: 'revenue', label: 'Revenue Won', field: 'value', aggregation: 'sum', format: 'currency' },
      { key: 'count', label: 'Deals Won', field: 'id', aggregation: 'count', format: 'number' },
      { key: 'win_rate', label: 'Win Rate', field: 'win_rate', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'rep', label: 'Sales Rep', field: 'owner_id', groupBy: true, sortDirection: 'desc' },
    ],
    filters: [{ field: 'stage', operator: 'eq', value: 'won' }],
    defaultPeriod: 'quarter',
    tags: ['sales', 'rep', 'performance', 'leaderboard'],
  },
  {
    id: 'deal-velocity',
    name: 'Deal Velocity',
    description: 'Average days from creation to close',
    category: 'sales',
    icon: 'Zap',
    chartType: 'bar',
    dataSource: 'deals',
    metrics: [
      { key: 'days', label: 'Avg Days to Close', field: 'days_to_close', aggregation: 'avg', format: 'number' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'closed_at', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['velocity', 'cycle', 'speed'],
  },
  {
    id: 'loss-reasons',
    name: 'Loss Reason Analysis',
    description: 'Why deals are being lost',
    category: 'sales',
    icon: 'XCircle',
    chartType: 'donut',
    dataSource: 'deals',
    metrics: [
      { key: 'count', label: 'Deals Lost', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'reason', label: 'Loss Reason', field: 'loss_reason', groupBy: true },
    ],
    filters: [{ field: 'stage', operator: 'eq', value: 'lost' }],
    tags: ['loss', 'reason', 'analysis'],
  },
  {
    id: 'pipeline-forecast',
    name: 'Pipeline Revenue Forecast',
    description: 'Weighted pipeline value by expected close month',
    category: 'sales',
    icon: 'TrendingUp',
    chartType: 'bar',
    dataSource: 'deals',
    metrics: [
      { key: 'weighted', label: 'Weighted Value', field: 'weighted_value', aggregation: 'sum', format: 'currency' },
      { key: 'total', label: 'Total Value', field: 'value', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'month', label: 'Expected Close', field: 'close_date', groupBy: true },
    ],
    filters: [{ field: 'stage', operator: 'neq', value: 'lost' }],
    defaultPeriod: 'quarter',
    tags: ['pipeline', 'forecast', 'weighted'],
  },
  {
    id: 'new-deals-trend',
    name: 'New Deals Trend',
    description: 'Number and value of new deals created over time',
    category: 'sales',
    icon: 'Plus',
    chartType: 'bar',
    dataSource: 'deals',
    metrics: [
      { key: 'count', label: 'New Deals', field: 'id', aggregation: 'count', format: 'number' },
      { key: 'value', label: 'Total Value', field: 'value', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'created_at', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['deals', 'new', 'trend'],
  },
  {
    id: 'average-deal-size',
    name: 'Average Deal Size',
    description: 'Average value of won deals over time',
    category: 'sales',
    icon: 'BarChart',
    chartType: 'line',
    dataSource: 'deals',
    metrics: [
      { key: 'avg_size', label: 'Avg Deal Size', field: 'value', aggregation: 'avg', format: 'currency' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'closed_at', groupBy: true },
    ],
    filters: [{ field: 'stage', operator: 'eq', value: 'won' }],
    defaultPeriod: 'year',
    tags: ['deal', 'size', 'average'],
  },
  {
    id: 'deals-by-source',
    name: 'Deals by Source',
    description: 'Where your deals are coming from',
    category: 'sales',
    icon: 'Globe',
    chartType: 'donut',
    dataSource: 'deals',
    metrics: [
      { key: 'count', label: 'Deals', field: 'id', aggregation: 'count', format: 'number' },
      { key: 'value', label: 'Value', field: 'value', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'source', label: 'Source', field: 'source', groupBy: true },
    ],
    tags: ['deals', 'source', 'lead'],
  },
  {
    id: 'proposal-conversion',
    name: 'Proposal Conversion Rate',
    description: 'Proposals sent vs accepted over time',
    category: 'sales',
    icon: 'FileCheck',
    chartType: 'bar',
    dataSource: 'proposals',
    metrics: [
      { key: 'sent', label: 'Sent', field: 'id', aggregation: 'count', format: 'number' },
      { key: 'accepted', label: 'Accepted', field: 'accepted_count', aggregation: 'sum', format: 'number' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'created_at', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['proposal', 'conversion', 'acceptance'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT REPORTS (10)
// ─────────────────────────────────────────────────────────────────────────────

const projectReports: ReportTemplateDefinition[] = [
  {
    id: 'project-health-overview',
    name: 'Project Health Overview',
    description: 'All active projects with budget, timeline, and health status',
    category: 'project',
    icon: 'Activity',
    chartType: 'table',
    dataSource: 'projects',
    metrics: [
      { key: 'budget_pct', label: 'Budget Used %', field: 'budget_used_pct', aggregation: 'avg', format: 'percentage' },
      { key: 'margin', label: 'Margin %', field: 'margin_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'name', groupBy: true },
    ],
    filters: [{ field: 'status', operator: 'in', value: ['active', 'in_progress'] }],
    tags: ['project', 'health', 'overview'],
  },
  {
    id: 'budget-burn-rate',
    name: 'Budget Burn Rate',
    description: 'How fast projects are consuming their budgets',
    category: 'project',
    icon: 'Flame',
    chartType: 'bar',
    dataSource: 'budgets',
    metrics: [
      { key: 'burn_rate', label: 'Burn Rate %', field: 'burn_rate_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true, sortDirection: 'desc' },
    ],
    targets: [{ metricKey: 'burn_rate', value: 100, label: 'Budget Limit', color: 'hsl(var(--destructive))' }],
    tags: ['budget', 'burn', 'rate'],
  },
  {
    id: 'project-timeline',
    name: 'Project Timeline Adherence',
    description: 'On-time vs delayed projects',
    category: 'project',
    icon: 'Calendar',
    chartType: 'donut',
    dataSource: 'projects',
    metrics: [
      { key: 'count', label: 'Projects', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'status', label: 'Timeline Status', field: 'timeline_status', groupBy: true },
    ],
    tags: ['project', 'timeline', 'delay'],
  },
  {
    id: 'task-completion-rate',
    name: 'Task Completion Rate',
    description: 'Tasks completed vs total by project',
    category: 'project',
    icon: 'CheckSquare',
    chartType: 'bar',
    dataSource: 'tasks',
    metrics: [
      { key: 'completion', label: 'Completion %', field: 'completion_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true },
    ],
    tags: ['task', 'completion', 'progress'],
  },
  {
    id: 'scope-creep-indicator',
    name: 'Scope Creep Indicator',
    description: 'Tasks added after project start vs original scope',
    category: 'project',
    icon: 'AlertTriangle',
    chartType: 'bar',
    dataSource: 'tasks',
    metrics: [
      { key: 'original', label: 'Original Tasks', field: 'original_count', aggregation: 'sum', format: 'number' },
      { key: 'added', label: 'Added Tasks', field: 'added_count', aggregation: 'sum', format: 'number' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true },
    ],
    tags: ['scope', 'creep', 'change'],
  },
  {
    id: 'project-margin-trend',
    name: 'Project Margin Trend',
    description: 'How project margins evolve over their lifecycle',
    category: 'project',
    icon: 'TrendingUp',
    chartType: 'line',
    dataSource: 'project_profitability',
    metrics: [
      { key: 'margin', label: 'Margin %', field: 'margin_percent', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'week', label: 'Week', field: 'period', groupBy: true },
    ],
    defaultPeriod: 'quarter',
    tags: ['margin', 'trend', 'project'],
  },
  {
    id: 'resource-allocation',
    name: 'Resource Allocation by Project',
    description: 'How team members are distributed across projects',
    category: 'project',
    icon: 'Users',
    chartType: 'stacked-area',
    dataSource: 'resource_bookings',
    metrics: [
      { key: 'hours', label: 'Hours', field: 'booked_hours', aggregation: 'sum', format: 'hours' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true },
    ],
    defaultPeriod: 'month',
    tags: ['resource', 'allocation', 'project'],
  },
  {
    id: 'project-cost-breakdown',
    name: 'Project Cost Breakdown',
    description: 'Labor vs expenses vs subcontractor costs per project',
    category: 'project',
    icon: 'Layers',
    chartType: 'bar',
    dataSource: 'project_costs',
    metrics: [
      { key: 'labor', label: 'Labor', field: 'labor_cost', aggregation: 'sum', format: 'currency' },
      { key: 'expenses', label: 'Expenses', field: 'expense_cost', aggregation: 'sum', format: 'currency' },
      { key: 'subcontractor', label: 'Subcontractor', field: 'subcontractor_cost', aggregation: 'sum', format: 'currency' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true },
    ],
    tags: ['cost', 'breakdown', 'labor', 'expense'],
  },
  {
    id: 'client-satisfaction',
    name: 'Client Satisfaction Scores',
    description: 'Feedback ratings by project and client',
    category: 'project',
    icon: 'Star',
    chartType: 'bar',
    dataSource: 'feedback',
    metrics: [
      { key: 'rating', label: 'Avg Rating', field: 'rating', aggregation: 'avg', format: 'number' },
    ],
    dimensions: [
      { key: 'project', label: 'Project', field: 'project_id', groupBy: true },
    ],
    tags: ['satisfaction', 'feedback', 'rating'],
  },
  {
    id: 'active-projects-by-status',
    name: 'Active Projects by Status',
    description: 'Distribution of projects across lifecycle stages',
    category: 'project',
    icon: 'LayoutGrid',
    chartType: 'donut',
    dataSource: 'projects',
    metrics: [
      { key: 'count', label: 'Projects', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'status', label: 'Status', field: 'status', groupBy: true },
    ],
    tags: ['project', 'status', 'distribution'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PEOPLE REPORTS (8)
// ─────────────────────────────────────────────────────────────────────────────

const peopleReports: ReportTemplateDefinition[] = [
  {
    id: 'headcount-trend',
    name: 'Headcount Trend',
    description: 'Team size over time by department',
    category: 'people',
    icon: 'Users',
    chartType: 'stacked-area',
    dataSource: 'people',
    metrics: [
      { key: 'count', label: 'Headcount', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'department', label: 'Department', field: 'department', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['headcount', 'team', 'growth'],
  },
  {
    id: 'certification-compliance',
    name: 'Certification Compliance',
    description: 'Certification status across the team',
    category: 'people',
    icon: 'Award',
    chartType: 'donut',
    dataSource: 'user_certifications',
    metrics: [
      { key: 'count', label: 'Certifications', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'status', label: 'Status', field: 'status', groupBy: true },
    ],
    tags: ['certification', 'compliance', 'expiry'],
  },
  {
    id: 'skills-matrix',
    name: 'Skills Matrix',
    description: 'Team capabilities by skill area',
    category: 'people',
    icon: 'Grid',
    chartType: 'heatmap',
    dataSource: 'people',
    metrics: [
      { key: 'count', label: 'People', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'skill', label: 'Skill', field: 'primary_skill', groupBy: true },
    ],
    tags: ['skills', 'matrix', 'capability'],
  },
  {
    id: 'contractor-vs-employee',
    name: 'Contractor vs Employee Mix',
    description: 'Workforce composition by employment type',
    category: 'people',
    icon: 'UserCheck',
    chartType: 'donut',
    dataSource: 'people',
    metrics: [
      { key: 'count', label: 'People', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'type', label: 'Type', field: 'employment_type', groupBy: true },
    ],
    tags: ['contractor', 'employee', 'mix'],
  },
  {
    id: 'cost-per-hire',
    name: 'Cost per Hire',
    description: 'Average recruitment cost over time',
    category: 'people',
    icon: 'DollarSign',
    chartType: 'line',
    dataSource: 'candidates',
    metrics: [
      { key: 'cost', label: 'Avg Cost', field: 'recruitment_cost', aggregation: 'avg', format: 'currency' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'hired_at', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['recruitment', 'cost', 'hire'],
  },
  {
    id: 'performance-distribution',
    name: 'Performance Distribution',
    description: 'Performance review scores distribution',
    category: 'people',
    icon: 'BarChart',
    chartType: 'bar',
    dataSource: 'performance_reviews',
    metrics: [
      { key: 'count', label: 'People', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'rating', label: 'Rating', field: 'overall_rating', groupBy: true },
    ],
    tags: ['performance', 'review', 'rating'],
  },
  {
    id: 'training-completion',
    name: 'Training Completion Rate',
    description: 'Training program completion rates',
    category: 'people',
    icon: 'GraduationCap',
    chartType: 'bar',
    dataSource: 'training_courses',
    metrics: [
      { key: 'completion', label: 'Completion %', field: 'completion_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'course', label: 'Course', field: 'name', groupBy: true },
    ],
    tags: ['training', 'completion', 'learning'],
  },
  {
    id: 'turnover-rate',
    name: 'Turnover Rate',
    description: 'Employee turnover rate by month',
    category: 'people',
    icon: 'UserMinus',
    chartType: 'line',
    dataSource: 'people',
    metrics: [
      { key: 'rate', label: 'Turnover %', field: 'turnover_rate', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'month', label: 'Month', field: 'period', groupBy: true },
    ],
    defaultPeriod: 'year',
    tags: ['turnover', 'retention', 'attrition'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONS REPORTS (7)
// ─────────────────────────────────────────────────────────────────────────────

const operationsReports: ReportTemplateDefinition[] = [
  {
    id: 'production-count-by-status',
    name: 'Productions by Status',
    description: 'Active productions grouped by lifecycle stage',
    category: 'operations',
    icon: 'Clapperboard',
    chartType: 'donut',
    dataSource: 'productions',
    metrics: [
      { key: 'count', label: 'Productions', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'status', label: 'Status', field: 'status', groupBy: true },
    ],
    tags: ['production', 'status'],
  },
  {
    id: 'incident-trend',
    name: 'Incident Trend',
    description: 'Incidents reported over time by severity',
    category: 'operations',
    icon: 'AlertTriangle',
    chartType: 'bar',
    dataSource: 'incident_reports',
    metrics: [
      { key: 'count', label: 'Incidents', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'severity', label: 'Severity', field: 'severity', groupBy: true },
    ],
    defaultPeriod: 'quarter',
    tags: ['incident', 'safety', 'trend'],
  },
  {
    id: 'asset-utilization',
    name: 'Asset Utilization',
    description: 'Equipment usage rates across the fleet',
    category: 'operations',
    icon: 'Package',
    chartType: 'bar',
    dataSource: 'assets',
    metrics: [
      { key: 'utilization', label: 'Utilization %', field: 'utilization_pct', aggregation: 'avg', format: 'percentage' },
    ],
    dimensions: [
      { key: 'category', label: 'Category', field: 'asset_type', groupBy: true },
    ],
    tags: ['asset', 'utilization', 'equipment'],
  },
  {
    id: 'venue-performance',
    name: 'Venue Performance',
    description: 'Revenue and event count per venue',
    category: 'operations',
    icon: 'MapPin',
    chartType: 'horizontal-bar',
    dataSource: 'venues',
    metrics: [
      { key: 'revenue', label: 'Revenue', field: 'total_revenue', aggregation: 'sum', format: 'currency' },
      { key: 'events', label: 'Events', field: 'event_count', aggregation: 'sum', format: 'number' },
    ],
    dimensions: [
      { key: 'venue', label: 'Venue', field: 'name', groupBy: true, sortDirection: 'desc' },
    ],
    tags: ['venue', 'performance', 'revenue'],
  },
  {
    id: 'work-order-status',
    name: 'Work Order Status',
    description: 'Open vs completed work orders',
    category: 'operations',
    icon: 'Wrench',
    chartType: 'donut',
    dataSource: 'work_orders',
    metrics: [
      { key: 'count', label: 'Work Orders', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'status', label: 'Status', field: 'status', groupBy: true },
    ],
    tags: ['work-order', 'maintenance'],
  },
  {
    id: 'logistics-shipment-status',
    name: 'Shipment Status',
    description: 'Shipments in transit, delivered, and pending',
    category: 'operations',
    icon: 'Truck',
    chartType: 'donut',
    dataSource: 'shipments',
    metrics: [
      { key: 'count', label: 'Shipments', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'status', label: 'Status', field: 'status', groupBy: true },
    ],
    tags: ['shipment', 'logistics', 'delivery'],
  },
  {
    id: 'daily-report-summary',
    name: 'Daily Report Summary',
    description: 'Key metrics from daily production reports',
    category: 'operations',
    icon: 'FileText',
    chartType: 'table',
    dataSource: 'daily_reports',
    metrics: [
      { key: 'count', label: 'Reports', field: 'id', aggregation: 'count', format: 'number' },
    ],
    dimensions: [
      { key: 'production', label: 'Production', field: 'production_id', groupBy: true },
    ],
    defaultPeriod: 'month',
    tags: ['daily', 'report', 'summary'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const reportTemplates: ReportTemplateDefinition[] = [
  ...financialReports,
  ...utilizationReports,
  ...salesReports,
  ...projectReports,
  ...peopleReports,
  ...operationsReports,
];

export function getReportTemplate(id: string): ReportTemplateDefinition | undefined {
  return reportTemplates.find((t) => t.id === id);
}

export function getReportsByCategory(category: ReportCategory): ReportTemplateDefinition[] {
  return reportTemplates.filter((t) => t.category === category);
}

export function searchReportTemplates(query: string): ReportTemplateDefinition[] {
  const q = query.toLowerCase();
  return reportTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags?.some((tag) => tag.includes(q))
  );
}
