"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";

export interface WorkloadTask {
  id: string;
  title: string;
  startDate: string | Date;
  endDate: string | Date;
  hours?: number;
  status?: "pending" | "in_progress" | "completed" | "blocked";
  priority?: "low" | "medium" | "high" | "urgent";
  color?: string;
}

export interface WorkloadResource {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
  capacity: number;
  tasks: WorkloadTask[];
}

export interface WorkloadViewProps {
  resources: WorkloadResource[];
  title?: string;
  className?: string;
  startDate?: Date;
  daysToShow?: number;
  onTaskClick?: (task: WorkloadTask, resource: WorkloadResource) => void;
  onResourceClick?: (resource: WorkloadResource) => void;
  capacityThresholds?: {
    warning: number;
    overloaded: number;
  };
}

export function WorkloadView({
  resources,
  title = "Workload",
  className,
  startDate: initialStartDate,
  daysToShow = 14,
  onResourceClick,
  capacityThresholds = { warning: 80, overloaded: 100 },
}: WorkloadViewProps) {
  const [startDate, setStartDate] = React.useState(
    () => initialStartDate || startOfWeek(new Date())
  );

  const endDate = addDays(startDate, daysToShow - 1);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const navigate = (direction: "prev" | "next") => {
    setStartDate((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  const goToToday = () => {
    setStartDate(startOfWeek(new Date()));
  };

  const getResourceLoad = (resource: WorkloadResource, day: Date): number => {
    let totalHours = 0;

    for (const task of resource.tasks) {
      const taskStart = typeof task.startDate === "string" ? parseISO(task.startDate) : task.startDate;
      const taskEnd = typeof task.endDate === "string" ? parseISO(task.endDate) : task.endDate;

      if (isWithinInterval(day, { start: taskStart, end: taskEnd })) {
        const taskDays = Math.ceil(
          (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        const hoursPerDay = (task.hours || 8) / taskDays;
        totalHours += hoursPerDay;
      }
    }

    return totalHours;
  };

  const getLoadPercentage = (hours: number, capacity: number): number => {
    return Math.round((hours / capacity) * 100);
  };

  const getLoadStatus = (percentage: number): "normal" | "warning" | "overloaded" => {
    if (percentage >= capacityThresholds.overloaded) return "overloaded";
    if (percentage >= capacityThresholds.warning) return "warning";
    return "normal";
  };

  const getLoadColor = (status: "normal" | "warning" | "overloaded"): string => {
    switch (status) {
      case "overloaded":
        return "bg-destructive";
      case "warning":
        return "bg-semantic-warning";
      default:
        return "bg-semantic-success";
    }
  };

  const getTasksForDay = (resource: WorkloadResource, day: Date): WorkloadTask[] => {
    return resource.tasks.filter((task) => {
      const taskStart = typeof task.startDate === "string" ? parseISO(task.startDate) : task.startDate;
      const taskEnd = typeof task.endDate === "string" ? parseISO(task.endDate) : task.endDate;
      return isWithinInterval(day, { start: taskStart, end: taskEnd });
    });
  };

  const getWeeklyStats = (resource: WorkloadResource) => {
    let totalHours = 0;
    let totalCapacity = 0;

    for (const day of days) {
      totalHours += getResourceLoad(resource, day);
      totalCapacity += resource.capacity;
    }

    return {
      hours: Math.round(totalHours),
      capacity: totalCapacity,
      percentage: getLoadPercentage(totalHours, totalCapacity),
    };
  };

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case "urgent":
        return "bg-destructive";
      case "high":
        return "bg-semantic-orange";
      case "medium":
        return "bg-semantic-warning";
      case "low":
        return "bg-semantic-info";
      default:
        return "bg-primary";
    }
  };

  const getWorkloadDayBarStyle = (percentage: number, hours: number): React.CSSProperties => ({
    height: `${Math.min(percentage, 100)}%`,
    minHeight: hours > 0 ? "4px" : "0",
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
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
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="sticky left-0 z-10 bg-muted/50 min-w-[160px] sm:min-w-[256px] p-3 text-left text-sm font-medium">
                  Resource
                </th>
                <th className="min-w-[80px] sm:min-w-[96px] p-3 text-center text-sm font-medium border-l">
                  Utilization
                </th>
                {days.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={cn(
                      "min-w-[60px] p-2 text-center text-xs border-l",
                      isSameDay(day, new Date()) && "bg-primary/10"
                    )}
                  >
                    <div className="font-medium">{format(day, "EEE")}</div>
                    <div className="text-muted-foreground">{format(day, "d")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => {
                const weeklyStats = getWeeklyStats(resource);
                const weeklyStatus = getLoadStatus(weeklyStats.percentage);

                return (
                  <tr key={resource.id} className="border-b hover:bg-muted/30">
                    <td
                      className="sticky left-0 z-10 bg-background min-w-[160px] sm:min-w-[256px] p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => onResourceClick?.(resource)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={resource.avatar} />
                          <AvatarFallback className="text-xs">
                            {resource.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{resource.name}</p>
                          {resource.role && (
                            <p className="text-xs text-muted-foreground truncate">
                              {resource.role}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="min-w-[80px] sm:min-w-[96px] p-3 border-l">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>{weeklyStats.hours}h</span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    weeklyStatus === "overloaded" && "text-destructive",
                                    weeklyStatus === "warning" && "text-semantic-warning"
                                  )}
                                >
                                  {weeklyStats.percentage}%
                                </span>
                              </div>
                              <Progress
                                value={Math.min(weeklyStats.percentage, 100)}
                                className={cn("h-2", getLoadColor(weeklyStatus))}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {weeklyStats.hours}h / {weeklyStats.capacity}h capacity
                            </p>
                            {weeklyStatus === "overloaded" && (
                              <p className="text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Overloaded
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    {days.map((day) => {
                      const dayLoad = getResourceLoad(resource, day);
                      const dayPercentage = getLoadPercentage(dayLoad, resource.capacity);
                      const dayStatus = getLoadStatus(dayPercentage);
                      const dayTasks = getTasksForDay(resource, day);

                      return (
                        <td
                          key={day.toISOString()}
                          className={cn(
                            "min-w-[60px] p-1 border-l relative",
                            isSameDay(day, new Date()) && "bg-primary/5"
                          )}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "h-8 rounded flex items-end justify-center cursor-pointer transition-colors",
                                    dayLoad > 0 && "hover:opacity-80"
                                  )}
                                >
                                  {dayLoad > 0 && (
                                    <div
                                      className={cn(
                                        "w-full rounded transition-all",
                                        getLoadColor(dayStatus)
                                      )}
                                      style={getWorkloadDayBarStyle(dayPercentage, dayLoad)}
                                    />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {format(day, "EEEE, MMM d")}
                                  </p>
                                  <p className="text-sm">
                                    {dayLoad.toFixed(1)}h / {resource.capacity}h ({dayPercentage}%)
                                  </p>
                                  {dayTasks.length > 0 && (
                                    <div className="pt-1 border-t mt-1">
                                      {dayTasks.slice(0, 3).map((task) => (
                                        <div
                                          key={task.id}
                                          className="flex items-center gap-1 text-xs"
                                        >
                                          <div
                                            className={cn(
                                              "w-2 h-2 rounded-full",
                                              task.color || getPriorityColor(task.priority)
                                            )}
                                          />
                                          <span className="truncate max-w-[150px]">
                                            {task.title}
                                          </span>
                                        </div>
                                      ))}
                                      {dayTasks.length > 3 && (
                                        <p className="text-xs text-muted-foreground">
                                          +{dayTasks.length - 3} more
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="border-t p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-semantic-success" />
              <span>Normal (&lt;{capacityThresholds.warning}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-semantic-warning" />
              <span>Warning ({capacityThresholds.warning}-{capacityThresholds.overloaded}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span>Overloaded (&gt;{capacityThresholds.overloaded}%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Default capacity: 8h/day</span>
          </div>
        </div>

        {resources.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No resources to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
