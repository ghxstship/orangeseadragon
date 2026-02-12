'use client';

import * as React from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
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

interface ForecastKpi {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

const kpis: ForecastKpi[] = [
  { label: 'Pipeline Value', value: '$2,450,000', change: 12.5, icon: DollarSign },
  { label: 'Weighted Revenue', value: '$1,180,000', change: 8.3, icon: TrendingUp },
  { label: 'Win Rate', value: '34%', change: -2.1, icon: Target },
  { label: 'Avg Deal Size', value: '$85,000', change: 5.7, icon: DollarSign },
];

interface FunnelStage {
  name: string;
  count: number;
  value: string;
  probability: string;
  weighted: string;
}

const monthlyWeighted = [
  { month: 'Jan', weighted: 820000, actual: 680000 },
  { month: 'Feb', weighted: 910000, actual: 750000 },
  { month: 'Mar', weighted: 1050000, actual: 890000 },
  { month: 'Apr', weighted: 980000, actual: 0 },
  { month: 'May', weighted: 1120000, actual: 0 },
  { month: 'Jun', weighted: 1180000, actual: 0 },
];

const revenueByClient = [
  { client: 'Acme Corp', revenue: 420000 },
  { client: 'TechStart', revenue: 340000 },
  { client: 'GlobalFest', revenue: 280000 },
  { client: 'MediaPro', revenue: 195000 },
  { client: 'EventCo', revenue: 145000 },
];

const funnel: FunnelStage[] = [
  { name: 'Lead', count: 24, value: '$720,000', probability: '10%', weighted: '$72,000' },
  { name: 'Qualified', count: 18, value: '$540,000', probability: '25%', weighted: '$135,000' },
  { name: 'Proposal Sent', count: 12, value: '$480,000', probability: '50%', weighted: '$240,000' },
  { name: 'Negotiation', count: 8, value: '$420,000', probability: '75%', weighted: '$315,000' },
  { name: 'Verbal Commit', count: 5, value: '$290,000', probability: '90%', weighted: '$261,000' },
];

export default function RevenueForecastPage() {
  const [period, setPeriod] = React.useState('quarter');

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Revenue Forecast</h1>
            <p className="text-sm text-muted-foreground mt-1">Pipeline value, weighted revenue, and close rate trends</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change >= 0;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(kpi.change)}% vs last period
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Weighted Revenue by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyWeighted}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                  <Bar dataKey="weighted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Weighted" opacity={0.7} />
                  <Bar dataKey="actual" fill="#22c55e" radius={[4, 4, 0, 0]} name="Actual" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Revenue by Client</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueByClient} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="client" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={100} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Funnel Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-2 font-medium">Stage</th>
                    <th className="text-right py-2 font-medium">Deals</th>
                    <th className="text-right py-2 font-medium">Total Value</th>
                    <th className="text-right py-2 font-medium">Probability</th>
                    <th className="text-right py-2 font-medium">Weighted</th>
                  </tr>
                </thead>
                <tbody>
                  {funnel.map((stage) => (
                    <tr key={stage.name} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3">
                        <Badge variant="secondary">{stage.name}</Badge>
                      </td>
                      <td className="text-right py-3">{stage.count}</td>
                      <td className="text-right py-3 font-medium">{stage.value}</td>
                      <td className="text-right py-3 text-muted-foreground">{stage.probability}</td>
                      <td className="text-right py-3 font-semibold text-primary">{stage.weighted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
