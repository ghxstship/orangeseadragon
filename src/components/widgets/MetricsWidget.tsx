"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/auth/use-supabase';
import { useProjects } from '@/hooks/data/core/use-projects';
import { useTasks } from '@/hooks/data/core/use-tasks';

interface MetricsWidgetProps {
  title?: string;
  metrics?: Array<{
    label: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}

export function MetricsWidget({ title = "Key Metrics", metrics }: MetricsWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: projects, isLoading: projectsLoading } = useProjects(organizationId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(organizationId);

  // Calculate metrics if not provided
  const defaultMetrics = React.useMemo(() => {
    if (!metrics && !projectsLoading && !tasksLoading) {
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const pendingTasks = tasks?.filter(t => t.status === 'todo').length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;

      return [
        { label: 'Active Projects', value: activeProjects },
        { label: 'Pending Tasks', value: pendingTasks },
        { label: 'Completed Tasks', value: completedTasks },
      ];
    }
    return metrics || [];
  }, [metrics, projects, tasks, projectsLoading, tasksLoading]);

  if (projectsLoading || tasksLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="spatial-card bg-card/50 backdrop-blur-xl border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-50">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
          {defaultMetrics.map((metric, index) => (
            <div key={index} className="relative group">
              <div className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 transition-all group-hover:to-primary">
                {metric.value}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 opacity-70">
                {metric.label}
              </div>
              {metric.change && (
                <Badge
                  variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                  className="mt-2 text-[9px] px-1.5 py-0 h-4 border-none font-bold"
                >
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : ''}
                  {Math.abs(metric.change)}%
                </Badge>
              )}
              {index < defaultMetrics.length - 1 && (
                <div className="absolute right-[-1rem] top-1/2 -translate-y-1/2 h-8 w-[1px] bg-border/30 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
