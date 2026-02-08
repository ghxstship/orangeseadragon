'use client';

import { StatCard, StatGrid } from '@/components/common/stat-card';
import { LiveClockWidget } from '@/components/productions/widgets/LiveClockWidget';
import { ActiveProductionCard } from '@/components/productions/widgets/ActiveProductionCard';
import { WeatherWidget } from '@/components/productions/widgets/WeatherWidget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  CalendarDays,
  DollarSign,
  Users,
  AlertTriangle,
} from 'lucide-react';

export default function ProductionsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — Layout C */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Productions</h1>
            <p className="text-muted-foreground">Live Operations & Mission Control</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Mission Control Row */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Mission Control</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <LiveClockWidget />
            <div className="md:col-span-2">
              <ActiveProductionCard />
            </div>
            <WeatherWidget />
          </div>
        </div>

        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard title="Upcoming Events" value="12" icon={CalendarDays} trend={{ value: 8, isPositive: true }} description="from last month" />
          <StatCard title="Revenue (MTD)" value="$245K" icon={DollarSign} trend={{ value: 15, isPositive: true }} description="from last month" />
          <StatCard title="Crew Active" value="156" icon={Users} />
          <StatCard title="Open Incidents" value="3" icon={AlertTriangle} trend={{ value: 2, isPositive: true }} description="from yesterday" />
        </StatGrid>

        {/* Lists */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next scheduled productions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <div className="h-8 w-8 rounded bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="mt-1 h-3 w-16 rounded bg-muted/50" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Build & Strike Schedule</CardTitle>
              <CardDescription>Logistics tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <div className="h-8 w-8 rounded bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="mt-1 h-3 w-16 rounded bg-muted/50" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
