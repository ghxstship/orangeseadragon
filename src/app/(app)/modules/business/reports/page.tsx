'use client';

import { ReportsTemplate, ReportTab } from '@/components/templates/ReportsTemplate';

const businessReportTabs: ReportTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    metrics: [
      { key: 'revenue', label: 'Total Revenue', value: '$485,000', change: 18.5, changeLabel: 'vs last quarter', format: 'currency' },
      { key: 'deals-won', label: 'Deals Won', value: '24', change: 12.0, changeLabel: 'vs last quarter' },
      { key: 'conversion', label: 'Conversion Rate', value: '32%', change: 5.2, changeLabel: 'vs last quarter', format: 'percentage' },
      { key: 'avg-deal', label: 'Avg Deal Size', value: '$20,208', change: 8.3, format: 'currency' },
    ],
    charts: [
      { key: 'revenue-trend', title: 'Revenue Trend', description: 'Monthly revenue over time', type: 'area' },
      { key: 'deals-by-stage', title: 'Deals by Stage', description: 'Pipeline distribution', type: 'pie' },
    ],
  },
  {
    key: 'pipeline',
    label: 'Pipeline',
    metrics: [
      { key: 'pipeline-value', label: 'Pipeline Value', value: '$1.2M', format: 'currency' },
      { key: 'active-deals', label: 'Active Deals', value: '47' },
      { key: 'avg-cycle', label: 'Avg Sales Cycle', value: '28 days' },
      { key: 'win-rate', label: 'Win Rate', value: '32%', format: 'percentage' },
    ],
    charts: [
      { key: 'pipeline-funnel', title: 'Pipeline Funnel', description: 'Conversion by stage', type: 'bar' },
    ],
  },
  {
    key: 'clients',
    label: 'Clients',
    metrics: [
      { key: 'total-clients', label: 'Total Clients', value: '156', change: 8.0 },
      { key: 'new-clients', label: 'New This Quarter', value: '18' },
      { key: 'retention', label: 'Retention Rate', value: '94%', format: 'percentage' },
      { key: 'lifetime-value', label: 'Avg Lifetime Value', value: '$45,000', format: 'currency' },
    ],
    charts: [
      { key: 'client-growth', title: 'Client Growth', description: 'New clients over time', type: 'line' },
    ],
  },
  {
    key: 'forecast',
    label: 'Forecast',
    metrics: [
      { key: 'q1-forecast', label: 'Q1 Forecast', value: '$520,000', format: 'currency' },
      { key: 'q2-forecast', label: 'Q2 Forecast', value: '$580,000', format: 'currency' },
      { key: 'annual-target', label: 'Annual Target', value: '$2.2M', format: 'currency' },
      { key: 'progress', label: 'YTD Progress', value: '22%', format: 'percentage' },
    ],
    charts: [
      { key: 'forecast-vs-actual', title: 'Forecast vs Actual', description: 'Projected vs realized revenue', type: 'bar' },
    ],
  },
];

export default function BusinessReportsPage() {
  return (
    <ReportsTemplate
      title="Business Reports"
      description="Generate sales and business analytics"
      tabs={businessReportTabs}
      onExport={(format) => console.log('Exporting:', format)}
      onRefresh={() => console.log('Refreshing data')}
    />
  );
}
