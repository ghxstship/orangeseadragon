'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const networkDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'connections', title: 'Connections', type: 'metric', size: 'small', value: 342, change: 12, changeLabel: 'from last month' },
      { id: 'messages', title: 'Messages', type: 'metric', size: 'small', value: 28, change: 5, changeLabel: 'from last month' },
      { id: 'opportunities', title: 'Opportunities', type: 'metric', size: 'small', value: 24, change: 18, changeLabel: 'from last month' },
      { id: 'discussions', title: 'Discussions', type: 'metric', size: 'small', value: 156, change: 8, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'opportunities-nav', title: 'Opportunities', description: 'Discover and share business opportunities', type: 'custom', size: 'small' },
      { id: 'discussions-nav', title: 'Discussions', description: 'Engage in community discussions', type: 'custom', size: 'small' },
      { id: 'connections-nav', title: 'Connections', description: 'Manage your professional network', type: 'custom', size: 'small' },
      { id: 'settings-nav', title: 'Settings', description: 'Configure network preferences', type: 'custom', size: 'small' },
    ],
  },
  {
    id: 'activity',
    title: 'Recent Activity',
    widgets: [
      { id: 'recent-activity', title: 'Recent Activity', description: 'Latest network updates', type: 'activity', size: 'full' },
    ],
  },
];

export default function NetworkModulePage() {
  return (
    <DashboardTemplate
      title="Network Hub"
      subtitle="Connect, collaborate, and grow your professional network"
      sections={networkDashboardSections}
    />
  );
}
