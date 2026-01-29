'use client';

import { ReportsTemplate } from '@/components/templates/ReportsTemplate';

export default function FinanceReportsPage() {
  return (
    <ReportsTemplate
      title="Financial Reports"
      description="P&L, Cash Flow, AR/AP"
      tabs={[
        {
          key: 'pnl',
          label: 'Profit & Loss',
          metrics: [
            { key: 'revenue', label: 'Revenue', value: 425000, format: 'currency', change: 12 },
            { key: 'expenses', label: 'Expenses', value: 189000, format: 'currency', change: 5 },
            { key: 'net-income', label: 'Net Income', value: 236000, format: 'currency', change: 18 },
            { key: 'margin', label: 'Margin', value: 55.5, format: 'percentage', change: 3 },
          ],
          charts: [
            { key: 'revenue-trend', title: 'Revenue Trend', type: 'line' },
            { key: 'expense-breakdown', title: 'Expense Breakdown', type: 'pie' },
          ],
        },
        {
          key: 'cash-flow',
          label: 'Cash Flow',
          metrics: [
            { key: 'operating', label: 'Operating', value: 180000, format: 'currency' },
            { key: 'investing', label: 'Investing', value: -45000, format: 'currency' },
            { key: 'financing', label: 'Financing', value: -20000, format: 'currency' },
            { key: 'net-cash', label: 'Net Cash', value: 115000, format: 'currency' },
          ],
          charts: [
            { key: 'cash-flow-trend', title: 'Cash Flow Trend', type: 'area' },
          ],
        },
        {
          key: 'ar-ap',
          label: 'AR/AP Aging',
          metrics: [
            { key: 'ar-total', label: 'AR Total', value: 67000, format: 'currency' },
            { key: 'ar-overdue', label: 'AR Overdue', value: 12000, format: 'currency' },
            { key: 'ap-total', label: 'AP Total', value: 34000, format: 'currency' },
            { key: 'ap-overdue', label: 'AP Overdue', value: 5000, format: 'currency' },
          ],
          charts: [
            { key: 'ar-aging', title: 'AR Aging', type: 'bar' },
            { key: 'ap-aging', title: 'AP Aging', type: 'bar' },
          ],
        },
      ]}
    />
  );
}
