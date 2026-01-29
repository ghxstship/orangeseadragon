'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const productionsDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'upcoming', title: 'Upcoming Events', type: 'metric', size: 'small', value: 12, change: 8, changeLabel: 'from last month' },
      { id: 'this-month', title: 'This Month', type: 'metric', size: 'small', value: 4 },
      { id: 'crew', title: 'Crew Assigned', type: 'metric', size: 'small', value: 156, change: 12, changeLabel: 'from last month' },
      { id: 'revenue', title: 'Revenue (MTD)', type: 'metric', size: 'small', value: '$245K', change: 15, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'events-nav', title: 'Events', description: 'Manage shows, concerts, and production schedules', type: 'custom', size: 'medium' },
      { id: 'build-strike-nav', title: 'Build & Strike', description: 'Production installation and restoration schedules', type: 'custom', size: 'medium' },
    ],
  },
  {
    id: 'events',
    title: 'Upcoming Events',
    widgets: [
      { id: 'upcoming-events', title: 'Upcoming Events', description: 'Next scheduled productions', type: 'list', size: 'full' },
    ],
  },
];

export default function ProductionsPage() {
  return (
    <DashboardTemplate
      title="Productions"
      subtitle="Pre/post event lifecycle management"
      sections={productionsDashboardSections}
    />
  );
}
