'use client';

import { ReportsTemplate, ReportTab } from '@/components/templates/ReportsTemplate';

const assetReportTabs: ReportTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    metrics: [
      { key: 'total-assets', label: 'Total Assets', value: '1,247', change: 5.2, changeLabel: 'vs last month' },
      { key: 'total-value', label: 'Total Value', value: '$2.4M', change: 3.8, changeLabel: 'vs last month', format: 'currency' },
      { key: 'utilization', label: 'Utilization Rate', value: '78%', change: 2.1, changeLabel: 'vs last month', format: 'percentage' },
      { key: 'maintenance-due', label: 'Maintenance Due', value: '23', change: -15.0, changeLabel: 'vs last month' },
    ],
    charts: [
      { key: 'value-by-category', title: 'Value by Category', description: 'Asset value distribution', type: 'pie' },
      { key: 'utilization-trend', title: 'Utilization Trend', description: 'Monthly utilization rates', type: 'line' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    metrics: [
      { key: 'audio-count', label: 'Audio Equipment', value: '342' },
      { key: 'lighting-count', label: 'Lighting Equipment', value: '456' },
      { key: 'video-count', label: 'Video Equipment', value: '189' },
      { key: 'staging-count', label: 'Staging Equipment', value: '260' },
    ],
    charts: [
      { key: 'inventory-by-category', title: 'Inventory by Category', description: 'Asset count by type', type: 'bar' },
    ],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    metrics: [
      { key: 'completed', label: 'Completed This Month', value: '45' },
      { key: 'scheduled', label: 'Scheduled', value: '23' },
      { key: 'overdue', label: 'Overdue', value: '8', change: -25.0 },
      { key: 'cost', label: 'Maintenance Cost', value: '$12,450', format: 'currency' },
    ],
    charts: [
      { key: 'maintenance-trend', title: 'Maintenance Trend', description: 'Monthly maintenance activity', type: 'bar' },
    ],
  },
  {
    key: 'depreciation',
    label: 'Depreciation',
    metrics: [
      { key: 'book-value', label: 'Book Value', value: '$1.8M', format: 'currency' },
      { key: 'accumulated', label: 'Accumulated Depreciation', value: '$620K', format: 'currency' },
      { key: 'monthly', label: 'Monthly Depreciation', value: '$18,500', format: 'currency' },
      { key: 'fully-depreciated', label: 'Fully Depreciated', value: '156' },
    ],
    charts: [
      { key: 'depreciation-schedule', title: 'Depreciation Schedule', description: 'Projected depreciation', type: 'area' },
    ],
  },
];

export default function AssetReportsPage() {
  return (
    <ReportsTemplate
      title="Asset Reports"
      description="Generate asset analytics and reports"
      tabs={assetReportTabs}
      onExport={(format) => console.log('Exporting:', format)}
      onRefresh={() => console.log('Refreshing data')}
    />
  );
}
