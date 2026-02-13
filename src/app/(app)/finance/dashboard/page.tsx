'use client';

import * as React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';

interface FinanceKpi {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

interface AgingBucket {
  label: string;
  amount: string;
  count: number;
  color: string;
}

function useFinanceDashboard(orgId: string | null) {
  const [data, setData] = React.useState<{
    kpis: FinanceKpi[];
    revenueVsExpenses: { month: string; revenue: number; expenses: number }[];
    profitByClient: { client: string; profit: number }[];
    budgetHealth: { name: string; value: number; color: string }[];
    cashFlow: { week: string; inflow: number; outflow: number }[];
    arAging: AgingBucket[];
  } | null>(null);

  React.useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();

    const fetchData = async () => {
      // Fetch invoices for revenue/AR
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount, status, due_date, paid_at, company_id, created_at')
        .eq('organization_id', orgId);

      // Fetch expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('id, amount, status, created_at')
        .eq('organization_id', orgId);

      // Fetch budgets for health
      const { data: budgets } = await supabase
        .from('budgets')
        .select('id, total_amount, status')
        .eq('organization_id', orgId);

      // Fetch companies for client names
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('organization_id', orgId);

      const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]));
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // KPIs
      const paidInvoices = (invoices ?? []).filter(i => i.status === 'paid');
      const mtdRevenue = paidInvoices
        .filter(i => i.paid_at && new Date(i.paid_at) >= monthStart)
        .reduce((sum, i) => sum + (i.total_amount ?? 0), 0);
      const mtdExpenses = (expenses ?? [])
        .filter(e => e.created_at && new Date(e.created_at) >= monthStart)
        .reduce((sum, e) => sum + (e.amount ?? 0), 0);
      const margin = mtdRevenue > 0 ? ((mtdRevenue - mtdExpenses) / mtdRevenue) * 100 : 0;
      const outstandingAR = (invoices ?? [])
        .filter(i => i.status === 'sent' || i.status === 'overdue')
        .reduce((sum, i) => sum + (i.total_amount ?? 0), 0);
      const outstandingAP = (expenses ?? [])
        .filter(e => e.status === 'submitted' || e.status === 'approved')
        .reduce((sum, e) => sum + (e.amount ?? 0), 0);

      const fmt = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

      const computedKpis: FinanceKpi[] = [
        { label: 'Revenue MTD', value: fmt(mtdRevenue), change: 0, icon: DollarSign },
        { label: 'Profit Margin', value: `${margin.toFixed(1)}%`, change: 0, icon: TrendingUp },
        { label: 'Outstanding AR', value: fmt(outstandingAR), change: 0, icon: Receipt },
        { label: 'Outstanding AP', value: fmt(outstandingAP), change: 0, icon: CreditCard },
        { label: 'Cash Forecast (30d)', value: fmt(mtdRevenue - mtdExpenses), change: 0, icon: TrendingUp },
        { label: 'Avg Days to Pay', value: `${paidInvoices.length > 0 ? Math.round(paidInvoices.reduce((sum, i) => {
          const due = i.due_date ? new Date(i.due_date).getTime() : 0;
          const paid = i.paid_at ? new Date(i.paid_at).getTime() : 0;
          return sum + Math.max(0, (paid - due) / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoices.length) : 0} days`, change: 0, icon: Clock },
      ];

      // Revenue vs Expenses by month (last 6 months)
      const months: { month: string; revenue: number; expenses: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const label = d.toLocaleString(undefined, { month: 'short' });
        const rev = paidInvoices
          .filter(inv => inv.paid_at && new Date(inv.paid_at) >= d && new Date(inv.paid_at) <= end)
          .reduce((s, inv) => s + (inv.total_amount ?? 0), 0);
        const exp = (expenses ?? [])
          .filter(e => e.created_at && new Date(e.created_at) >= d && new Date(e.created_at) <= end)
          .reduce((s, e) => s + (e.amount ?? 0), 0);
        months.push({ month: label, revenue: rev, expenses: exp });
      }

      // Profit by client (top 5)
      const clientProfits = new Map<string, number>();
      for (const inv of paidInvoices) {
        const name = companyMap.get(inv.company_id ?? '') ?? 'Unknown';
        clientProfits.set(name, (clientProfits.get(name) ?? 0) + (inv.total_amount ?? 0));
      }
      const topClients = Array.from(clientProfits.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([client, profit]) => ({ client, profit }));

      // Budget health (based on status since we don't have spent_amount)
      const allBudgets = budgets ?? [];
      const onTrack = allBudgets.filter(b => b.status === 'active' || b.status === 'approved').length;
      const atRisk = allBudgets.filter(b => b.status === 'pending_approval' || b.status === 'draft').length;
      const overBudget = allBudgets.filter(b => b.status === 'closed').length;

      // AR Aging
      const openInvoices = (invoices ?? []).filter(i => i.status === 'sent' || i.status === 'overdue');
      const agingBuckets: AgingBucket[] = [
        { label: 'Current', amount: '$0', count: 0, color: 'bg-semantic-success' },
        { label: '1-15 days', amount: '$0', count: 0, color: 'bg-semantic-warning' },
        { label: '16-30 days', amount: '$0', count: 0, color: 'bg-semantic-warning/80' },
        { label: '31-60 days', amount: '$0', count: 0, color: 'bg-destructive/70' },
        { label: '60+ days', amount: '$0', count: 0, color: 'bg-destructive' },
      ];
      for (const inv of openInvoices) {
        const daysOverdue = inv.due_date
          ? Math.max(0, Math.floor((now.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        const idx = daysOverdue === 0 ? 0 : daysOverdue <= 15 ? 1 : daysOverdue <= 30 ? 2 : daysOverdue <= 60 ? 3 : 4;
        agingBuckets[idx].count++;
        const prev = parseFloat(agingBuckets[idx].amount.replace(/[$,]/g, '')) || 0;
        agingBuckets[idx].amount = fmt(prev + (inv.total_amount ?? 0));
      }

      setData({
        kpis: computedKpis,
        revenueVsExpenses: months,
        profitByClient: topClients,
        budgetHealth: [
          { name: 'On Track', value: onTrack, color: 'hsl(var(--semantic-success))' },
          { name: 'At Risk', value: atRisk, color: 'hsl(var(--semantic-warning))' },
          { name: 'Over Budget', value: overBudget, color: 'hsl(var(--destructive))' },
        ],
        cashFlow: months.map((m, i) => ({ week: `W${i + 1}`, inflow: m.revenue, outflow: m.expenses })),
        arAging: agingBuckets,
      });
    };

    fetchData();
  }, [orgId]);

  return data;
}

