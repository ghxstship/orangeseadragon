'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const historyDashboardSections: DashboardSection[] = [
  {
    id: 'activity',
    title: 'Recent Activity',
    widgets: [
      { id: 'activity-log', title: 'Activity Log', description: 'Your activity from the last 30 days', type: 'activity', size: 'full' },
    ],
  },
];

export default function HistoryPage() {
  return (
    <DashboardTemplate
      title="Activity History"
      subtitle="View your account activity and audit log"
      sections={historyDashboardSections}
    />
  );
}
