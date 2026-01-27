'use client';

import { ReportsTemplate, ReportTab } from '@/components/templates/ReportsTemplate';

const financeReportTabs: ReportTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    metrics: [
      { key: 'revenue', label: 'Total Revenue', value: '$125,430', change: 12.5, changeLabel: 'vs last period', format: 'currency' },
      { key: 'expenses', label: 'Total Expenses', value: '$87,240', change: -3.2, changeLabel: 'vs last period', format: 'currency' },
      { key: 'profit', label: 'Net Profit', value: '$38,190', change: 28.4, changeLabel: 'vs last period', format: 'currency' },
      { key: 'margin', label: 'Profit Margin', value: '30.4%', change: 5.1, changeLabel: 'vs last period', format: 'percentage' },
    ],
    charts: [
      { key: 'revenue-trend', title: 'Revenue Trend', description: 'Monthly revenue over time', type: 'area' },
      { key: 'expense-breakdown', title: 'Expense Breakdown', description: 'Expenses by category', type: 'pie' },
    ],
  },
  {
    key: 'profit-loss',
    label: 'Profit & Loss',
    metrics: [
      { key: 'gross-revenue', label: 'Gross Revenue', value: '$145,000', format: 'currency' },
      { key: 'cost-of-goods', label: 'Cost of Goods', value: '$52,000', format: 'currency' },
      { key: 'gross-profit', label: 'Gross Profit', value: '$93,000', format: 'currency' },
      { key: 'operating-expenses', label: 'Operating Expenses', value: '$54,810', format: 'currency' },
    ],
    charts: [
      { key: 'pl-comparison', title: 'P&L Comparison', description: 'Revenue vs Expenses', type: 'bar' },
    ],
  },
  {
    key: 'cash-flow',
    label: 'Cash Flow',
    metrics: [
      { key: 'inflows', label: 'Cash Inflows', value: '$98,500', change: 8.3, format: 'currency' },
      { key: 'outflows', label: 'Cash Outflows', value: '$72,100', change: -2.1, format: 'currency' },
      { key: 'net-flow', label: 'Net Cash Flow', value: '$26,400', change: 15.7, format: 'currency' },
      { key: 'balance', label: 'Cash Balance', value: '$184,200', format: 'currency' },
    ],
    charts: [
      { key: 'cash-flow-trend', title: 'Cash Flow Trend', description: 'Monthly cash flow', type: 'line' },
    ],
  },
  {
    key: 'budget',
    label: 'Budget Analysis',
    metrics: [
      { key: 'budget-total', label: 'Total Budget', value: '$150,000', format: 'currency' },
      { key: 'spent', label: 'Spent', value: '$87,240', format: 'currency' },
      { key: 'remaining', label: 'Remaining', value: '$62,760', format: 'currency' },
      { key: 'utilization', label: 'Utilization', value: '58.2%', format: 'percentage' },
    ],
    charts: [
      { key: 'budget-vs-actual', title: 'Budget vs Actual', description: 'Comparison by category', type: 'bar' },
    ],
  },
];

export default function FinanceReportsPage() {
  return (
    <ReportsTemplate
      title="Financial Reports"
      description="Generate financial analytics and reports"
      tabs={financeReportTabs}
      onExport={(format) => console.log('Exporting:', format)}
      onRefresh={() => console.log('Refreshing data')}
    />
  );
}
