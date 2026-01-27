'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const onboardingDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'active', title: 'Active Onboardings', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'in progress' },
      { id: 'completed', title: 'Completed This Month', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'completed' },
      { id: 'overdue', title: 'Overdue Tasks', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'tasks' },
      { id: 'avg-time', title: 'Avg. Completion Time', type: 'metric', size: 'small', value: '0 days', change: 0, changeLabel: 'average' },
    ],
  },
  {
    id: 'quick-access',
    title: 'Quick Access',
    widgets: [
      { id: 'templates', title: 'Onboarding Templates', description: 'Manage onboarding checklists', type: 'custom', size: 'medium' },
      { id: 'active-list', title: 'Active Onboardings', description: 'View all in-progress onboardings', type: 'custom', size: 'medium' },
    ],
  },
];

export default function OnboardingPage() {
  return (
    <DashboardTemplate
      title="Employee Onboarding"
      subtitle="Manage new hire onboarding and checklists"
      sections={onboardingDashboardSections}
    />
  );
}
