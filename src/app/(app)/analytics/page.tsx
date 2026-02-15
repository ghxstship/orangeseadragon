'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageShell } from '@/components/common/page-shell';

const sections = [
  {
    title: 'Reports',
    items: [
      { icon: FileText, label: 'Report Library', description: 'Pre-built and custom reports across all modules', href: '/analytics/reports' },
      { icon: BarChart3, label: 'Report Builder', description: 'Create custom reports with drag-and-drop fields', href: '/analytics/reports/builder' },
      { icon: Clock, label: 'Scheduled Reports', description: 'Automate report delivery on a recurring schedule', href: '/analytics/scheduled' },
    ],
  },
  {
    title: 'Dashboards',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard Library', description: 'Saved dashboards for teams and roles', href: '/analytics/dashboards' },
      { icon: Plus, label: 'Dashboard Builder', description: 'Build custom dashboards with widgets and charts', href: '/analytics/dashboards/builder' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { icon: TrendingUp, label: 'Financial Analytics', description: 'Revenue, margins, budget health, and forecasting', href: '/analytics/financial' },
      { icon: Users, label: 'Workforce Analytics', description: 'Utilization, capacity, and labor cost analysis', href: '/analytics/workforce' },
      { icon: DollarSign, label: 'Profitability Analysis', description: 'Client, project, and department profitability', href: '/analytics/profitability' },
      { icon: Briefcase, label: 'Pipeline Analytics', description: 'Win rates, deal velocity, and revenue forecast', href: '/analytics/pipeline' },
    ],
  },
];

export default function AnalyticsHubPage() {
  const router = useRouter();

  return (
    <PageShell
      title="Analytics"
      description="Reports, dashboards, and business intelligence"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/analytics/reports/builder')}>
            <FileText className="mr-2 h-4 w-4" />
            New Report
          </Button>
          <Button onClick={() => router.push('/analytics/dashboards/builder')}>
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard
          </Button>
        </div>
      }
      contentClassName="space-y-8"
    >
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.href}
                    className="group cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => router.push(item.href)}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">{item.label}</h3>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
    </PageShell>
  );
}
