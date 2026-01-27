'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const projectsDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'active-projects', title: 'Active Projects', type: 'metric', size: 'small', value: 18, change: 12, changeLabel: 'from last month' },
      { id: 'completed', title: 'Completed (MTD)', type: 'metric', size: 'small', value: 5, change: 25, changeLabel: 'from last month' },
      { id: 'on-track', title: 'On Track', type: 'metric', size: 'small', value: '78%', change: 3, changeLabel: 'from last month' },
      { id: 'overdue', title: 'Overdue Tasks', type: 'metric', size: 'small', value: 12, change: -8, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'projects-nav', title: 'Projects', description: 'Manage projects, milestones, and deliverables', type: 'custom', size: 'medium' },
      { id: 'reports-nav', title: 'Reports', description: 'Project analytics and performance metrics', type: 'custom', size: 'medium' },
    ],
  },
  {
    id: 'recent',
    title: 'Recent Projects',
    widgets: [
      { id: 'recent-projects', title: 'Recent Projects', description: 'Your most active projects', type: 'list', size: 'full' },
    ],
  },
];

export default function ProjectsModulePage() {
  return (
    <DashboardTemplate
      title="Project Management"
      subtitle="Plan, track, and deliver projects on time"
      sections={projectsDashboardSections}
    />
  );
}
