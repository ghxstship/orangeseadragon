'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const businessDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'pipeline-value', title: 'Pipeline Value', type: 'metric', size: 'small', value: '$1.2M' },
      { id: 'active-deals', title: 'Active Deals', type: 'metric', size: 'small', value: 24 },
      { id: 'companies', title: 'Companies', type: 'metric', size: 'small', value: 156 },
      { id: 'contracts', title: 'Active Contracts', type: 'metric', size: 'small', value: 42 },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'pipeline-nav', title: 'Pipeline', description: 'Sales opportunities & deals', type: 'custom', size: 'medium' },
      { id: 'products-nav', title: 'Products & Services', description: 'Business offerings (what you SELL)', type: 'custom', size: 'medium' },
    ],
  },
];

export default function BusinessPage() {
  return (
    <DashboardTemplate
      title="Business"
      subtitle="Revenue + relationships management"
      sections={businessDashboardSections}
    />
  );
}
