'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const contentDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'forms', title: 'Forms', type: 'metric', size: 'small', value: 12, change: 2, changeLabel: 'this week' },
      { id: 'landing-pages', title: 'Landing Pages', type: 'metric', size: 'small', value: 8, change: 1, changeLabel: 'this week' },
      { id: 'subscribers', title: 'Subscribers', type: 'metric', size: 'small', value: '2,450', change: 5, changeLabel: 'this month' },
      { id: 'conversion', title: 'Conversion Rate', type: 'metric', size: 'small', value: '3.2%', change: 0.4, changeLabel: 'this month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'forms-nav', title: 'Forms', description: 'Create and manage forms for data collection', type: 'custom', size: 'medium' },
      { id: 'landing-nav', title: 'Landing Pages', description: 'Build conversion-optimized landing pages', type: 'custom', size: 'medium' },
      { id: 'subscribers-nav', title: 'Subscribers', description: 'Manage email subscribers and lists', type: 'custom', size: 'medium' },
    ],
  },
];

export default function ContentModulePage() {
  return (
    <DashboardTemplate
      title="Content"
      subtitle="Forms, landing pages, and subscriber management"
      sections={contentDashboardSections}
    />
  );
}
