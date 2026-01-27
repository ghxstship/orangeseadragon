'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const complianceDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'active-policies', title: 'Active Policies', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'policies' },
      { id: 'pending-ack', title: 'Pending Acknowledgments', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'pending' },
      { id: 'overdue', title: 'Overdue Reviews', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'overdue' },
      { id: 'compliance-rate', title: 'Compliance Rate', type: 'metric', size: 'small', value: '0%', change: 0, changeLabel: 'rate' },
    ],
  },
  {
    id: 'quick-access',
    title: 'Quick Access',
    widgets: [
      { id: 'policies', title: 'Policies', description: 'Manage organizational policies', type: 'custom', size: 'medium' },
      { id: 'acknowledgments', title: 'Acknowledgments', description: 'Track policy acknowledgments', type: 'custom', size: 'medium' },
    ],
  },
];

export default function CompliancePage() {
  return (
    <DashboardTemplate
      title="Compliance & Governance"
      subtitle="Manage policies, audits, and compliance tracking"
      sections={complianceDashboardSections}
    />
  );
}
