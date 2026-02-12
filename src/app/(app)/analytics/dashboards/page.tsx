'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Plus, Star, Users, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardItem {
  id: string;
  name: string;
  description: string;
  owner: string;
  visibility: 'personal' | 'team' | 'public';
  starred?: boolean;
  widgetCount: number;
  lastViewed?: string;
}

const dashboards: DashboardItem[] = [
  { id: '1', name: 'Executive Overview', description: 'High-level KPIs across all modules', owner: 'System', visibility: 'public', starred: true, widgetCount: 8, lastViewed: '1 hour ago' },
  { id: '2', name: 'Production Manager', description: 'Active projects, budgets, and crew utilization', owner: 'System', visibility: 'public', starred: true, widgetCount: 6, lastViewed: '3 hours ago' },
  { id: '3', name: 'Finance Dashboard', description: 'Revenue, AR aging, budget health, and cash flow', owner: 'System', visibility: 'public', widgetCount: 10 },
  { id: '4', name: 'Sales Pipeline', description: 'Deal flow, win rates, and revenue forecast', owner: 'System', visibility: 'public', widgetCount: 5 },
  { id: '5', name: 'My Weekly View', description: 'Personal tasks, timesheets, and upcoming events', owner: 'You', visibility: 'personal', starred: true, widgetCount: 4, lastViewed: '30 min ago' },
  { id: '6', name: 'Crew Operations', description: 'Scheduling, availability, and labor costs', owner: 'Ops Team', visibility: 'team', widgetCount: 7 },
];

const visibilityIcons = { personal: Lock, team: Users, public: Globe };

export default function DashboardLibraryPage() {
  const router = useRouter();

  const starred = dashboards.filter((d) => d.starred);
  const rest = dashboards.filter((d) => !d.starred);

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboards</h1>
            <p className="text-sm text-muted-foreground mt-1">Custom dashboards and analytics views</p>
          </div>
          <Button onClick={() => router.push('/analytics/dashboards/builder')}>
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {starred.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Starred</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {starred.map((d) => <DashboardCard key={d.id} dashboard={d} />)}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">All Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((d) => <DashboardCard key={d.id} dashboard={d} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ dashboard }: { dashboard: DashboardItem }) {
  const VisIcon = visibilityIcons[dashboard.visibility];
  return (
    <Card className="group cursor-pointer hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">{dashboard.name}</CardTitle>
          </div>
          {dashboard.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{dashboard.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <VisIcon className="h-3 w-3" /> {dashboard.visibility}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{dashboard.widgetCount} widgets</span>
          {dashboard.lastViewed && (
            <span className="text-[10px] text-muted-foreground">&middot; {dashboard.lastViewed}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
