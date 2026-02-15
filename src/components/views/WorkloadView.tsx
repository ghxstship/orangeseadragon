"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
} from "date-fns";

export interface WorkloadTask {
  id: string;
  title: string;
  startDate: string | Date;
  endDate?: string | Date;
  dueDate?: string | Date;
  estimatedHours?: number;
  status?: string;
  priority?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  capacity?: number; // Hours per day
  tasks: WorkloadTask[];
}

export interface WorkloadViewProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
  onTaskClick?: (task: WorkloadTask, member: TeamMember) => void;
  defaultCapacity?: number;
  className?: string;
}

type ViewMode = "week" | "2weeks" | "month";

const capacityThresholds = {
  underloaded: 0.5,
  optimal: 0.8,
  overloaded: 1.0,
};

function getCapacityStatus(utilization: number): {
  status: "underloaded" | "optimal" | "overloaded" | "critical";
  color: string;
  bgColor: string;
} {
  if (utilization <= capacityThresholds.underloaded) {
    return { status: "underloaded", color: "text-semantic-info", bgColor: "bg-semantic-info" };
  }
  if (utilization <= capacityThresholds.optimal) {
    return { status: "optimal", color: "text-semantic-success", bgColor: "bg-semantic-success" };
  }
  if (utilization <= capacityThresholds.overloaded) {
    return { status: "overloaded", color: "text-semantic-warning", bgColor: "bg-semantic-warning" };
  }
  return { status: "critical", color: "text-destructive", bgColor: "bg-destructive" };
}

