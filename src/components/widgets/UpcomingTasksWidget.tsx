"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-supabase';
import { useTasks } from '@/hooks/use-tasks';
import { formatDistanceToNow } from 'date-fns';

interface UpcomingTasksWidgetProps {
  title?: string;
  limit?: number;
}

export function UpcomingTasksWidget({ title = "Upcoming Tasks", limit = 5 }: UpcomingTasksWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: tasks, isLoading, error } = useTasks(organizationId);

  const upcomingTasks = React.useMemo(() => {
    if (!tasks) return [];

    return tasks
      .filter(task => task.status === 'todo' || task.status === 'in_progress')
      .sort((a, b) => {
        // Sort by due date if available, then by creation date
        const aDate = a.due_date ? new Date(a.due_date) : new Date(a.created_at ?? Date.now());
        const bDate = b.due_date ? new Date(b.due_date) : new Date(b.created_at ?? Date.now());
        return aDate.getTime() - bDate.getTime();
      })
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
          <p className="text-sm text-muted-foreground">Failed to load upcoming tasks.</p>
        </CardContent>
      </Card>
    );
  }

  if (!upcomingTasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No upcoming tasks found.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
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
          {upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3">
              <div className={`h-2 w-2 rounded-full mt-2 ${getStatusColor(task.status ?? 'pending')}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {(task.status ?? 'pending').replace('_', ' ')}
                  </Badge>
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
