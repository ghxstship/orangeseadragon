"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-supabase';
import { useTasks } from '@/hooks/use-tasks';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityWidgetProps {
  title?: string;
  limit?: number;
}

export function RecentActivityWidget({ title = "Recent Activity", limit = 5 }: RecentActivityWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: tasks, isLoading, error } = useTasks(organizationId);

  const recentTasks = React.useMemo(() => {
    if (!tasks) return [];

    return tasks
      .filter(task => task.updated_at)
      .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())
      .slice(0, limit);
  }, [tasks, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load recent activity.</p>
        </CardContent>
      </Card>
    );
  }

  if (!recentTasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity found.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'todo': return 'bg-amber-500';
      case 'blocked': return 'bg-destructive';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3">
              <div className={`h-2 w-2 rounded-full mt-2 ${getStatusColor(task.status || 'todo')}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {task.status?.replace('_', ' ') || 'todo'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {task.updated_at ? formatDistanceToNow(new Date(task.updated_at), { addSuffix: true }) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
