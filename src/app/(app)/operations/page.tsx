'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const operationsDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'active-shows', title: 'Active Shows', type: 'metric', size: 'small', value: 3 },
      { id: 'incidents', title: 'Open Incidents', type: 'metric', size: 'small', value: 2, change: -50, changeLabel: 'from yesterday' },
      { id: 'work-orders', title: 'Work Orders', type: 'metric', size: 'small', value: 8 },
      { id: 'venues', title: 'Active Venues', type: 'metric', size: 'small', value: 5 },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'shows-nav', title: 'Shows', description: 'Live shows & performances', type: 'custom', size: 'medium' },
      { id: 'runsheets-nav', title: 'Runsheets', description: 'Real-time schedules & cue sheets', type: 'custom', size: 'medium' },
    ],
  },
];

export default function OperationsPage() {
  return (
    <DashboardTemplate
      title="Operations"
      subtitle="Run of show management"
      sections={operationsDashboardSections}
    />
  );
}
