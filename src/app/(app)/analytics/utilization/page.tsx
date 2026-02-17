'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/common/page-shell';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { ReportChart } from '@/components/reports/report-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, TrendingUp, Target } from 'lucide-react';

interface ForecastMonth {
  [key: string]: unknown;
  month: string;
  billableHours: number;
  totalHours: number;
  bookedHours: number;
  capacity: number;
  utilization: number;
}

export default function UtilizationForecastPage() {
  const [data, setData] = useState<ForecastMonth[]>([]);
  const [meta, setMeta] = useState<{ headcount: number; hoursPerMonth: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/utilization/forecast')
      .then((res) => res.json())
      .then((json) => {
        setData(json.data || []);
        setMeta(json.meta || null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const avgUtilization = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.utilization, 0) / data.length)
    : 0;
  const totalBillable = data.reduce((sum, d) => sum + d.billableHours, 0);
  const totalBooked = data.reduce((sum, d) => sum + d.bookedHours, 0);

  return (
    <PageShell
      title="Utilization Forecast"
      description="Current and projected utilization across the team"
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
            <StatCard title="Avg Utilization" value={`${avgUtilization}%`} icon={Target} description="Across forecast period" />
            <StatCard title="Headcount" value={String(meta?.headcount || 0)} icon={Users} description="Active team members" />
            <StatCard title="Billable Hours" value={totalBillable.toLocaleString()} icon={Clock} description="Historical period" />
            <StatCard title="Booked Hours" value={totalBooked.toLocaleString()} icon={TrendingUp} description="Future bookings" />
          </StatGrid>

          <ReportChart
            title="Utilization Trend"
            description="Monthly utilization rate (billable + booked vs capacity)"
            chartType="area"
            data={data}
            metrics={[
              { key: 'utilization', label: 'Utilization %', field: 'utilization', aggregation: 'avg', format: 'percentage', color: 'hsl(var(--primary))' },
            ]}
            dimensionKey="month"
            targets={[{ label: 'Target', value: 80, color: 'hsl(var(--semantic-success))', metricKey: 'utilization' }]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ReportChart
              title="Hours Breakdown"
              description="Billable vs booked hours by month"
              chartType="bar"
              data={data}
              metrics={[
                { key: 'billableHours', label: 'Billable', field: 'billableHours', aggregation: 'sum', format: 'number', color: 'hsl(var(--primary))' },
                { key: 'bookedHours', label: 'Booked', field: 'bookedHours', aggregation: 'sum', format: 'number', color: 'hsl(var(--semantic-warning))' },
              ]}
              dimensionKey="month"
            />

            <ReportChart
              title="Capacity vs Demand"
              description="Available capacity vs total demand"
              chartType="line"
              data={data.map((d) => ({ ...d, demand: d.billableHours + d.bookedHours }))}
              metrics={[
                { key: 'capacity', label: 'Capacity', field: 'capacity', aggregation: 'sum', format: 'number', color: 'hsl(var(--muted-foreground))' },
                { key: 'demand', label: 'Demand', field: 'demand', aggregation: 'sum', format: 'number', color: 'hsl(var(--primary))' },
              ]}
              dimensionKey="month"
            />
          </div>
        </div>
      )}
    </PageShell>
  );
}
