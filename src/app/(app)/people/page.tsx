'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const peopleDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'total-staff', title: 'Total Staff', type: 'metric', size: 'small', value: 245 },
      { id: 'available', title: 'Available Now', type: 'metric', size: 'small', value: 89 },
      { id: 'on-assignment', title: 'On Assignment', type: 'metric', size: 'small', value: 156 },
      { id: 'pending-onboard', title: 'Pending Onboard', type: 'metric', size: 'small', value: 12 },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'rosters-nav', title: 'Rosters', description: 'Staff, crew, contractors & talent', type: 'custom', size: 'medium' },
      { id: 'scheduling-nav', title: 'Scheduling', description: 'Person schedule assignments', type: 'custom', size: 'medium' },
    ],
  },
];

export default function PeoplePage() {
  return (
    <DashboardTemplate
      title="People"
      subtitle="Human resources management"
      sections={peopleDashboardSections}
    />
  );
}
