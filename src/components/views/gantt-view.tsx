"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  showDependencies?: boolean;
  showCriticalPath?: boolean;
  showBaseline?: boolean;
  baselineTasks?: T[];
}

type ZoomLevel = "day" | "week" | "month";

export function GanttView<T extends GanttTask>({
  tasks,
  title,
  className,
  onTaskClick,
  showDependencies = true,
  showCriticalPath = false,
}: GanttViewProps<T>) {
  const [zoomLevel, setZoomLevel] = React.useState<ZoomLevel>("week");
  const [viewStart, setViewStart] = React.useState(() => startOfWeek(new Date()));
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const getTaskPosition = (task: GanttTask) => {
    const start = typeof task.startDate === "string" ? parseISO(task.startDate) : task.startDate;
    const end = typeof task.endDate === "string" ? parseISO(task.endDate) : task.endDate;

    const startOffset = Math.max(0, differenceInDays(start, viewStart));
    const duration = differenceInDays(end, start) + 1;
    const endOffset = Math.min(totalDays, startOffset + duration);

    const left = (startOffset / totalDays) * 100;
    const width = ((endOffset - startOffset) / totalDays) * 100;

    return { left: `${left}%`, width: `${Math.max(width, 1)}%` };
  };

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
        return "bg-green-500";
      case "on-track":
        return "bg-blue-500";
      case "at-risk":
        return "bg-yellow-500";
      case "delayed":
        return "bg-red-500";
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
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={zoomLevel} onValueChange={(v) => setZoomLevel(v as ZoomLevel)}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoomLevel(zoomLevel === "month" ? "week" : "day")}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
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
          <div className="w-64 flex-shrink-0 border-r">
            <div className="h-10 border-b bg-muted/50 px-3 flex items-center">
              <span className="text-sm font-medium">Task Name</span>
            </div>
            <div className="divide-y">
              {flatTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "h-10 px-3 flex items-center gap-2 hover:bg-muted/50 cursor-pointer",
                    task.isCriticalPath && showCriticalPath && "bg-red-50 dark:bg-red-950/20"
                  )}
                  style={{ paddingLeft: `${12 + task.depth * 16}px` }}
                  onClick={() => onTaskClick?.(task as unknown as T)}
                >
                  {task.isMilestone ? (
                    <Milestone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  ) : task.isCriticalPath && showCriticalPath ? (
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  ) : null}
                  <span className="text-sm truncate flex-1">{task.name}</span>
                  {task.dependencies && task.dependencies.length > 0 && showDependencies && (
                    <Link2 className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-x-auto" ref={containerRef}>
            {/* Header */}
            <div className="h-10 border-b bg-muted/50 flex">
              {timeUnits.map((unit, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 border-r px-2 flex items-center justify-center"
                  style={{ width: `${100 / timeUnits.length}%`, minWidth: zoomLevel === "day" ? 40 : 80 }}
                >
                  <span className="text-xs text-muted-foreground">
                    {zoomLevel === "day"
                      ? format(unit, "d")
                      : zoomLevel === "week"
                      ? format(unit, "MMM d")
                      : format(unit, "MMM yyyy")}
                  </span>
                </div>
              ))}
            </div>

            {/* Task bars */}
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timeUnits.map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 border-r border-dashed border-muted"
                    style={{ width: `${100 / timeUnits.length}%` }}
                  />
                ))}
              </div>

              {/* Today line */}
              {isWithinInterval(new Date(), { start: viewStart, end: viewEnd }) && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                  style={{
                    left: `${(differenceInDays(new Date(), viewStart) / totalDays) * 100}%`,
                  }}
                />
              )}

              {/* Tasks */}
              {flatTasks.map((task) => {
                if (!isTaskVisible(task)) {
                  return (
                    <div key={task.id} className="h-10 border-b" />
                  );
                }

                const position = getTaskPosition(task);

                return (
                  <div key={task.id} className="h-10 border-b relative">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute top-2 h-6 rounded cursor-pointer transition-all hover:opacity-80",
                              task.isMilestone
                                ? "w-4 h-4 top-3 rotate-45 bg-purple-500"
                                : getStatusColor(task.status),
                              task.isCriticalPath && showCriticalPath && "ring-2 ring-red-500 ring-offset-1"
                            )}
                            style={task.isMilestone ? { left: position.left } : position}
                            onClick={() => onTaskClick?.(task as unknown as T)}
                          >
                            {!task.isMilestone && task.progress !== undefined && (
                              <div
                                className="absolute inset-0 bg-black/20 rounded-l"
                                style={{ width: `${task.progress}%` }}
                              />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{task.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                typeof task.startDate === "string" ? parseISO(task.startDate) : task.startDate,
                                "MMM d"
                              )}{" "}
                              -{" "}
                              {format(
                                typeof task.endDate === "string" ? parseISO(task.endDate) : task.endDate,
                                "MMM d, yyyy"
                              )}
                            </p>
                            {task.progress !== undefined && (
                              <p className="text-xs">{task.progress}% complete</p>
                            )}
                            {task.status && (
                              <Badge variant="secondary" className="text-xs">
                                {task.status}
                              </Badge>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t p-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span>At Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Delayed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Milestone className="w-3 h-3 text-purple-500" />
            <span>Milestone</span>
          </div>
          {showCriticalPath && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded ring-2 ring-red-500 ring-offset-1" />
              <span>Critical Path</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
