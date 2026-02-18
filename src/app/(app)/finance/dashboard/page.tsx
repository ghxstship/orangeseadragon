'use client';

import * as React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
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
import { PageShell } from '@/components/common/page-shell';
import { FadeIn } from '@/components/ui/motion';
import { useCopilotContext } from '@/hooks/ui/use-copilot-context';
import { useFinanceDashboard } from '@/hooks/data/finance/use-finance-dashboard';
import { useUser } from '@/hooks/auth/use-supabase';
import { formatCurrency } from '@/lib/utils';

export default function FinancialDashboardPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const dashData = useFinanceDashboard(orgId);
  const [period, setPeriod] = React.useState('month');
  useCopilotContext({ module: 'finance' });

  const kpis = dashData?.kpis ?? [];
  const revenueVsExpenses = dashData?.revenueVsExpenses ?? [];
  const profitByClient = dashData?.profitByClient ?? [];
  const budgetHealth = dashData?.budgetHealth ?? [];
  const cashFlow = dashData?.cashFlow ?? [];
  const arAging = dashData?.arAging ?? [];

  return (
    <PageShell
      title="Financial Dashboard"
      description="Revenue, profitability, cash flow, and aging"
      actions={
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
      }
      contentClassName="space-y-6"
    >
        {/* KPI Cards */}
        <FadeIn>
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
        </FadeIn>

        {/* Charts */}
        <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Revenue vs Expenses</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), undefined]} />
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
                  <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Profit']} />
                  <Bar dataKey="profit" fill="hsl(var(--semantic-success))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        </FadeIn>

        {/* AR Aging */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Accounts Receivable Aging</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-4">
              {arAging.map((bucket) => (
                <div key={bucket.label} className={`${bucket.color} flex-1`} title={`${bucket.label}: ${bucket.amount}`} />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
        <FadeIn delay={0.2}>
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
                  <Tooltip formatter={(value: number | undefined) => [`${value ?? 0} projects`, undefined]} />
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
                  <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), undefined]} />
                  <Area type="monotone" dataKey="inflow" stackId="1" stroke="hsl(var(--semantic-success))" fill="hsl(var(--semantic-success))" fillOpacity={0.3} name="Cash In" />
                  <Area type="monotone" dataKey="outflow" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="Cash Out" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        </FadeIn>
    </PageShell>
  );
}
