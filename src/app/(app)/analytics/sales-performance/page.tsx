'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/common/page-shell';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { ReportChart } from '@/components/reports/report-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay } from '@/components/common/financial-display';
import { Users, DollarSign, TrendingUp, Target } from 'lucide-react';
import { captureError } from '@/lib/observability';

interface RepPerformance {
  repId: string;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  revenueWon: number;
  totalValue: number;
  winRate: number;
  avgDaysToClose: number;
  lossReasons: Record<string, number>;
}

export default function SalesPerformancePage() {
  const [data, setData] = useState<RepPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sales/performance')
      .then((res) => res.json())
      .then((json) => setData(json.data || []))
      .catch((err: unknown) => captureError(err, 'salesPerformance.fetch'))
      .finally(() => setIsLoading(false));
  }, []);

  const totalRevenue = data.reduce((sum, r) => sum + r.revenueWon, 0);
  const totalDeals = data.reduce((sum, r) => sum + r.totalDeals, 0);
  const totalWon = data.reduce((sum, r) => sum + r.wonDeals, 0);
  const avgWinRate = data.length > 0 ? Math.round(data.reduce((sum, r) => sum + r.winRate, 0) / data.length) : 0;

  const chartData = data.map((r) => ({
    name: r.repId.substring(0, 8),
    revenue: r.revenueWon,
    deals: r.wonDeals,
    winRate: r.winRate,
  }));

  return (
    <PageShell
      title="Sales Performance"
      description="Rep-level analytics: deals closed, revenue won, win rates"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <div className="space-y-6">
          <StatGrid columns={4}>
            <StatCard title="Total Revenue Won" value={`$${(totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} />
            <StatCard title="Total Deals" value={String(totalDeals)} icon={Target} />
            <StatCard title="Deals Won" value={String(totalWon)} icon={TrendingUp} />
            <StatCard title="Avg Win Rate" value={`${avgWinRate}%`} icon={Users} />
          </StatGrid>

          <ReportChart
            title="Revenue by Rep"
            description="Total revenue won per sales representative"
            chartType="bar"
            data={chartData}
            metrics={[
              { key: 'revenue', label: 'Revenue Won', field: 'revenue', aggregation: 'sum', format: 'currency', color: 'hsl(var(--primary))' },
            ]}
            dimensionKey="name"
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ReportChart
              title="Win Rate by Rep"
              description="Percentage of deals won"
              chartType="bar"
              data={chartData}
              metrics={[
                { key: 'winRate', label: 'Win Rate %', field: 'winRate', aggregation: 'avg', format: 'percentage', color: 'hsl(var(--semantic-success))' },
              ]}
              dimensionKey="name"
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rep Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.slice(0, 10).map((rep, i) => (
                    <div key={rep.repId} className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-[10px] font-mono">
                        {i + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{rep.repId.substring(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {rep.wonDeals}/{rep.totalDeals} deals · {rep.winRate}% win rate
                        </p>
                      </div>
                      <CurrencyDisplay amount={rep.revenueWon} compact className="text-sm font-bold" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Loss Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    data.reduce((acc, rep) => {
                      for (const [reason, count] of Object.entries(rep.lossReasons)) {
                        acc[reason] = (acc[reason] || 0) + count;
                      }
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .map(([reason, count]) => (
                      <Badge key={reason} variant="secondary" className="text-xs">
                        {reason}: {count}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
