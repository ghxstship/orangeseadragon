'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const financeDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'revenue', title: 'Revenue (MTD)', type: 'metric', size: 'small', value: '$425K', change: 12, changeLabel: 'from last month' },
      { id: 'expenses', title: 'Expenses (MTD)', type: 'metric', size: 'small', value: '$180K', change: -5, changeLabel: 'from last month' },
      { id: 'profit', title: 'Net Profit', type: 'metric', size: 'small', value: '$245K', change: 18, changeLabel: 'from last month' },
      { id: 'outstanding', title: 'Outstanding', type: 'metric', size: 'small', value: '$45K', change: -8, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'reports-nav', title: 'Reports', description: 'Financial analytics, P&L, and cash flow reports', type: 'custom', size: 'medium' },
      { id: 'settings-nav', title: 'Settings', description: 'Configure financial preferences and defaults', type: 'custom', size: 'medium' },
    ],
  },
  {
    id: 'transactions',
    title: 'Recent Transactions',
    widgets: [
      { id: 'recent-transactions', title: 'Recent Transactions', description: 'Latest financial activity', type: 'list', size: 'full' },
    ],
  },
];

export default function FinancePage() {
  return (
    <DashboardTemplate
      title="Financial Management"
      subtitle="Track revenue, expenses, and financial performance"
      sections={financeDashboardSections}
    />
  );
}
