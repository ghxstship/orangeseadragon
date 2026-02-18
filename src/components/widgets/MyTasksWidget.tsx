"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { useUser } from '@/hooks/auth/use-supabase';
import { useTasks } from '@/hooks/data/core/use-tasks';
import { getStatusSolidClass } from '@/lib/theming/semantic-colors';
import { getErrorMessage } from '@/lib/api/error-message';

interface MyTasksWidgetProps {
  title?: string;
  limit?: number;
}

export function MyTasksWidget({ title = "My Tasks", limit = 5 }: MyTasksWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: tasks, isLoading, error, refetch } = useTasks(organizationId);

  const myTasks = React.useMemo(() => {
    if (!tasks) return [];

    return tasks
      .filter(task => task.status === 'todo' || task.status === 'in_progress')
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
          <ContextualEmptyState
            type="error"
            title="Failed to load your tasks"
            description={getErrorMessage(error, 'Please try again.')}
            actionLabel="Refresh"
            onAction={() => {
              void refetch();
            }}
            className="py-6"
          />
        </CardContent>
      </Card>
    );
  }

  if (!myTasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No assigned tasks found.</p>
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
        <div className="space-y-3">
          {myTasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3">
              <div className={`h-2 w-2 rounded-full mt-2 ${getStatusSolidClass(task.status ?? 'pending')}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {(task.status ?? 'pending').replace('_', ' ')}
                  </Badge>
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(task.due_date).toLocaleDateString()}
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
