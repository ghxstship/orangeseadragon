'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const financeDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'revenue-mtd', title: 'Revenue (MTD)', type: 'metric', size: 'small', value: '$425K', change: 12, changeLabel: 'from last month' },
      { id: 'expenses-mtd', title: 'Expenses (MTD)', type: 'metric', size: 'small', value: '$189K' },
      { id: 'outstanding', title: 'Outstanding', type: 'metric', size: 'small', value: '$67K' },
      { id: 'overdue', title: 'Overdue', type: 'metric', size: 'small', value: '$12K', change: -25, changeLabel: 'from last month' },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick Access',
    widgets: [
      { id: 'budgets-nav', title: 'Budgets', description: 'Production & project budgets', type: 'custom', size: 'medium' },
      { id: 'invoices-nav', title: 'Invoices', description: 'Customer invoices', type: 'custom', size: 'medium' },
    ],
  },
];

export default function FinancePage() {
  return (
    <DashboardTemplate
      title="Finance"
      subtitle="Money in/out management"
      sections={financeDashboardSections}
    />
  );
}
