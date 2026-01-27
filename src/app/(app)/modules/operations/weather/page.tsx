'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const weatherDashboardSections: DashboardSection[] = [
  {
    id: 'current',
    widgets: [
      { id: 'current-conditions', title: 'Current Conditions', description: 'Grand Arena, Los Angeles', type: 'metric', size: 'small', value: '72°' },
      { id: 'forecast', title: '7-Day Forecast', description: 'Weather outlook', type: 'chart', size: 'large' },
    ],
  },
  {
    id: 'alerts',
    title: 'Weather Alerts',
    widgets: [
      { id: 'weather-alerts', title: 'Active Alerts', description: 'Weather advisories for events', type: 'list', size: 'full' },
    ],
  },
];

export default function WeatherPage() {
  return (
    <DashboardTemplate
      title="Weather"
      subtitle="Monitor weather conditions for events"
      sections={weatherDashboardSections}
    />
  );
}
