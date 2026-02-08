"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMyTasks, useCompleteTask } from "@/hooks/use-my-tasks";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { Toolbar } from "@/components/views/toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Timer,
  Circle,
} from "lucide-react";
import type { ViewType } from "@/components/views/toolbar";

interface TaskGroup {
  key: string;
  label: string;
  tasks: TaskItem[];
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project?: { id: string; name: string; slug: string } | null;
  [key: string]: unknown;
}

function getTimeGroup(dueDate: string | null): string {
  if (!dueDate) return "later";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return "this_week";
  if (diffDays <= 14) return "next_week";
  return "later";
}

const groupLabels: Record<string, string> = {
  overdue: "Overdue",
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "This Week",
  next_week: "Next Week",
  later: "Later",
};

const groupOrder = ["overdue", "today", "tomorrow", "this_week", "next_week", "later"];

const priorityColors: Record<string, string> = {
  urgent: "text-destructive",
  high: "text-warning",
  medium: "text-primary",
  low: "text-muted-foreground",
};

const statusIcons: Record<string, React.ReactNode> = {
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Timer className="h-4 w-4 text-primary" />,
  in_review: <Clock className="h-4 w-4 text-warning" />,
  done: <CheckSquare className="h-4 w-4 text-primary" />,
};

export default function MyTasksPage() {
  const router = useRouter();
  const { data: tasks, isLoading, error, refetch } = useMyTasks();
  const completeTask = useCompleteTask();
  const [viewType, setViewType] = useState<ViewType>("list");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    let filtered = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled") as TaskItem[];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.project?.name?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [tasks, searchQuery]);

  const taskGroups = useMemo<TaskGroup[]>(() => {
    const groups: Record<string, TaskItem[]> = {};
    groupOrder.forEach((key) => (groups[key] = []));

    filteredTasks.forEach((task) => {
      const group = getTimeGroup(task.due_date);
      groups[group].push(task);
    });

    return groupOrder
      .filter((key) => groups[key].length > 0)
      .map((key) => ({
        key,
        label: groupLabels[key],
        tasks: groups[key],
      }));
  }, [filteredTasks]);

  const stats = useMemo(() => {
    const allTasks = (tasks || []) as TaskItem[];
    const overdue = allTasks.filter(
      (t) => t.status !== "done" && t.due_date && new Date(t.due_date) < new Date()
    ).length;
    const dueToday = allTasks.filter((t) => {
      if (t.status === "done" || !t.due_date) return false;
      const d = new Date(t.due_date);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const total = allTasks.filter((t) => t.status !== "done" && t.status !== "cancelled").length;

    return { overdue, dueToday, inProgress, total };
  }, [tasks]);

  const handleComplete = useCallback(
    (taskId: string) => {
      completeTask.mutate(taskId);
    },
    [completeTask]
  );

  const handleTaskClick = useCallback(
    (taskId: string) => {
      router.push(`/core/tasks/${taskId}`);
    },
    [router]
  );

  if (error) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
              <p className="text-muted-foreground">Your personal task view across all projects</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <ContextualEmptyState
            type="error"
            title="Failed to load tasks"
            description={error.message}
            actionLabel="Try again"
            onAction={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — Layout A */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-muted-foreground">Your personal task view across all projects</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard
            title="Total Open"
            value={isLoading ? "..." : String(stats.total)}
            icon={CheckSquare}
          />
          <StatCard
            title="Due Today"
            value={isLoading ? "..." : String(stats.dueToday)}
            icon={Calendar}
          />
          <StatCard
            title="In Progress"
            value={isLoading ? "..." : String(stats.inProgress)}
            icon={Timer}
          />
          <StatCard
            title="Overdue"
            value={isLoading ? "..." : String(stats.overdue)}
            icon={AlertTriangle}
            trend={stats.overdue > 0 ? { value: stats.overdue, isPositive: false } : undefined}
          />
        </StatGrid>

        {/* Toolbar */}
        <Toolbar
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "Search my tasks...",
          }}
          view={{
            current: viewType,
            available: ["list", "kanban", "calendar"] as ViewType[],
            onChange: setViewType,
          }}
        />

        {/* Task Groups */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : taskGroups.length === 0 ? (
          <ContextualEmptyState
            type={searchQuery ? "no-results" : "no-data"}
            title={searchQuery ? "No tasks match your search" : "All caught up!"}
            description={
              searchQuery
                ? "Try adjusting your search terms"
                : "You have no open tasks. Create a new task or check your completed items."
            }
            actionLabel={!searchQuery ? "Create Task" : undefined}
            onAction={!searchQuery ? () => router.push("/core/tasks/new") : undefined}
          />
        ) : (
          <div className="space-y-6">
            {taskGroups.map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-3">
                  <h3
                    className={cn(
                      "text-xs font-black uppercase tracking-[0.2em]",
                      group.key === "overdue" ? "text-destructive" : "opacity-50"
                    )}
                  >
                    {group.label}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {group.tasks.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {group.tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="group cursor-pointer hover:bg-accent/50 transition-colors border-border"
                    >
                      <CardContent className="flex items-center gap-3 py-3 px-4">
                        <Checkbox
                          checked={task.status === "done"}
                          onCheckedChange={() => handleComplete(task.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5"
                        />
                        <div className="flex-1 min-w-0" onClick={() => handleTaskClick(task.id)}>
                          <div className="flex items-center gap-2">
                            {statusIcons[task.status] || statusIcons.todo}
                            <span className="font-medium text-sm truncate">{task.title}</span>
                            {task.priority && task.priority !== "medium" && (
                              <Badge
                                variant="outline"
                                className={cn("text-[9px] h-4 px-1 border-none font-bold uppercase", priorityColors[task.priority])}
                              >
                                {task.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {task.project?.name && (
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                                {task.project.name}
                              </span>
                            )}
                            {task.due_date && (
                              <span
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider",
                                  group.key === "overdue" ? "text-destructive" : "opacity-40"
                                )}
                              >
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
