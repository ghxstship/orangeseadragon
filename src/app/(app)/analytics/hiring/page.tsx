'use client';

import React, { useEffect, useState } from 'react';
import { PageShell } from '@/components/common/page-shell';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Clock, TrendingUp, UserPlus, AlertTriangle } from 'lucide-react';
import { CurrencyDisplay } from '@/components/common/financial-display';

const getBarTrackStyle = (count: number): React.CSSProperties => ({
  width: `${Math.min(count * 20, 200)}px`,
});

const getBarFillStyle = (count: number, total: number): React.CSSProperties => ({
  width: `${Math.min((count / total) * 100, 100)}%`,
});

interface HiringForecast {
  currentHeadcount: number;
  currentMonthlyCapacity: number;
  totalBookedHours: number;
  pipelineValue: number;
  estimatedHoursNeeded: number;
  capacityGap: number;
  recommendedHires: number;
  departmentBreakdown: Record<string, number>;
  timeline: string;
}

export default function HiringForecastPage() {
  const [data, setData] = useState<HiringForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hiring/forecast')
      .then((res) => res.json())
      .then((json) => setData(json.data || null))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageShell
      title="Hiring Forecast"
      description="Capacity planning and hiring recommendations based on pipeline demand"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          <StatGrid columns={4}>
            <StatCard title="Current Headcount" value={String(data.currentHeadcount)} icon={Users} />
            <StatCard title="Monthly Capacity" value={`${data.currentMonthlyCapacity}h`} icon={Clock} />
            <StatCard title="Pipeline Value" value={`$${(data.pipelineValue / 1000).toFixed(0)}k`} icon={DollarSign} />
            <StatCard
              title="Recommended Hires"
              value={String(data.recommendedHires)}
              icon={UserPlus}
              description={data.timeline}
            />
          </StatGrid>

          {data.recommendedHires > 0 && (
            <Card className="border-semantic-warning/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-semantic-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Capacity Gap Detected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on your current pipeline ({<CurrencyDisplay amount={data.pipelineValue} compact />} in value),
                      you need approximately {data.estimatedHoursNeeded.toLocaleString()} hours over the next 3 months.
                      Your current team can deliver {data.currentMonthlyCapacity * 3} hours in that period,
                      leaving a gap of {Math.abs(data.capacityGap).toLocaleString()} hours.
                    </p>
                    <p className="text-xs font-medium mt-2">
                      Recommendation: Hire {data.recommendedHires} additional team member{data.recommendedHires > 1 ? 's' : ''} within the {data.timeline.toLowerCase()}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.departmentBreakdown).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm">{dept}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary/20" style={getBarTrackStyle(count)}>
                        <div className="h-full rounded-full bg-primary" style={getBarFillStyle(count, data.currentHeadcount)} />
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono">{count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard title="Booked Hours" value={data.totalBookedHours.toLocaleString()} icon={TrendingUp} description="Future commitments" />
            <StatCard title="Hours Needed" value={data.estimatedHoursNeeded.toLocaleString()} icon={Clock} description="From pipeline" />
            <StatCard title="Capacity Gap" value={`${data.capacityGap > 0 ? '+' : ''}${data.capacityGap.toLocaleString()}h`} icon={AlertTriangle} description="Surplus / deficit" />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No forecast data available</p>
        </div>
      )}
    </PageShell>
  );
}