export function WorkloadView({
  members,
  onMemberClick,
  onTaskClick: _onTaskClick,
  defaultCapacity = 8,
  className,
}: WorkloadViewProps) {
  // Note: _onTaskClick reserved for future task-level interactions
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case "week":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        };
      case "2weeks":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 }),
        };
      case "month":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(addWeeks(currentDate, 3), { weekStartsOn: 1 }),
        };
    }
  }, [currentDate, viewMode]);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  const navigate = (direction: "prev" | "next") => {
    const amount = viewMode === "week" ? 7 : viewMode === "2weeks" ? 14 : 28;
    setCurrentDate((prev) =>
      direction === "next" ? addDays(prev, amount) : subDays(prev, amount)
    );
  };

  // Calculate workload for each member per day
  const memberWorkloads = useMemo(() => {
    return members.map((member) => {
      const capacity = member.capacity || defaultCapacity;
      const dailyWorkload: Record<string, { hours: number; tasks: WorkloadTask[] }> = {};

      // Initialize all days
      days.forEach((day) => {
        dailyWorkload[format(day, "yyyy-MM-dd")] = { hours: 0, tasks: [] };
      });

      // Distribute task hours across days
      member.tasks.forEach((task) => {
        const taskStart = new Date(task.startDate);
        const taskEnd = task.endDate
          ? new Date(task.endDate)
          : task.dueDate
          ? new Date(task.dueDate)
          : taskStart;

        const taskDays = eachDayOfInterval({ start: taskStart, end: taskEnd });
        const hoursPerDay = (task.estimatedHours || 4) / Math.max(taskDays.length, 1);

        taskDays.forEach((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          if (dailyWorkload[dayKey]) {
            dailyWorkload[dayKey].hours += hoursPerDay;
            dailyWorkload[dayKey].tasks.push(task);
          }
        });
      });

      // Calculate utilization
      const totalHours = Object.values(dailyWorkload).reduce((sum, d) => sum + d.hours, 0);
      const totalCapacity = days.filter((d) => d.getDay() !== 0 && d.getDay() !== 6).length * capacity;
      const utilization = totalCapacity > 0 ? totalHours / totalCapacity : 0;

      return {
        member,
        dailyWorkload,
        totalHours,
        totalCapacity,
        utilization,
        capacityStatus: getCapacityStatus(utilization),
      };
    });
  }, [members, days, defaultCapacity]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const overloaded = memberWorkloads.filter(
      (m) => m.capacityStatus.status === "overloaded" || m.capacityStatus.status === "critical"
    ).length;
    const underloaded = memberWorkloads.filter(
      (m) => m.capacityStatus.status === "underloaded"
    ).length;
    const optimal = memberWorkloads.filter(
      (m) => m.capacityStatus.status === "optimal"
    ).length;

    return { overloaded, underloaded, optimal };
  }, [memberWorkloads]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Workload
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* View Mode */}
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">1 Week</SelectItem>
                <SelectItem value="2weeks">2 Weeks</SelectItem>
                <SelectItem value="month">4 Weeks</SelectItem>
              </SelectContent>
            </Select>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-semantic-success" />
            <span>{summaryStats.optimal} optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-semantic-info" />
            <span>{summaryStats.underloaded} underloaded</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>{summaryStats.overloaded} overloaded</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {/* Header with dates */}
          <div className="flex border-b bg-muted/50 sticky top-0 z-10">
            <div className="w-56 min-w-56 p-2 border-r font-medium text-sm">
              Team Member
            </div>
            <div className="w-24 min-w-24 p-2 border-r font-medium text-sm text-center">
              Utilization
            </div>
            <div className="flex flex-1">
              {days.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 min-w-12 text-center text-xs py-2 border-r",
                    isSameDay(day, new Date()) && "bg-primary/10 font-bold",
                    day.getDay() === 0 || day.getDay() === 6 ? "bg-muted/30 text-muted-foreground" : ""
                  )}
                >
                  <div>{format(day, "EEE")}</div>
                  <div className="font-medium">{format(day, "d")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Member rows */}
          {members.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members to display</p>
                <p className="text-sm">Add team members with assigned tasks</p>
              </div>
            </div>
          ) : (
            memberWorkloads.map(({ member, dailyWorkload, utilization, capacityStatus }) => (
              <div key={member.id} className="flex border-b hover:bg-muted/30">
                {/* Member info */}
                <div
                  className="w-56 min-w-56 p-2 border-r flex items-center gap-2 cursor-pointer"
                  onClick={() => onMemberClick?.(member)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{member.name}</div>
                    {member.role && (
                      <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                    )}
                  </div>
                </div>

                {/* Utilization */}
                <div className="w-24 min-w-24 p-2 border-r flex flex-col items-center justify-center">
                  <div className={cn("text-sm font-bold", capacityStatus.color)}>
                    {Math.round(utilization * 100)}%
                  </div>
                  <Progress
                    value={Math.min(utilization * 100, 100)}
                    className={cn("h-1.5 w-16", capacityStatus.bgColor)}
                  />
                </div>

                {/* Daily workload */}
                <div className="flex flex-1">
                  {days.map((day, i) => {
                    const dayKey = format(day, "yyyy-MM-dd");
                    const dayData = dailyWorkload[dayKey];
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const capacity = member.capacity || defaultCapacity;
                    const dayUtilization = isWeekend ? 0 : dayData.hours / capacity;
                    const dayStatus = getCapacityStatus(dayUtilization);

                    return (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex-1 min-w-12 p-1 border-r flex items-center justify-center",
                                isWeekend && "bg-muted/30",
                                isSameDay(day, new Date()) && "bg-primary/5"
                              )}
                            >
                              {dayData.tasks.length > 0 && !isWeekend && (
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white",
                                    dayStatus.bgColor
                                  )}
                                >
                                  {dayData.tasks.length}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{format(day, "EEEE, MMM d")}</p>
                              <p className="text-xs">
                                {dayData.hours.toFixed(1)}h / {isWeekend ? "Weekend" : `${capacity}h`}
                              </p>
                              {dayData.tasks.length > 0 && (
                                <div className="text-xs space-y-0.5 mt-1">
                                  {dayData.tasks.slice(0, 3).map((task) => (
                                    <div key={task.id} className="truncate max-w-48">
                                      • {task.title}
                                    </div>
                                  ))}
                                  {dayData.tasks.length > 3 && (
                                    <div className="text-muted-foreground">
                                      +{dayData.tasks.length - 3} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="p-2 border-t bg-muted/30 flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Capacity:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-semantic-info" />
            <span>&lt;50% Underloaded</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-semantic-success" />
            <span>50-80% Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-semantic-warning" />
            <span>80-100% Near Capacity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>&gt;100% Overloaded</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
export function WorkloadViewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b p-2">
          <Skeleton className="h-10 w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex border-b p-2">
            <Skeleton className="h-12 w-56 mr-2" />
            <Skeleton className="h-12 w-24 mr-2" />
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
