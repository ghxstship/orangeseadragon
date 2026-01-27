'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const operationsDashboardSections: DashboardSection[] = [
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'venues-nav', title: 'Venues', description: 'Manage venue information, floor plans, and capacity', type: 'custom', size: 'small' },
      { id: 'weather-nav', title: 'Weather', description: 'Monitor weather conditions for outdoor events', type: 'custom', size: 'small' },
      { id: 'logistics-nav', title: 'Logistics', description: 'Track deliveries, equipment, and transportation', type: 'custom', size: 'small' },
      { id: 'incidents-nav', title: 'Incidents', description: 'Log and track operational incidents', type: 'custom', size: 'small' },
    ],
  },
  {
    id: 'activity',
    title: 'Recent Activity',
    widgets: [
      { id: 'recent-activity', title: 'Recent Activity', description: 'Latest operations updates', type: 'activity', size: 'full' },
    ],
  },
];

export default function OperationsPage() {
  return (
    <DashboardTemplate
      title="Operations Management"
      subtitle="Manage venues, logistics, and operational workflows"
      sections={operationsDashboardSections}
    />
  );
}
