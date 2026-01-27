'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const procurementDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'pending-approval', title: 'Pending Approval', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'POs' },
      { id: 'open-orders', title: 'Open Orders', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'orders' },
      { id: 'this-month', title: 'This Month', type: 'metric', size: 'small', value: '$0', change: 0, changeLabel: 'spent' },
      { id: 'pending-delivery', title: 'Pending Delivery', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'items' },
    ],
  },
  {
    id: 'quick-access',
    title: 'Quick Access',
    widgets: [
      { id: 'orders', title: 'Purchase Orders', description: 'Manage purchase orders', type: 'custom', size: 'medium' },
      { id: 'vendors', title: 'Vendors', description: 'Manage vendor directory', type: 'custom', size: 'medium' },
    ],
  },
];

export default function ProcurementPage() {
  return (
    <DashboardTemplate
      title="Procurement"
      subtitle="Purchase orders and vendor management"
      sections={procurementDashboardSections}
    />
  );
}
