"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMyTasks, useCompleteTask } from "@/hooks/data/core/use-my-tasks";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { PageShell } from "@/components/common/page-shell";
import { ContextualEmptyState, PageErrorState } from "@/components/common/contextual-empty-state";
import { Toolbar } from "@/components/views/toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Timer,
  Circle,
  Plus,
  MoreHorizontal,
  Play,
  ArrowRight,
} from "lucide-react";
import type { ViewType } from "@/components/views/toolbar";

interface TaskGroup {
  key: string;
  label: string;
  tasks: TaskItem[];
}

interface ProjectGroup {
  projectId: string;
  projectName: string;
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
  high: "text-semantic-warning",
  medium: "text-primary",
  low: "text-muted-foreground",
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  todo: { icon: <Circle className="h-4 w-4" />, label: "To Do", color: "text-muted-foreground" },
  in_progress: { icon: <Timer className="h-4 w-4" />, label: "In Progress", color: "text-primary" },
  in_review: { icon: <Clock className="h-4 w-4" />, label: "In Review", color: "text-semantic-warning" },
  done: { icon: <CheckSquare className="h-4 w-4" />, label: "Done", color: "text-semantic-success" },
};

export default function MyTasksPage() {
  const router = useRouter();
  const { data: tasks, isLoading, error, refetch } = useMyTasks();
  const completeTask = useCompleteTask();
  const [viewType, setViewType] = useState<ViewType>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
      (groups[group] ??= []).push(task);
    });

    return groupOrder
      .filter((key) => (groups[key]?.length ?? 0) > 0)
      .map((key) => ({
        key,
        label: groupLabels[key] ?? key,
        tasks: groups[key] ?? [],
      }));
  }, [filteredTasks]);

  const projectGroups = useMemo<ProjectGroup[]>(() => {
    const groups: Record<string, ProjectGroup> = {};
    filteredTasks.forEach((task) => {
      const pid = task.project?.id || "unassigned";
      const pname = task.project?.name || "No Project";
      if (!groups[pid]) {
        groups[pid] = { projectId: pid, projectName: pname, tasks: [] };
      }
      groups[pid].tasks.push(task);
    });
    return Object.values(groups).sort((a, b) => b.tasks.length - a.tasks.length);
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

  const handleBulkComplete = useCallback(() => {
    selectedIds.forEach((id) => completeTask.mutate(id));
    setSelectedIds(new Set());
  }, [selectedIds, completeTask]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/core/tasks/new");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const headerActions = (
    <Button onClick={() => router.push("/core/tasks/new")}>
      <Plus className="h-4 w-4 mr-2" />
      New Task
    </Button>
  );

  if (error) {
    return (
      <PageShell
        title="My Tasks"
        description="Your personal task view across all projects"
      >
        <PageErrorState
          title="Failed to load tasks"
          description={error.message || "Failed to load tasks"}
          error={error}
          onRetry={() => refetch()}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="My Tasks"
      description="Your personal task view across all projects"
      actions={headerActions}
      contentClassName="space-y-6"
    >
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
          selectedCount={selectedIds.size}
        />

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm" onClick={handleBulkComplete}>
              <CheckSquare className="h-3 w-3 mr-1.5" />
              Complete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        )}

        {/* View: List (time-grouped) */}
        {viewType === "list" && (
          <>
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
                        <TaskRow
                          key={task.id}
                          task={task}
                          isOverdue={group.key === "overdue"}
                          isSelected={selectedIds.has(task.id)}
                          onToggleSelect={() => toggleSelect(task.id)}
                          onComplete={() => handleComplete(task.id)}
                          onClick={() => handleTaskClick(task.id)}
                          onLogTime={() => router.push("/core/tasks/my-timesheet")}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* View: Board (grouped by project) */}
        {viewType === "kanban" && (
          <>
            {isLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-72 space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))}
              </div>
            ) : projectGroups.length === 0 ? (
              <ContextualEmptyState
                type="no-data"
                title="No tasks to display"
                description="Create a task to see it grouped by project."
                actionLabel="Create Task"
                onAction={() => router.push("/core/tasks/new")}
              />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {projectGroups.map((group) => (
                  <div key={group.projectId} className="flex-shrink-0 w-72">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 truncate max-w-[180px]">
                          {group.projectName}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          {group.tasks.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {group.tasks.map((task) => (
                        <Card
                          key={task.id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors border-border"
                          onClick={() => handleTaskClick(task.id)}
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium leading-tight">{task.title}</span>
                              <Checkbox
                                checked={task.status === "done"}
                                onCheckedChange={() => handleComplete(task.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 mt-0.5"
                              />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {task.priority && task.priority !== "medium" && (
                                <Badge variant="outline" className={cn("text-[9px] h-4 px-1 border-none font-bold uppercase", priorityColors[task.priority])}>
                                  {task.priority}
                                </Badge>
                              )}
                              {task.status && statusConfig[task.status] && (
                                <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 gap-0.5", statusConfig[task.status]?.color)}>
                                  {statusConfig[task.status]?.label}
                                </Badge>
                              )}
                              {task.due_date && (
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider",
                                  getTimeGroup(task.due_date) === "overdue" ? "text-destructive" : "opacity-40"
                                )}>
                                  {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* View: Calendar */}
        {viewType === "calendar" && (
          <CalendarTaskView tasks={filteredTasks} isLoading={isLoading} onTaskClick={handleTaskClick} />
        )}
    </PageShell>
  );
}

function TaskRow({
  task,
  isOverdue,
  isSelected,
  onToggleSelect,
  onComplete,
  onClick,
  onLogTime,
}: {
  task: TaskItem;
  isOverdue: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onComplete: () => void;
  onClick: () => void;
  onLogTime: () => void;
}) {
  const config = statusConfig[task.status] || statusConfig.todo;

  return (
    <Card className={cn(
      "group cursor-pointer hover:bg-accent/50 transition-colors border-border",
      isSelected && "ring-1 ring-primary/50 bg-primary/5"
    )}>
      <CardContent className="flex items-center gap-3 py-3 px-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4"
        />
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={onComplete}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-5 rounded-full"
        />
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center gap-2">
            <span className={cn("flex-shrink-0", config?.color)}>{config?.icon}</span>
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
                  isOverdue ? "text-destructive" : "opacity-40"
                )}
              >
                {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onLogTime(); }}>
            <Play className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onComplete}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogTime}>
                <Clock className="h-4 w-4 mr-2" />
                Log Time
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClick}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Open Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
      </CardContent>
    </Card>
  );
}

function CalendarTaskView({
  tasks,
  isLoading,
  onTaskClick,
}: {
  tasks: TaskItem[];
  isLoading: boolean;
  onTaskClick: (id: string) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean; tasks: TaskItem[] }> = [];

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false, tasks: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split("T")[0] ?? '';
      const dayTasks = tasks.filter((t) => t.due_date?.startsWith(dateStr));
      days.push({ date, isCurrentMonth: true, tasks: dayTasks });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, tasks: [] });
    }

    return days;
  }, [currentDate, tasks]);

  const monthLabel = currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40 py-2 border-b border-border bg-muted/30">
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const dateStr = day.date.toISOString().split("T")[0];
          const isToday = dateStr === today;
          return (
            <div
              key={i}
              className={cn(
                "min-h-[80px] p-1.5 border-b border-r border-border",
                !day.isCurrentMonth && "opacity-30 bg-muted/20",
                isToday && "bg-primary/5"
              )}
            >
              <div className={cn(
                "text-xs font-medium mb-1",
                isToday && "text-primary font-bold"
              )}>
                {day.date.getDate()}
              </div>
              <div className="space-y-0.5">
                {day.tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                      task.priority === "urgent" ? "bg-destructive/10 text-destructive" :
                      task.priority === "high" ? "bg-semantic-warning/10 text-semantic-warning" :
                      "bg-primary/10 text-primary"
                    )}
                    onClick={() => onTaskClick(task.id)}
                  >
                    {task.title}
                  </div>
                ))}
                {day.tasks.length > 3 && (
                  <div className="text-[9px] text-muted-foreground px-1">
                    +{day.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
