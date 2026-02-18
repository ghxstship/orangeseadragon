"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GanttView, GanttTask } from "@/components/views/gantt-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "@/hooks/auth/use-supabase";
import { useTasks } from "@/hooks/data/core/use-tasks";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { captureError } from '@/lib/observability';

interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: string;
}

export default function TaskTimelinePage() {
  const router = useRouter();
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: tasks, isLoading: tasksLoading } = useTasks(organizationId);
  
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [isLoadingDeps, setIsLoadingDeps] = useState(true);

  // Fetch all dependencies
  useEffect(() => {
    async function fetchDependencies() {
      if (!tasks || tasks.length === 0) {
        setIsLoadingDeps(false);
        return;
      }

      try {
        const taskIds = tasks
          .slice(0, 50)
          .map((task) => task.id)
          .filter(Boolean);

        if (taskIds.length === 0) {
          setDependencies([]);
          return;
        }

        const response = await fetch(`/api/task-dependencies?task_ids=${taskIds.join(',')}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch dependencies: ${response.status}`);
        }

        const result = await response.json();
        setDependencies(result.data ?? []);
      } catch (error) {
        captureError(error, 'timeline.fetchDependencies');
      } finally {
        setIsLoadingDeps(false);
      }
    }

    if (!tasksLoading) {
      fetchDependencies();
    }
  }, [tasks, tasksLoading]);

  // Transform tasks to GanttTask format
  const ganttTasks = useMemo<GanttTask[]>(() => {
    if (!tasks) return [];

    // Filter tasks with dates
    const tasksWithDates = tasks.filter((t) => t.start_date || t.due_date);

    // Calculate critical path (simplified: tasks with dependencies that are blocking)
    const criticalTaskIds = new Set<string>();
    dependencies.forEach((dep) => {
      const dependentTask = tasks.find((t) => t.id === dep.depends_on_task_id);
      if (dependentTask && dependentTask.status !== "done") {
        criticalTaskIds.add(dep.task_id);
        criticalTaskIds.add(dep.depends_on_task_id);
      }
    });

    const statusMap: Record<string, GanttTask["status"]> = {
      todo: undefined,
      in_progress: "on-track",
      in_review: "at-risk",
      done: "completed",
      blocked: "delayed",
    };

    return tasksWithDates.map((task) => ({
      id: task.id,
      name: task.title,
      startDate: task.start_date || task.due_date || new Date().toISOString(),
      endDate: task.due_date || task.start_date || new Date().toISOString(),
      progress: task.status === "done" ? 100 : task.status === "in_progress" ? 50 : 0,
      status: statusMap[task.status || "todo"],
      dependencies: dependencies
        .filter((d) => d.task_id === task.id)
        .map((d) => d.depends_on_task_id),
      isCriticalPath: criticalTaskIds.has(task.id),
    }));
  }, [tasks, dependencies]);

  const handleTaskClick = (task: GanttTask) => {
    router.push(`/core/tasks/${task.id}`);
  };

  const isLoading = tasksLoading || isLoadingDeps;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/core/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Task Timeline</h1>
            <p className="text-sm text-muted-foreground">
              Visualize task schedules and dependencies
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="show-deps"
              checked={showDependencies}
              onCheckedChange={setShowDependencies}
            />
            <Label htmlFor="show-deps" className="text-sm">
              Show Dependencies
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-critical"
              checked={showCriticalPath}
              onCheckedChange={setShowCriticalPath}
            />
            <Label htmlFor="show-critical" className="text-sm">
              Critical Path
            </Label>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      {isLoading ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b p-2"><Skeleton className="h-6 w-full" /></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex border-b p-2">
                <Skeleton className="h-8 w-64 mr-4" />
                <Skeleton className="h-8 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <GanttView
          tasks={ganttTasks}
          title="Task Timeline"
          onTaskClick={handleTaskClick}
          showDependencies={showDependencies}
          showCriticalPath={showCriticalPath}
        />
      )}
    </div>
  );
}
