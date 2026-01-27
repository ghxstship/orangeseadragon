'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const businessDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'pipeline', title: 'Pipeline Value', type: 'metric', size: 'small', value: '$1.2M', change: 15, changeLabel: 'from last month' },
      { id: 'won', title: 'Won (MTD)', type: 'metric', size: 'small', value: '$320K', change: 22, changeLabel: 'from last month' },
      { id: 'deals', title: 'Active Deals', type: 'metric', size: 'small', value: 24, change: 8, changeLabel: 'from last month' },
      { id: 'win-rate', title: 'Win Rate', type: 'metric', size: 'small', value: '68%', change: 5, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'reports-nav', title: 'Reports', description: 'Sales analytics, pipeline, and forecasting', type: 'custom', size: 'medium' },
      { id: 'settings-nav', title: 'Settings', description: 'Configure CRM and sales preferences', type: 'custom', size: 'medium' },
    ],
  },
  {
    id: 'pipeline',
    title: 'Active Pipeline',
    widgets: [
      { id: 'active-pipeline', title: 'Active Pipeline', description: 'Deals in progress', type: 'list', size: 'full' },
    ],
  },
];

export default function BusinessPage() {
  return (
    <DashboardTemplate
      title="Business Development"
      subtitle="Manage deals, clients, and sales pipeline"
      sections={businessDashboardSections}
    />
  );
}
