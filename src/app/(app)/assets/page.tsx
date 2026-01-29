'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const assetsDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'total-assets', title: 'Total Assets', type: 'metric', size: 'small', value: 1247 },
      { id: 'available', title: 'Available', type: 'metric', size: 'small', value: 892 },
      { id: 'deployed', title: 'Deployed', type: 'metric', size: 'small', value: 355 },
      { id: 'maintenance', title: 'In Maintenance', type: 'metric', size: 'small', value: 23 },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'catalog-nav', title: 'Catalog', description: 'Equipment catalog (Uline-style SSOT)', type: 'custom', size: 'medium' },
      { id: 'inventory-nav', title: 'Inventory', description: 'Physical asset instances', type: 'custom', size: 'medium' },
    ],
  },
];

export default function AssetsPage() {
  return (
    <DashboardTemplate
      title="Assets"
      subtitle="Equipment & logistics management"
      sections={assetsDashboardSections}
    />
  );
}
