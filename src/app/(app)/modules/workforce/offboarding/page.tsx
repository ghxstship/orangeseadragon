'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const offboardingDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'active', title: 'Active Offboardings', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'in progress' },
      { id: 'completed', title: 'Completed This Month', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'completed' },
      { id: 'pending', title: 'Pending Tasks', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'tasks' },
      { id: 'avg-time', title: 'Avg. Completion Time', type: 'metric', size: 'small', value: '0 days', change: 0, changeLabel: 'average' },
    ],
  },
  {
    id: 'quick-access',
    title: 'Quick Access',
    widgets: [
      { id: 'templates', title: 'Offboarding Templates', description: 'Manage offboarding checklists', type: 'custom', size: 'medium' },
      { id: 'active-list', title: 'Active Offboardings', description: 'View all in-progress offboardings', type: 'custom', size: 'medium' },
    ],
  },
];

export default function OffboardingPage() {
  return (
    <DashboardTemplate
      title="Employee Offboarding"
      subtitle="Manage employee offboarding and exit processes"
      sections={offboardingDashboardSections}
    />
  );
}
