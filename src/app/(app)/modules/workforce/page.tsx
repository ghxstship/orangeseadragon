'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const workforceDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'active-crew', title: 'Active Crew', type: 'metric', size: 'small', value: 156, change: 8, changeLabel: 'from last month' },
      { id: 'on-assignment', title: 'On Assignment', type: 'metric', size: 'small', value: 45, change: 12, changeLabel: 'from last month' },
      { id: 'available', title: 'Available', type: 'metric', size: 'small', value: 98, change: -5, changeLabel: 'from last month' },
      { id: 'certs-due', title: 'Certifications Due', type: 'metric', size: 'small', value: 8, change: 3, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'roster-nav', title: 'Roster', description: 'Manage team members, roles, and availability', type: 'custom', size: 'medium' },
      { id: 'reports-nav', title: 'Reports', description: 'Workforce analytics and labor reports', type: 'custom', size: 'medium' },
    ],
  },
  {
    id: 'activity',
    widgets: [
      { id: 'upcoming-shifts', title: 'Upcoming Shifts', description: 'Scheduled crew assignments', type: 'list', size: 'medium' },
      { id: 'alerts', title: 'Alerts', description: 'Action items requiring attention', type: 'list', size: 'medium' },
    ],
  },
];

export default function WorkforcePage() {
  return (
    <DashboardTemplate
      title="Workforce Management"
      subtitle="Manage crew, schedules, and certifications"
      sections={workforceDashboardSections}
    />
  );
}
