/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPORT ENGINE — TYPES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SSOT type definitions for the declarative report system.
 * All report templates, subscriptions, and AI-generated reports
 * conform to these contracts.
 */

export type ReportChartType =
  | 'bar'
  | 'horizontal-bar'
  | 'line'
  | 'area'
  | 'stacked-area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'table'
  | 'kpi'
  | 'heatmap';

export type ReportCategory =
  | 'financial'
  | 'utilization'
  | 'sales'
  | 'project'
  | 'people'
  | 'operations'
  | 'custom';

export type AggregationFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';

export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'like';
  value: unknown;
  label?: string;
}

export interface ReportMetric {
  key: string;
  label: string;
  field: string;
  aggregation: AggregationFunction;
  format?: 'currency' | 'percentage' | 'number' | 'hours' | 'days';
  color?: string;
}

export interface ReportDimension {
  key: string;
  label: string;
  field: string;
  groupBy?: boolean;
  sortDirection?: 'asc' | 'desc';
}

export interface ReportTarget {
  metricKey: string;
  value: number;
  label?: string;
  color?: string;
}

export interface ReportTemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  chartType: ReportChartType;
  dataSource: string;
  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  filters?: ReportFilter[];
  targets?: ReportTarget[];
  defaultPeriod?: ReportPeriod;
  tags?: string[];
}

export interface ReportSubscription {
  id: string;
  reportId: string;
  userId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  channel: 'email' | 'slack' | 'in-app';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time?: string;
  webhookUrl?: string;
  enabled: boolean;
}

export interface ReportResult {
  data: Record<string, unknown>[];
  meta: {
    total: number;
    period: { start: string; end: string };
    generatedAt: string;
    dataSource: string;
  };
}

export interface ScenarioVariable {
  key: string;
  label: string;
  type: 'currency' | 'percentage' | 'number' | 'hours';
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description?: string;
  variables: Record<string, number>;
  color: string;
  isBaseline?: boolean;
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  color: string;
  metrics: Record<string, number>;
  monthlyProjection: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
}

export interface RateCard {
  id: string;
  name: string;
  clientId?: string;
  isDefault: boolean;
  currency: string;
  rates: RateCardEntry[];
}

export interface RateCardEntry {
  roleId: string;
  roleName: string;
  hourlyRate: number;
  dailyRate?: number;
  overtimeMultiplier?: number;
}

export interface BudgetAlertRule {
  id: string;
  budgetId?: string;
  organizationId: string;
  thresholdPercent: number;
  channel: 'in-app' | 'email' | 'slack';
  recipients: string[];
  enabled: boolean;
  lastTriggeredAt?: string;
}

export interface IntegrationAdapter {
  id: string;
  provider: string;
  type: 'accounting' | 'hr' | 'calendar' | 'email' | 'crm' | 'project-management';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
  lastSyncAt?: string;
}

export interface CalendarSyncConfig {
  provider: 'google' | 'outlook';
  direction: 'one-way-in' | 'one-way-out' | 'bidirectional';
  calendarId: string;
  syncTimeEntries: boolean;
  syncEvents: boolean;
}
