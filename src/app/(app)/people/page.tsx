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
      { id: 'portal-nav', title: 'My Portal', description: 'Self-service employee portal', type: 'custom', size: 'medium', href: '/people/portal' },
      { id: 'rosters-nav', title: 'Rosters', description: 'Staff, crew, contractors & talent', type: 'custom', size: 'medium', href: '/people/rosters' },
      { id: 'scheduling-nav', title: 'Scheduling', description: 'Person schedule assignments', type: 'custom', size: 'medium', href: '/people/scheduling' },
      { id: 'timekeeping-nav', title: 'Time & Attendance', description: 'Clock in/out and timesheets', type: 'custom', size: 'medium', href: '/people/timekeeping' },
      { id: 'org-nav', title: 'Org Chart', description: 'Organization structure', type: 'custom', size: 'medium', href: '/people/org' },
      { id: 'compliance-nav', title: 'Compliance', description: 'Certifications & training status', type: 'custom', size: 'medium', href: '/people/compliance' },
      { id: 'leave-nav', title: 'Leave Management', description: 'Request time off and view calendar', type: 'custom', size: 'medium', href: '/people/leave' },
      { id: 'documents-nav', title: 'Documents', description: 'Employee documents and files', type: 'custom', size: 'medium', href: '/people/documents' },
      { id: 'analytics-nav', title: 'Workforce Analytics', description: 'AI-powered insights and predictions', type: 'custom', size: 'medium', href: '/people/analytics' },
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
