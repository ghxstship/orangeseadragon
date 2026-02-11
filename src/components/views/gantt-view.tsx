"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Milestone,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  isWithinInterval,
  isWeekend,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";

export interface GanttTask {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  progress?: number;
  dependencies?: string[];
  isMilestone?: boolean;
  isCriticalPath?: boolean;
  assignee?: {
    name: string;
    avatar?: string;
  };
  status?: "on-track" | "at-risk" | "delayed" | "completed";
  color?: string;
  children?: GanttTask[];
}

export interface GanttViewProps<T extends GanttTask> {
  tasks: T[];
  title?: string;
  className?: string;
  onTaskClick?: (task: T) => void;
  onTaskUpdate?: (task: T, updates: { startDate: Date; endDate: Date }) => void;
  onDependencyShift?: (shifts: Array<{ taskId: string; newStart: Date; newEnd: Date }>) => void;
  showDependencies?: boolean;
  showCriticalPath?: boolean;
  showBaseline?: boolean;
  baselineTasks?: T[];
  skipWeekends?: boolean;
}

type ZoomLevel = "day" | "week" | "month";

/**
 * Add business days (skipping weekends) to a date.
 */
function addBusinessDays(date: Date, days: number): Date {
  let result = new Date(date);
  let remaining = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;

  while (remaining > 0) {
    result = addDays(result, direction);
    if (!isWeekend(result)) {
      remaining--;
    }
  }
  return result;
}

/**
 * Count business days between two dates.
 */
function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  let current = new Date(start);
  while (isBefore(current, end)) {
    current = addDays(current, 1);
    if (!isWeekend(current)) {
      count++;
    }
  }
  return count;
}

/**
 * Recalculate dependent task dates when a predecessor shifts.
 * Uses topological ordering to cascade changes through the dependency graph.
 */
function recalculateDependencies(
  allTasks: GanttTask[],
  changedTaskId: string,
  newEnd: Date,
  skipWeekends: boolean
): Array<{ taskId: string; newStart: Date; newEnd: Date }> {
  const shifts: Array<{ taskId: string; newStart: Date; newEnd: Date }> = [];
  const _taskMap = new Map(allTasks.map(t => [t.id, t]));

  // BFS through dependents
  const queue = [changedTaskId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const predecessorEnd = currentId === changedTaskId
      ? newEnd
      : (() => {
          const shift = shifts.find(s => s.taskId === currentId);
          return shift ? shift.newEnd : null;
        })();

    if (!predecessorEnd) continue;

    // Find all tasks that depend on this one
    for (const task of allTasks) {
      if (!task.dependencies?.includes(currentId)) continue;

      const taskStart = typeof task.startDate === "string" ? parseISO(task.startDate) : new Date(task.startDate);
      const taskEnd = typeof task.endDate === "string" ? parseISO(task.endDate) : new Date(task.endDate);
      const duration = skipWeekends
        ? businessDaysBetween(taskStart, taskEnd)
        : differenceInDays(taskEnd, taskStart);

      // New start = predecessor end + 1 (business) day
      const candidateStart = skipWeekends
        ? addBusinessDays(predecessorEnd, 1)
        : addDays(predecessorEnd, 1);

      // Only shift if the new start is later than current start
      if (isAfter(candidateStart, taskStart)) {
        const candidateEnd = skipWeekends
          ? addBusinessDays(candidateStart, duration)
          : addDays(candidateStart, duration);

        shifts.push({
          taskId: task.id,
          newStart: candidateStart,
          newEnd: candidateEnd,
        });

        queue.push(task.id);
      }
    }
  }

  return shifts;
}

