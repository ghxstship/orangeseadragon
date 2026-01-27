'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const assetsDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'total-value', title: 'Total Value', type: 'metric', size: 'small', value: '$1.2M', change: 5, changeLabel: 'from last month' },
      { id: 'checked-out', title: 'Checked Out', type: 'metric', size: 'small', value: 45, change: -3, changeLabel: 'from last month' },
      { id: 'maintenance', title: 'Maintenance Due', type: 'metric', size: 'small', value: 8, change: 2, changeLabel: 'from last month' },
      { id: 'low-stock', title: 'Low Stock', type: 'metric', size: 'small', value: 12, change: 4, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'inventory-nav', title: 'Inventory', description: 'Manage equipment, supplies, and asset tracking', type: 'custom', size: 'medium' },
      { id: 'reports-nav', title: 'Reports', description: 'Asset analytics, depreciation, and utilization reports', type: 'custom', size: 'medium' },
    ],
  },
  {
    id: 'activity',
    widgets: [
      { id: 'maintenance-alerts', title: 'Maintenance Alerts', description: 'Assets requiring attention', type: 'list', size: 'medium' },
      { id: 'recent-activity', title: 'Recent Activity', description: 'Latest asset movements', type: 'activity', size: 'medium' },
    ],
  },
];

export default function AssetsPage() {
  return (
    <DashboardTemplate
      title="Asset Management"
      subtitle="Track equipment, inventory, and asset lifecycle"
      sections={assetsDashboardSections}
    />
  );
}
