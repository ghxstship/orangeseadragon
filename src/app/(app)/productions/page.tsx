'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';
import { LiveClockWidget } from '@/components/productions/widgets/LiveClockWidget';
import { ActiveProductionCard } from '@/components/productions/widgets/ActiveProductionCard';
import { WeatherWidget } from '@/components/productions/widgets/WeatherWidget';

const productionsDashboardSections: DashboardSection[] = [
  {
    id: 'mission-control',
    title: 'Mission Control',
    widgets: [
      {
        id: 'live-clock',
        title: 'Local Time',
        type: 'custom',
        size: 'small',
        content: <LiveClockWidget />
      },
      {
        id: 'active-production',
        title: 'Active Production',
        type: 'custom',
        size: 'medium',
        content: <ActiveProductionCard />
      },
      {
        id: 'weather',
        title: 'Weather',
        type: 'custom',
        size: 'small',
        content: <WeatherWidget />
      },
    ],
  },
  {
    id: 'metrics',
    widgets: [
      { id: 'upcoming', title: 'Upcoming Events', type: 'metric', size: 'small', value: 12, change: 8, changeLabel: 'from last month' },
      { id: 'revenue', title: 'Revenue (MTD)', type: 'metric', size: 'small', value: '$245K', change: 15, changeLabel: 'from last month' },
      { id: 'crew', title: 'Crew Active', type: 'metric', size: 'small', value: 156 },
      { id: 'incidents', title: 'Open Incidents', type: 'metric', size: 'small', value: 3, change: -2, changeLabel: 'from yesterday' },
    ],
  },
  {
    id: 'lists',
    widgets: [
      { id: 'upcoming-events', title: 'Upcoming Events', description: 'Next scheduled productions', type: 'list', size: 'medium' },
      { id: 'build-strike', title: 'Build & Strike Schedule', description: 'Logistics tracking', type: 'list', size: 'medium' },
    ],
  },
];

export default function ProductionsPage() {
  return (
    <DashboardTemplate
      title="Productions"
      subtitle="Live Operations & Mission Control"
      sections={productionsDashboardSections}
    />
  );
}