export function GanttView<T extends GanttTask>({
  tasks,
  title,
  className,
  onTaskClick,
  onTaskUpdate,
  onDependencyShift,
  showDependencies = true,
  showCriticalPath = false,
  skipWeekends: _skipWeekends = false,
}: GanttViewProps<T>) {
  const [zoomLevel, setZoomLevel] = React.useState<ZoomLevel>("week");
  const [viewStart, setViewStart] = React.useState(() => startOfWeek(new Date()));
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);

  // Drag state
  const [dragState, setDragState] = React.useState<{
    taskId: string;
    mode: "move" | "resize-end";
    startX: number;
    originalStart: Date;
    originalEnd: Date;
  } | null>(null);
  const [dragPreview, setDragPreview] = React.useState<{
    taskId: string;
    newStart: Date;
    newEnd: Date;
  } | null>(null);

  const handleDragStart = React.useCallback(
    (e: React.MouseEvent, task: GanttTask, mode: "move" | "resize-end") => {
      if (!onTaskUpdate) return;
      e.stopPropagation();
      e.preventDefault();
      const start = typeof task.startDate === "string" ? parseISO(task.startDate) : new Date(task.startDate);
      const end = typeof task.endDate === "string" ? parseISO(task.endDate) : new Date(task.endDate);
      setDragState({ taskId: task.id, mode, startX: e.clientX, originalStart: start, originalEnd: end });
    },
    [onTaskUpdate]
  );

  React.useEffect(() => {
    if (!dragState || !timelineRef.current) return;

    const timelineEl = timelineRef.current;
    const timelineWidth = timelineEl.scrollWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const daysDelta = Math.round((deltaX / timelineWidth) * differenceInDays(getViewEnd(), viewStart));

      if (daysDelta === 0 && !dragPreview) return;

      let newStart: Date;
      let newEnd: Date;

      if (dragState.mode === "move") {
        newStart = _skipWeekends
          ? addBusinessDays(dragState.originalStart, daysDelta)
          : addDays(dragState.originalStart, daysDelta);
        newEnd = _skipWeekends
          ? addBusinessDays(dragState.originalEnd, daysDelta)
          : addDays(dragState.originalEnd, daysDelta);
      } else {
        newStart = dragState.originalStart;
        newEnd = _skipWeekends
          ? addBusinessDays(dragState.originalEnd, daysDelta)
          : addDays(dragState.originalEnd, daysDelta);
        if (isBefore(newEnd, newStart)) newEnd = newStart;
      }

      setDragPreview({ taskId: dragState.taskId, newStart, newEnd });
    };

    const handleMouseUp = () => {
      if (dragPreview) {
        const task = tasks.find((t) => t.id === dragState.taskId);
        if (task && onTaskUpdate) {
          onTaskUpdate(task as T, { startDate: dragPreview.newStart, endDate: dragPreview.newEnd });
        }
        if (onDependencyShift) {
          const shifts = recalculateDependencies(tasks, dragState.taskId, dragPreview.newEnd, _skipWeekends);
          if (shifts.length > 0) onDependencyShift(shifts);
        }
      }
      setDragState(null);
      setDragPreview(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragState, dragPreview, tasks, onTaskUpdate, onDependencyShift, _skipWeekends, viewStart]);

  const getViewEnd = React.useCallback(() => {
    switch (zoomLevel) {
      case "day":
        return addDays(viewStart, 14);
      case "week":
        return addWeeks(viewStart, 8);
      case "month":
        return addMonths(viewStart, 6);
    }
  }, [zoomLevel, viewStart]);

  const viewEnd = getViewEnd();

  const getTimeUnits = React.useCallback(() => {
    switch (zoomLevel) {
      case "day":
        return eachDayOfInterval({ start: viewStart, end: viewEnd });
      case "week":
        return eachWeekOfInterval({ start: viewStart, end: viewEnd });
      case "month":
        return eachDayOfInterval({ start: startOfMonth(viewStart), end: viewEnd })
          .filter((d) => d.getDate() === 1);
    }
  }, [zoomLevel, viewStart, viewEnd]);

  const timeUnits = getTimeUnits();
  const totalDays = differenceInDays(viewEnd, viewStart);

  const getTaskPosition = React.useCallback((task: GanttTask) => {
    const preview = dragPreview?.taskId === task.id ? dragPreview : null;
    const start = preview
      ? preview.newStart
      : typeof task.startDate === "string" ? parseISO(task.startDate) : task.startDate;
    const end = preview
      ? preview.newEnd
      : typeof task.endDate === "string" ? parseISO(task.endDate) : task.endDate;

    const startOffset = Math.max(0, differenceInDays(start, viewStart));
    const duration = differenceInDays(end, start) + 1;
    const endOffset = Math.min(totalDays, startOffset + duration);

    const left = (startOffset / totalDays) * 100;
    const width = ((endOffset - startOffset) / totalDays) * 100;

    return { left: `${left}%`, width: `${Math.max(width, 1)}%` };
  }, [dragPreview, viewStart, totalDays]);

  const isTaskVisible = (task: GanttTask) => {
    const start = typeof task.startDate === "string" ? parseISO(task.startDate) : task.startDate;
    const end = typeof task.endDate === "string" ? parseISO(task.endDate) : task.endDate;

    return (
      isWithinInterval(start, { start: viewStart, end: viewEnd }) ||
      isWithinInterval(end, { start: viewStart, end: viewEnd }) ||
      (isBefore(start, viewStart) && isAfter(end, viewEnd))
    );
  };

  const navigate = (direction: "prev" | "next") => {
    const amount = zoomLevel === "day" ? 7 : zoomLevel === "week" ? 4 : 2;
    const addFn = zoomLevel === "month" ? addMonths : zoomLevel === "week" ? addWeeks : addDays;
    setViewStart((prev) => addFn(prev, direction === "next" ? amount : -amount));
  };

  const goToToday = () => {
    setViewStart(startOfWeek(new Date()));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-status-completed";
      case "on-track":
        return "bg-status-on-track";
      case "at-risk":
        return "bg-status-at-risk";
      case "delayed":
        return "bg-status-delayed";
      default:
        return "bg-primary";
    }
  };

  const flattenTasks = (items: GanttTask[], depth = 0): (GanttTask & { depth: number })[] => {
    return items.flatMap((item) => [
      { ...item, depth },
      ...(item.children ? flattenTasks(item.children, depth + 1) : []),
    ]);
  };

  const flatTasks = flattenTasks(tasks);

  return (
    <Card className={cn("border-border glass-morphism overflow-hidden shadow-2xl", className)}>
      {title && (
        <CardHeader className="pb-4 border-b border-border bg-background/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <CardTitle className="text-xl font-black tracking-tight uppercase opacity-80">{title}</CardTitle>
              <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
                <Button variant="ghost" size="sm" onClick={goToToday} className="h-7 text-[10px] font-black uppercase tracking-widest px-3 hover:bg-accent">
                  Today
                </Button>
                <div className="flex items-center gap-1 border-l border-border pl-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-accent"
                    onClick={() => navigate("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-accent"
                    onClick={() => navigate("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border">
              <Select value={zoomLevel} onValueChange={(v) => setZoomLevel(v as ZoomLevel)}>
                <SelectTrigger className="w-[110px] h-8 glass-morphism border-border text-[10px] font-black uppercase tracking-widest">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-morphism border-border">
                  <SelectItem value="day" className="text-[10px] font-bold uppercase">Day</SelectItem>
                  <SelectItem value="week" className="text-[10px] font-bold uppercase">Week</SelectItem>
                  <SelectItem value="month" className="text-[10px] font-bold uppercase">Month</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 border-l border-border pl-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent"
                  onClick={() => setZoomLevel(zoomLevel === "month" ? "week" : "day")}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent"
                  onClick={() => setZoomLevel(zoomLevel === "day" ? "week" : "month")}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="flex border-t">
          {/* Task list */}
          {/* Task list */}
          <div className="w-80 flex-shrink-0 border-r border-border bg-background/20">
            <div className="h-12 border-b border-border bg-muted px-6 flex items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Task Breakdown</span>
            </div>
            <div className="divide-y divide-border">
              {flatTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "h-12 px-6 flex items-center gap-3 hover:bg-muted cursor-pointer transition-colors group/task",
                    task.isCriticalPath && showCriticalPath && "bg-status-critical-path/5"
                  )}
                  style={{ paddingLeft: `${24 + task.depth * 16}px` }}
                  onClick={() => onTaskClick?.(task as unknown as T)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {task.isMilestone ? (
                      <div className="h-6 w-6 rounded-lg bg-status-milestone/10 flex items-center justify-center shrink-0">
                        <Milestone className="h-3 h-3 text-status-milestone" />
                      </div>
                    ) : task.isCriticalPath && showCriticalPath ? (
                      <div className="h-6 w-6 rounded-lg bg-status-critical-path/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-3 h-3 text-status-critical-path" />
                      </div>
                    ) : (
                      <div className="h-2 w-2 rounded-full border border-border group-hover/task:border-primary transition-colors shrink-0" />
                    )}
                    <span className="text-[11px] font-bold truncate group-hover/task:text-primary transition-colors">{task.name}</span>
                  </div>
                  {task.dependencies && task.dependencies.length > 0 && showDependencies && (
                    <Link2 className="h-3 w-3 text-muted-foreground/30 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-x-auto" ref={(el) => { (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el; (timelineRef as React.MutableRefObject<HTMLDivElement | null>).current = el; }}>
            {/* Timeline Header */}
            <div className="h-12 border-b border-border bg-muted flex sticky top-0 z-30">
              {timeUnits.map((unit, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 border-r border-border px-2 flex flex-col items-center justify-center gap-0.5"
                  style={{ width: `${100 / timeUnits.length}%`, minWidth: zoomLevel === "day" ? 40 : 80 }}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30">
                    {zoomLevel === "day" ? format(unit, "EEE") : zoomLevel === "month" ? format(unit, "yyyy") : ""}
                  </span>
                  <span className="text-[10px] font-black tracking-tight">
                    {zoomLevel === "day"
                      ? format(unit, "d")
                      : zoomLevel === "week"
                        ? format(unit, "MMM d")
                        : format(unit, "MMM")}
                  </span>
                </div>
              ))}
            </div>

            {/* Task bars */}
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex pointer-events-none z-0">
                {timeUnits.map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 border-r border-border"
                    style={{ width: `${100 / timeUnits.length}%` }}
                  />
                ))}
              </div>

              {/* Today line */}
              {isWithinInterval(new Date(), { start: viewStart, end: viewEnd }) && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-primary z-20 shadow-[0_0_15px_rgba(var(--primary),0.8)]"
                  style={{
                    left: `${(differenceInDays(new Date(), viewStart) / totalDays) * 100}%`,
                  }}
                />
              )}

              {/* Tasks */}
              <AnimatePresence mode="popLayout">
                {flatTasks.map((task) => {
                  if (!isTaskVisible(task)) {
                    return (
                      <div key={task.id} className="h-12 border-b border-border" />
                    );
                  }

                  const position = getTaskPosition(task);

                  return (
                    <div key={task.id} className="h-12 border-b border-border relative group/row">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              layoutId={task.id}
                              initial={{ opacity: 0, scale: 0.95, x: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              whileHover={!dragState ? { scale: 1.01, zIndex: 30, y: -1 } : undefined}
                              className={cn(
                                "absolute top-3 h-6 rounded-full shadow-lg border border-border glass-morphism transition-all duration-300",
                                dragState?.taskId === task.id ? "cursor-grabbing z-40 opacity-80 ring-2 ring-primary/50" : onTaskUpdate && !task.isMilestone ? "cursor-grab" : "cursor-pointer",
                                task.isMilestone
                                  ? "w-4 h-4 top-4 rotate-45 bg-status-milestone shadow-lg border-status-milestone/60"
                                  : task.isCriticalPath && showCriticalPath
                                    ? cn(getStatusColor(task.status), "ring-2 ring-status-critical-path/50 ring-offset-2 ring-offset-background")
                                    : getStatusColor(task.status)
                              )}
                              style={task.isMilestone ? { left: position.left } : position}
                              onMouseDown={(e) => {
                                if (!task.isMilestone && onTaskUpdate) handleDragStart(e, task, "move");
                              }}
                              onClick={() => {
                                if (!dragState) onTaskClick?.(task as unknown as T);
                              }}
                            >
                              {!task.isMilestone && (
                                <div
                                  className={cn(
                                    "absolute inset-0 rounded-full opacity-40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]",
                                    getStatusColor(task.status)
                                  )}
                                />
                              )}
                              {!task.isMilestone && task.progress !== undefined && (
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${task.progress}%` }}
                                  className="absolute inset-y-0 left-0 bg-white/30 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                />
                              )}
                              {!task.isMilestone && onTaskUpdate && (
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 rounded-r-full z-10"
                                  onMouseDown={(e) => handleDragStart(e, task, "resize-end")}
                                />
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent className="glass-morphism border-border p-4 shadow-2xl">
                            <div className="space-y-2">
                              <p className="font-black uppercase tracking-widest text-xs opacity-80">{task.name}</p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                <div className="bg-accent px-2 py-0.5 rounded uppercase">
                                  {format(typeof task.startDate === "string" ? parseISO(task.startDate) : task.startDate, "MMM d")}
                                </div>
                                <span className="opacity-30">—</span>
                                <div className="bg-accent px-2 py-0.5 rounded uppercase">
                                  {format(typeof task.endDate === "string" ? parseISO(task.endDate) : task.endDate, "MMM d, yyyy")}
                                </div>
                              </div>
                              {task.progress !== undefined && (
                                <div className="space-y-1 mt-2">
                                  <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                    <span>Progress</span>
                                    <span>{task.progress}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${task.progress}%` }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-border p-4 bg-muted flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-status-on-track rounded-full shadow-lg" />
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-status-at-risk rounded-full shadow-lg" />
            <span>At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-status-delayed rounded-full shadow-lg" />
            <span>Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-status-completed rounded-full shadow-lg" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Milestone className="w-3 h-3 text-status-milestone" />
            <span>Milestone</span>
          </div>
          {showCriticalPath && (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-status-critical-path/50 ring-offset-2 ring-offset-background shadow-lg" />
              <span className="text-status-critical-path">Critical Path</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
