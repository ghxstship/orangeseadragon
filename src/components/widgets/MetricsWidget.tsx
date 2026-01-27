"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-supabase';
import { useProjects } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';

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
          <div className="grid grid-cols-3 gap-4">
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {defaultMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              {metric.change && (
                <Badge
                  variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                  className="mt-1"
                >
                  {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                  {Math.abs(metric.change)}%
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
