'use client';

import { ReportsTemplate, ReportTab } from '@/components/templates/ReportsTemplate';

const operationsReportsTabs: ReportTab[] = [
  {
    key: 'venues',
    label: 'Venues',
    metrics: [
      { key: 'total_venues', label: 'Total Venues', value: 12, format: 'number' },
      { key: 'utilization', label: 'Avg Utilization', value: 68, format: 'percentage' },
      { key: 'events_hosted', label: 'Events Hosted', value: 45, change: 15, format: 'number' },
    ],
    charts: [
      { key: 'venue_usage', title: 'Venue Usage', type: 'bar', description: 'Events per venue' },
      { key: 'capacity_utilization', title: 'Capacity Utilization', type: 'line', description: 'Average capacity used over time' },
    ],
  },
  {
    key: 'logistics',
    label: 'Logistics',
    metrics: [
      { key: 'on_time_delivery', label: 'On-Time Delivery', value: 94, format: 'percentage' },
      { key: 'avg_setup_time', label: 'Avg Setup Time', value: '3.5 hrs' },
    ],
    charts: [
      { key: 'delivery_performance', title: 'Delivery Performance', type: 'area', description: 'On-time vs delayed deliveries' },
    ],
  },
  {
    key: 'weather',
    label: 'Weather Impact',
    metrics: [
      { key: 'weather_delays', label: 'Weather Delays', value: 3, format: 'number' },
      { key: 'outdoor_events', label: 'Outdoor Events', value: 18, format: 'number' },
    ],
    charts: [
      { key: 'weather_incidents', title: 'Weather Incidents', type: 'bar', description: 'Events affected by weather' },
    ],
  },
];

export default function OperationsReportsPage() {
  return (
    <ReportsTemplate
      title="Operations Analytics"
      description="Venue and logistics performance metrics"
      tabs={operationsReportsTabs}
      onExport={(format) => console.log('Exporting:', format)}
      onRefresh={() => console.log('Refreshing data')}
    />
  );
}