export default function FinancialDashboardPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const dashData = useFinanceDashboard(orgId);
  const [period, setPeriod] = React.useState('month');

  const kpis = dashData?.kpis ?? [];
  const revenueVsExpenses = dashData?.revenueVsExpenses ?? [];
  const profitByClient = dashData?.profitByClient ?? [];
  const budgetHealth = dashData?.budgetHealth ?? [];
  const cashFlow = dashData?.cashFlow ?? [];
  const arAging = dashData?.arAging ?? [];

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Revenue, profitability, cash flow, and aging</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change >= 0;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="text-xl font-bold">{kpi.value}</div>
                  <div className={`flex items-center gap-1 text-[10px] mt-1 ${isPositive ? 'text-semantic-success' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(kpi.change)}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Revenue vs Expenses</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} name="Expenses" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Profit by Client</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={profitByClient} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="client" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={100} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Profit']} />
                  <Bar dataKey="profit" fill="hsl(var(--semantic-success))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AR Aging */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Accounts Receivable Aging</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-4">
              {arAging.map((bucket) => (
                <div key={bucket.label} className={`${bucket.color} flex-1`} title={`${bucket.label}: ${bucket.amount}`} />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4">
              {arAging.map((bucket) => (
                <div key={bucket.label} className="text-center">
                  <div className={`h-2 w-2 rounded-full ${bucket.color} mx-auto mb-1`} />
                  <p className="text-xs font-medium">{bucket.amount}</p>
                  <p className="text-[10px] text-muted-foreground">{bucket.label}</p>
                  <Badge variant="secondary" className="text-[9px] mt-1">{bucket.count} invoices</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Health Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Budget Health Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RPieChart>
                  <Pie data={budgetHealth} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {budgetHealth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} projects`, undefined]} />
                  <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                </RPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Cash Flow Forecast</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                  <Area type="monotone" dataKey="inflow" stackId="1" stroke="hsl(var(--semantic-success))" fill="hsl(var(--semantic-success))" fillOpacity={0.3} name="Cash In" />
                  <Area type="monotone" dataKey="outflow" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="Cash Out" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
