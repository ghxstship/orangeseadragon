'use client';

import { ReportsTemplate, ReportTab } from '@/components/templates/ReportsTemplate';

const projectReportsTabs: ReportTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    metrics: [
      { key: 'total_projects', label: 'Total Projects', value: 24, change: 12, format: 'number' },
      { key: 'active_projects', label: 'Active Projects', value: 18, change: 5, format: 'number' },
      { key: 'completion_rate', label: 'Completion Rate', value: 78, change: 3, format: 'percentage' },
      { key: 'avg_duration', label: 'Avg Duration', value: '45 days', change: -8 },
    ],
    charts: [
      { key: 'projects_over_time', title: 'Projects Over Time', type: 'line', description: 'Project creation and completion trends' },
      { key: 'status_distribution', title: 'Status Distribution', type: 'pie', description: 'Projects by current status' },
    ],
  },
  {
    key: 'performance',
    label: 'Performance',
    metrics: [
      { key: 'on_time', label: 'On-Time Delivery', value: 85, format: 'percentage' },
      { key: 'budget_variance', label: 'Budget Variance', value: -5, format: 'percentage' },
    ],
    charts: [
      { key: 'timeline_adherence', title: 'Timeline Adherence', type: 'bar', description: 'Projects meeting deadlines' },
      { key: 'budget_tracking', title: 'Budget Tracking', type: 'area', description: 'Budget vs actual spend' },
    ],
  },
  {
    key: 'team',
    label: 'Team',
    metrics: [
      { key: 'team_utilization', label: 'Team Utilization', value: 72, format: 'percentage' },
      { key: 'tasks_completed', label: 'Tasks Completed', value: 156, format: 'number' },
    ],
    charts: [
      { key: 'workload', title: 'Team Workload', type: 'bar', description: 'Tasks per team member' },
    ],
  },
];

export default function ProjectReportsPage() {
  return (
    <ReportsTemplate
      title="Project Analytics"
      description="Performance metrics and insights for projects"
      tabs={projectReportsTabs}
      onExport={(format) => console.log('Exporting:', format)}
      onRefresh={() => console.log('Refreshing data')}
    />
  );
}
