'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Clock,
} from 'lucide-react';
import { useSupabase } from '@/hooks/auth/use-supabase';
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
  const supabase = useSupabase();

  const query = useQuery({
    queryKey: ['finance-dashboard', orgId],
    enabled: Boolean(orgId),
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<FinanceDashboardData> => {
      if (!orgId) {
        throw new Error('Organization id is required');
      }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const sixMonthWindowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

      const [
        paidInvoicesRes,
        openInvoicesRes,
        recentExpensesRes,
        openExpensesRes,
        budgetsRes,
        companiesRes,
      ] = await Promise.all([
        supabase
          .from('invoices')
          .select('id, total_amount, due_date, paid_at, company_id')
          .eq('organization_id', orgId)
          .eq('status', 'paid')
          .gte('paid_at', sixMonthWindowStart),
        supabase
          .from('invoices')
          .select('id, total_amount, due_date, status')
          .eq('organization_id', orgId)
          .in('status', ['sent', 'overdue']),
        supabase
          .from('expenses')
          .select('id, amount, status, created_at')
          .eq('organization_id', orgId)
          .gte('created_at', sixMonthWindowStart),
        supabase
          .from('expenses')
          .select('id, amount, status')
          .eq('organization_id', orgId)
          .in('status', ['submitted', 'approved']),
        supabase
          .from('budgets')
          .select('id, total_amount, status')
          .eq('organization_id', orgId),
        supabase
          .from('companies')
          .select('id, name')
          .eq('organization_id', orgId),
      ]);

      if (paidInvoicesRes.error) throw paidInvoicesRes.error;
      if (openInvoicesRes.error) throw openInvoicesRes.error;
      if (recentExpensesRes.error) throw recentExpensesRes.error;
      if (openExpensesRes.error) throw openExpensesRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (companiesRes.error) throw companiesRes.error;

      const paidInvoices = paidInvoicesRes.data ?? [];
      const openInvoices = openInvoicesRes.data ?? [];
      const recentExpenses = recentExpensesRes.data ?? [];
      const openExpenses = openExpensesRes.data ?? [];
      const budgets = budgetsRes.data ?? [];
      const companies = companiesRes.data ?? [];

      const companyMap = new Map(companies.map((company) => [company.id, company.name]));

      const mtdRevenue = paidInvoices
        .filter((invoice) => invoice.paid_at && new Date(invoice.paid_at) >= monthStart)
        .reduce((sum, invoice) => sum + (invoice.total_amount ?? 0), 0);

      const mtdExpenses = recentExpenses
        .filter((expense) => expense.created_at && new Date(expense.created_at) >= monthStart)
        .reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

      const marginPercent = mtdRevenue > 0 ? ((mtdRevenue - mtdExpenses) / mtdRevenue) * 100 : 0;

      const outstandingAR = openInvoices.reduce((sum, invoice) => sum + (invoice.total_amount ?? 0), 0);

      const outstandingAP = openExpenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

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

        const expensesForMonth = recentExpenses
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

      const onTrack = budgets.filter((budget) => budget.status === 'active' || budget.status === 'approved').length;
      const atRisk = budgets.filter((budget) => budget.status === 'pending_approval' || budget.status === 'draft').length;
      const overBudget = budgets.filter((budget) => budget.status === 'closed').length;

      const agingConfig = [
        { label: 'Current', color: 'bg-semantic-success' },
        { label: '1-15 days', color: 'bg-semantic-warning' },
        { label: '16-30 days', color: 'bg-semantic-warning/80' },
        { label: '31-60 days', color: 'bg-destructive/70' },
        { label: '60+ days', color: 'bg-destructive' },
      ];
      const agingAmounts = [0, 0, 0, 0, 0];
      const agingCounts = [0, 0, 0, 0, 0];

      for (const invoice of openInvoices) {
        const daysOverdue = invoice.due_date
          ? Math.max(0, Math.floor((now.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const bucketIndex =
          daysOverdue === 0 ? 0 : daysOverdue <= 15 ? 1 : daysOverdue <= 30 ? 2 : daysOverdue <= 60 ? 3 : 4;

        agingAmounts[bucketIndex] = (agingAmounts[bucketIndex] ?? 0) + (invoice.total_amount ?? 0);
        agingCounts[bucketIndex] = (agingCounts[bucketIndex] ?? 0) + 1;
      }

      const arAging: AgingBucket[] = agingConfig.map((bucket, index) => ({
        label: bucket.label,
        amount: formatCurrency(agingAmounts[index] ?? 0),
        count: agingCounts[index] ?? 0,
        color: bucket.color,
      }));

      return {
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
      };
    },
  });

  return query.data ?? null;
}
