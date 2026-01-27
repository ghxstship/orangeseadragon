'use client';

import { ReportsTemplate, ReportTab } from '@/components/templates/ReportsTemplate';

const productionReportTabs: ReportTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    metrics: [
      { key: 'total-events', label: 'Total Events', value: '28', change: 16.7, changeLabel: 'vs last quarter' },
      { key: 'attendance', label: 'Total Attendance', value: '45,200', change: 22.5, changeLabel: 'vs last quarter' },
      { key: 'revenue', label: 'Event Revenue', value: '$1.8M', change: 18.3, changeLabel: 'vs last quarter', format: 'currency' },
      { key: 'satisfaction', label: 'Satisfaction Score', value: '4.6/5', change: 0.2 },
    ],
    charts: [
      { key: 'events-by-type', title: 'Events by Type', description: 'Distribution of event types', type: 'pie' },
      { key: 'attendance-trend', title: 'Attendance Trend', description: 'Monthly attendance', type: 'area' },
    ],
  },
  {
    key: 'events',
    label: 'Events',
    metrics: [
      { key: 'concerts', label: 'Concerts', value: '12' },
      { key: 'festivals', label: 'Festivals', value: '4' },
      { key: 'corporate', label: 'Corporate Events', value: '8' },
      { key: 'private', label: 'Private Events', value: '4' },
    ],
    charts: [
      { key: 'event-calendar', title: 'Event Calendar', description: 'Events by month', type: 'bar' },
    ],
  },
  {
    key: 'budget',
    label: 'Budget',
    metrics: [
      { key: 'total-budget', label: 'Total Budget', value: '$2.1M', format: 'currency' },
      { key: 'spent', label: 'Spent', value: '$1.85M', format: 'currency' },
      { key: 'variance', label: 'Variance', value: '-$50K', change: -2.4, format: 'currency' },
      { key: 'on-budget', label: 'On Budget %', value: '88%', format: 'percentage' },
    ],
    charts: [
      { key: 'budget-vs-actual', title: 'Budget vs Actual', description: 'Spending comparison', type: 'bar' },
    ],
  },
  {
    key: 'vendors',
    label: 'Vendors',
    metrics: [
      { key: 'active-vendors', label: 'Active Vendors', value: '45' },
      { key: 'avg-rating', label: 'Avg Rating', value: '4.3/5' },
      { key: 'on-time', label: 'On-Time Delivery', value: '92%', format: 'percentage' },
      { key: 'vendor-spend', label: 'Vendor Spend', value: '$890K', format: 'currency' },
    ],
    charts: [
      { key: 'vendor-performance', title: 'Vendor Performance', description: 'Rating distribution', type: 'bar' },
    ],
  },
];

export default function ProductionReportsPage() {
  return (
    <ReportsTemplate
      title="Production Reports"
      description="Generate and view production analytics"
      tabs={productionReportTabs}
      onExport={(format) => console.log('Exporting:', format)}
      onRefresh={() => console.log('Refreshing data')}
    />
  );
}
