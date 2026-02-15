'use client';

import * as React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Clock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

export interface FinanceKpi {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

export interface AgingBucket {
  label: string;
  amount: string;
  count: number;
  color: string;
}

export interface FinanceDashboardData {
  summary: {
    mtdRevenue: number;
    mtdExpenses: number;
    marginPercent: number;
    outstandingAR: number;
    outstandingAP: number;
    cashForecast30d: number;
    avgDaysToPay: number;
  };
  kpis: FinanceKpi[];
  revenueVsExpenses: { month: string; revenue: number; expenses: number }[];
  profitByClient: { client: string; profit: number }[];
  budgetHealth: { name: string; value: number; color: string }[];
  cashFlow: { week: string; inflow: number; outflow: number }[];
  arAging: AgingBucket[];
}

export function useFinanceDashboard(orgId: string | null) {
  const [data, setData] = React.useState<FinanceDashboardData | null>(null);

  React.useEffect(() => {
    if (!orgId) {
      setData(null);
      return;
    }

    const supabase = createClient();

    const fetchData = async () => {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount, status, due_date, paid_at, company_id, created_at')
        .eq('organization_id', orgId);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('id, amount, status, created_at')
        .eq('organization_id', orgId);

      const { data: budgets } = await supabase
        .from('budgets')
        .select('id, total_amount, status')
        .eq('organization_id', orgId);

      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('organization_id', orgId);

      const companyMap = new Map((companies ?? []).map((company) => [company.id, company.name]));
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const paidInvoices = (invoices ?? []).filter((invoice) => invoice.status === 'paid');

      const mtdRevenue = paidInvoices
        .filter((invoice) => invoice.paid_at && new Date(invoice.paid_at) >= monthStart)
        .reduce((sum, invoice) => sum + (invoice.total_amount ?? 0), 0);

      const mtdExpenses = (expenses ?? [])
        .filter((expense) => expense.created_at && new Date(expense.created_at) >= monthStart)
        .reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

      const marginPercent = mtdRevenue > 0 ? ((mtdRevenue - mtdExpenses) / mtdRevenue) * 100 : 0;

      const outstandingAR = (invoices ?? [])
        .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
        .reduce((sum, invoice) => sum + (invoice.total_amount ?? 0), 0);

      const outstandingAP = (expenses ?? [])
        .filter((expense) => expense.status === 'submitted' || expense.status === 'approved')
        .reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

      const cashForecast30d = mtdRevenue - mtdExpenses;

      const avgDaysToPay =
        paidInvoices.length > 0
          ? Math.round(
              paidInvoices.reduce((sum, invoice) => {
                const dueDate = invoice.due_date ? new Date(invoice.due_date).getTime() : 0;
                const paidDate = invoice.paid_at ? new Date(invoice.paid_at).getTime() : 0;
                return sum + Math.max(0, (paidDate - dueDate) / (1000 * 60 * 60 * 24));
              }, 0) / paidInvoices.length
            )
          : 0;

      const kpis: FinanceKpi[] = [
        { label: 'Revenue MTD', value: formatCurrency(mtdRevenue), change: 0, icon: DollarSign },
        { label: 'Profit Margin', value: `${marginPercent.toFixed(1)}%`, change: 0, icon: TrendingUp },
        { label: 'Outstanding AR', value: formatCurrency(outstandingAR), change: 0, icon: Receipt },
        { label: 'Outstanding AP', value: formatCurrency(outstandingAP), change: 0, icon: CreditCard },
        { label: 'Cash Forecast (30d)', value: formatCurrency(cashForecast30d), change: 0, icon: TrendingUp },
        { label: 'Avg Days to Pay', value: `${avgDaysToPay} days`, change: 0, icon: Clock },
      ];

      const revenueVsExpenses: { month: string; revenue: number; expenses: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStartDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEndDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthLabel = monthStartDate.toLocaleString(undefined, { month: 'short' });

        const revenueForMonth = paidInvoices
          .filter(
            (invoice) =>
              invoice.paid_at &&
              new Date(invoice.paid_at) >= monthStartDate &&
              new Date(invoice.paid_at) <= monthEndDate
          )
          .reduce((sum, invoice) => sum + (invoice.total_amount ?? 0), 0);

        const expensesForMonth = (expenses ?? [])
          .filter(
            (expense) =>
              expense.created_at &&
              new Date(expense.created_at) >= monthStartDate &&
              new Date(expense.created_at) <= monthEndDate
          )
          .reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

        revenueVsExpenses.push({
          month: monthLabel,
          revenue: revenueForMonth,
          expenses: expensesForMonth,
        });
      }

      const clientProfits = new Map<string, number>();
      for (const invoice of paidInvoices) {
        const clientName = companyMap.get(invoice.company_id ?? '') ?? 'Unknown';
        clientProfits.set(clientName, (clientProfits.get(clientName) ?? 0) + (invoice.total_amount ?? 0));
      }

      const profitByClient = Array.from(clientProfits.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([client, profit]) => ({ client, profit }));

      const allBudgets = budgets ?? [];
      const onTrack = allBudgets.filter((budget) => budget.status === 'active' || budget.status === 'approved').length;
      const atRisk = allBudgets.filter((budget) => budget.status === 'pending_approval' || budget.status === 'draft').length;
      const overBudget = allBudgets.filter((budget) => budget.status === 'closed').length;

      const agingConfig = [
        { label: 'Current', color: 'bg-semantic-success' },
        { label: '1-15 days', color: 'bg-semantic-warning' },
        { label: '16-30 days', color: 'bg-semantic-warning/80' },
        { label: '31-60 days', color: 'bg-destructive/70' },
        { label: '60+ days', color: 'bg-destructive' },
      ];
      const agingAmounts = [0, 0, 0, 0, 0];
      const agingCounts = [0, 0, 0, 0, 0];

      const openInvoices = (invoices ?? []).filter(
        (invoice) => invoice.status === 'sent' || invoice.status === 'overdue'
      );

      for (const invoice of openInvoices) {
        const daysOverdue = invoice.due_date
          ? Math.max(0, Math.floor((now.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const bucketIndex =
          daysOverdue === 0 ? 0 : daysOverdue <= 15 ? 1 : daysOverdue <= 30 ? 2 : daysOverdue <= 60 ? 3 : 4;

        agingAmounts[bucketIndex] += invoice.total_amount ?? 0;
        agingCounts[bucketIndex] += 1;
      }

      const arAging: AgingBucket[] = agingConfig.map((bucket, index) => ({
        label: bucket.label,
        amount: formatCurrency(agingAmounts[index]),
        count: agingCounts[index],
        color: bucket.color,
      }));

      setData({
        summary: {
          mtdRevenue,
          mtdExpenses,
          marginPercent,
          outstandingAR,
          outstandingAP,
          cashForecast30d,
          avgDaysToPay,
        },
        kpis,
        revenueVsExpenses,
        profitByClient,
        budgetHealth: [
          { name: 'On Track', value: onTrack, color: 'hsl(var(--semantic-success))' },
          { name: 'At Risk', value: atRisk, color: 'hsl(var(--semantic-warning))' },
          { name: 'Over Budget', value: overBudget, color: 'hsl(var(--destructive))' },
        ],
        cashFlow: revenueVsExpenses.map((month, index) => ({
          week: `W${index + 1}`,
          inflow: month.revenue,
          outflow: month.expenses,
        })),
        arAging,
      });
    };

    fetchData();
  }, [orgId]);

  return data;
}
