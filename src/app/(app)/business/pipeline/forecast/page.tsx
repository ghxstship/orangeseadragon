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
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';

interface ForecastKpi {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

interface FunnelStage {
  name: string;
  count: number;
  value: string;
  probability: string;
  weighted: string;
}

const STAGE_PROBABILITIES: Record<string, number> = {
  lead: 0.10,
  qualified: 0.25,
  proposal: 0.50,
  negotiation: 0.75,
  verbal_commit: 0.90,
  closed_won: 1.0,
};

function useForecastData(orgId: string | null) {
  const [data, setData] = React.useState<{
    kpis: ForecastKpi[];
    monthlyWeighted: { month: string; weighted: number; actual: number }[];
    revenueByClient: { client: string; revenue: number }[];
    funnel: FunnelStage[];
  } | null>(null);

  React.useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();

    const fetchData = async () => {
      const { data: deals } = await supabase
        .from('deals')
        .select('id, name, value, stage, probability, company_id, expected_close_date, won_at, created_at')
        .eq('organization_id', orgId);

      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('organization_id', orgId);

      const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]));
      const allDeals = deals ?? [];
      const openDeals = allDeals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
      const wonDeals = allDeals.filter(d => d.stage === 'closed_won');

      const fmt = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

      const pipelineValue = openDeals.reduce((s, d) => s + (d.value ?? 0), 0);
      const weightedRevenue = openDeals.reduce((s, d) => {
        const prob = d.probability ?? (STAGE_PROBABILITIES[d.stage ?? ''] ?? 0.1);
        return s + (d.value ?? 0) * prob;
      }, 0);
      const winRate = allDeals.length > 0 ? (wonDeals.length / allDeals.length) * 100 : 0;
      const avgDealSize = openDeals.length > 0 ? pipelineValue / openDeals.length : 0;

      const computedKpis: ForecastKpi[] = [
        { label: 'Pipeline Value', value: fmt(pipelineValue), change: 0, icon: DollarSign },
        { label: 'Weighted Revenue', value: fmt(weightedRevenue), change: 0, icon: TrendingUp },
        { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, change: 0, icon: Target },
        { label: 'Avg Deal Size', value: fmt(avgDealSize), change: 0, icon: DollarSign },
      ];

      // Monthly weighted vs actual (last 6 months)
      const now = new Date();
      const monthly: { month: string; weighted: number; actual: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const label = d.toLocaleString(undefined, { month: 'short' });
        const monthDeals = openDeals.filter(deal => {
          if (!deal.expected_close_date) return false;
          const cd = new Date(deal.expected_close_date);
          return cd >= d && cd <= end;
        });
        const weighted = monthDeals.reduce((s, deal) => {
          const prob = deal.probability ?? (STAGE_PROBABILITIES[deal.stage ?? ''] ?? 0.1);
          return s + (deal.value ?? 0) * prob;
        }, 0);
        const actual = wonDeals
          .filter(deal => deal.won_at && new Date(deal.won_at) >= d && new Date(deal.won_at) <= end)
          .reduce((s, deal) => s + (deal.value ?? 0), 0);
        monthly.push({ month: label, weighted, actual });
      }

      // Revenue by client (top 5 by pipeline value)
      const clientRevMap = new Map<string, number>();
      for (const deal of openDeals) {
        const name = companyMap.get(deal.company_id ?? '') ?? 'Unknown';
        clientRevMap.set(name, (clientRevMap.get(name) ?? 0) + (deal.value ?? 0));
      }
      const topClients = Array.from(clientRevMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([client, revenue]) => ({ client, revenue }));

      // Pipeline funnel by stage
      const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'verbal_commit'];
      const stageLabels: Record<string, string> = {
        lead: 'Lead', qualified: 'Qualified', proposal: 'Proposal Sent',
        negotiation: 'Negotiation', verbal_commit: 'Verbal Commit',
      };
      const computedFunnel: FunnelStage[] = stageOrder.map(stage => {
        const stageDeals = openDeals.filter(d => d.stage === stage);
        const totalValue = stageDeals.reduce((s, d) => s + (d.value ?? 0), 0);
        const prob = STAGE_PROBABILITIES[stage] ?? 0;
        return {
          name: stageLabels[stage] ?? stage,
          count: stageDeals.length,
          value: fmt(totalValue),
          probability: `${(prob * 100).toFixed(0)}%`,
          weighted: fmt(totalValue * prob),
        };
      });

      setData({
        kpis: computedKpis,
        monthlyWeighted: monthly,
        revenueByClient: topClients,
        funnel: computedFunnel,
      });
    };

    fetchData();
  }, [orgId]);

  return data;
}

export default function RevenueForecastPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const forecastData = useForecastData(orgId);
  const [period, setPeriod] = React.useState('quarter');

  const kpis = forecastData?.kpis ?? [];
  const monthlyWeighted = forecastData?.monthlyWeighted ?? [];
  const revenueByClient = forecastData?.revenueByClient ?? [];
  const funnel = forecastData?.funnel ?? [];

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
                  <div className={`flex items-center gap-1 text-xs mt-1 ${isPositive ? 'text-semantic-success' : 'text-destructive'}`}>
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
                  <Bar dataKey="actual" fill="hsl(var(--semantic-success))" radius={[4, 4, 0, 0]} name="Actual" />
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
