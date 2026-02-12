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

interface FinanceKpi {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  format?: string;
}

const kpis: FinanceKpi[] = [
  { label: 'Revenue MTD', value: '$342,500', change: 14.2, icon: DollarSign },
  { label: 'Profit Margin', value: '28.4%', change: 2.1, icon: TrendingUp },
  { label: 'Outstanding AR', value: '$187,200', change: -8.5, icon: Receipt },
  { label: 'Outstanding AP', value: '$94,300', change: 12.3, icon: CreditCard },
  { label: 'Cash Forecast (30d)', value: '$456,800', change: 5.7, icon: TrendingUp },
  { label: 'Avg Days to Pay', value: '24 days', change: -3.2, icon: Clock },
];

interface AgingBucket {
  label: string;
  amount: string;
  count: number;
  color: string;
}

const revenueVsExpenses = [
  { month: 'Jul', revenue: 285000, expenses: 198000 },
  { month: 'Aug', revenue: 312000, expenses: 215000 },
  { month: 'Sep', revenue: 298000, expenses: 205000 },
  { month: 'Oct', revenue: 345000, expenses: 228000 },
  { month: 'Nov', revenue: 320000, expenses: 218000 },
  { month: 'Dec', revenue: 342500, expenses: 245000 },
];

const profitByClient = [
  { client: 'Acme Corp', profit: 82000 },
  { client: 'TechStart', profit: 64000 },
  { client: 'GlobalFest', profit: 51000 },
  { client: 'MediaPro', profit: 38000 },
  { client: 'EventCo', profit: 27000 },
];

const budgetHealth = [
  { name: 'On Track', value: 14, color: '#22c55e' },
  { name: 'At Risk', value: 5, color: '#eab308' },
  { name: 'Over Budget', value: 3, color: '#ef4444' },
];

const cashFlow = [
  { week: 'W1', inflow: 85000, outflow: 62000 },
  { week: 'W2', inflow: 92000, outflow: 71000 },
  { week: 'W3', inflow: 78000, outflow: 65000 },
  { week: 'W4', inflow: 105000, outflow: 74000 },
  { week: 'W5', inflow: 88000, outflow: 68000 },
  { week: 'W6', inflow: 95000, outflow: 72000 },
];

const arAging: AgingBucket[] = [
  { label: 'Current', amount: '$62,400', count: 8, color: 'bg-emerald-500 dark:bg-emerald-400' },
  { label: '1-15 days', amount: '$45,800', count: 5, color: 'bg-amber-500 dark:bg-amber-400' },
  { label: '16-30 days', amount: '$38,200', count: 4, color: 'bg-amber-600 dark:bg-amber-500' },
  { label: '31-60 days', amount: '$28,600', count: 3, color: 'bg-destructive/70' },
  { label: '60+ days', amount: '$12,200', count: 2, color: 'bg-destructive' },
];

export default function FinancialDashboardPage() {
  const [period, setPeriod] = React.useState('month');

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
                  <div className={`flex items-center gap-1 text-[10px] mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
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
                  <Bar dataKey="profit" fill="#22c55e" radius={[0, 4, 4, 0]} />
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
                  <Area type="monotone" dataKey="inflow" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Cash In" />
                  <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Cash Out" />
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
