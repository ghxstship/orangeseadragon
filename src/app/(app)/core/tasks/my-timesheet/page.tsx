"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Clock,
  Timer,
  ChevronLeft,
  ChevronRight,
  Send,
  Play,
  Square,
  Loader2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  useMyTimeEntries,
  useUpsertTimeEntry,
  useSubmitWeekTimeEntries,
} from "@/hooks/use-my-time-entries";

interface GridRow {
  projectId: string;
  projectName: string;
  taskId: string | null;
  taskName: string | null;
  hours: Record<string, { id: string | null; value: number }>;
}

type WeekStatus = "draft" | "submitted" | "approved" | "rejected";

const TARGET_HOURS = 40;

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

const weekStatusConfig: Record<WeekStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: <FileText className="h-3 w-3" /> },
  submitted: { label: "Submitted", color: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20", icon: <Send className="h-3 w-3" /> },
  approved: { label: "Approved", color: "bg-semantic-success/10 text-semantic-success border-semantic-success/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function MyTimesheetPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [weekStatus] = useState<WeekStatus>("draft");
  const gridRef = useRef<HTMLTableElement>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const isCurrentWeek = weekOffset === 0;
  const weekStart = dateKey(weekDates[0]);
  const weekEnd = dateKey(weekDates[6]);

  const { data: rawEntries, isLoading, error, refetch } = useMyTimeEntries(weekStart, weekEnd);
  const upsertEntry = useUpsertTimeEntry();
  const submitWeek = useSubmitWeekTimeEntries();

  // Timer tick
  useEffect(() => {
    if (!activeTimer) {
      setTimerSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const timerDisplay = useMemo(() => {
    const h = Math.floor(timerSeconds / 3600);
    const m = Math.floor((timerSeconds % 3600) / 60);
    const s = timerSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [timerSeconds]);

  const gridRows = useMemo<GridRow[]>(() => {
    if (!rawEntries?.length) return [];
    const rowMap = new Map<string, GridRow>();

    for (const entry of rawEntries) {
      const rowKey = `${entry.project_id}::${entry.task_id ?? "none"}`;
      if (!rowMap.has(rowKey)) {
        rowMap.set(rowKey, {
          projectId: entry.project_id,
          projectName: entry.project_name,
          taskId: entry.task_id,
          taskName: entry.task_name,
          hours: {},
        });
      }
      const row = rowMap.get(rowKey)!;
      row.hours[entry.date] = { id: entry.id, value: entry.hours };
    }

    return Array.from(rowMap.values());
  }, [rawEntries]);

  const weekTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weekDates.forEach((d) => {
      const key = dateKey(d);
      totals[key] = gridRows.reduce((sum, r) => sum + (r.hours[key]?.value || 0), 0);
    });
    return totals;
  }, [gridRows, weekDates]);

  const grandTotal = useMemo(
    () => Object.values(weekTotals).reduce((sum, h) => sum + h, 0),
    [weekTotals]
  );

  const billableTotal = useMemo(() => {
    if (!rawEntries?.length) return 0;
    return rawEntries
      .filter((e) => e.billable)
      .reduce((sum, e) => sum + e.hours, 0);
  }, [rawEntries]);

  const utilizationPct = useMemo(() => {
    return Math.min(100, Math.round((grandTotal / TARGET_HOURS) * 100));
  }, [grandTotal]);

  const remainingHours = useMemo(() => {
    return Math.max(0, TARGET_HOURS - grandTotal);
  }, [grandTotal]);

  const handleHoursChange = useCallback(
    (row: GridRow, day: string, value: string) => {
      const hours = parseFloat(value) || 0;
      const existing = row.hours[day];

      upsertEntry.mutate({
        id: existing?.id ?? undefined,
        project_id: row.projectId,
        task_id: row.taskId,
        date: day,
        hours,
      });
    },
    [upsertEntry]
  );

  const handleToggleTimer = useCallback(
    (key: string) => {
      setActiveTimer((prev) => (prev === key ? null : key));
    },
    []
  );

  const handleSubmitWeek = useCallback(() => {
    submitWeek.mutate({ weekStart, weekEnd });
  }, [submitWeek, weekStart, weekEnd]);

  const handleCopyPreviousWeek = useCallback(async () => {
    try {
      await fetch("/api/time-entries/copy-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceWeekStart: dateKey(getWeekDates(weekOffset - 1)[0]), targetWeekStart: weekStart }),
      });
      refetch();
    } catch (err) {
      console.error("Failed to copy previous week:", err);
    }
  }, [weekOffset, weekStart, refetch]);

  const rowTotal = useCallback(
    (row: GridRow) =>
      weekDates.reduce((sum, d) => sum + (row.hours[dateKey(d)]?.value || 0), 0),
    [weekDates]
  );

  // Keyboard navigation: Tab between cells, Enter to move down
  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextRow = gridRef.current?.querySelector(
          `[data-cell="${rowIdx + 1}-${colIdx}"]`
        ) as HTMLInputElement | null;
        nextRow?.focus();
      }
    },
    []
  );

  const statusBadge = weekStatusConfig[weekStatus];

  if (error) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Timesheet</h1>
              <p className="text-muted-foreground">Weekly time entry and tracking</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <ContextualEmptyState
            type="error"
            title="Failed to load timesheet"
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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Timesheet</h1>
              <p className="text-muted-foreground">Weekly time entry and tracking</p>
            </div>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 gap-1", statusBadge.color)}>
              {statusBadge.icon}
              {statusBadge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={isCurrentWeek ? "secondary" : "outline"}
              size="sm"
              onClick={() => setWeekOffset(0)}
            >
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleCopyPreviousWeek}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Last Week
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy time entries from the previous week</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button size="sm" onClick={handleSubmitWeek} disabled={submitWeek.isPending || grandTotal === 0 || weekStatus === "submitted"}>
              {submitWeek.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Approval
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard
            title="Weekly Total"
            value={`${grandTotal}h`}
            icon={Clock}
            description={`${remainingHours}h remaining to target`}
          />
          <StatCard
            title="Billable Hours"
            value={`${billableTotal}h`}
            icon={Timer}
            description={grandTotal > 0 ? `${Math.round((billableTotal / grandTotal) * 100)}% billable` : "No hours logged"}
          />
          <StatCard
            title="Utilization"
            value={`${utilizationPct}%`}
            icon={Clock}
            trend={
              utilizationPct >= 80
                ? { value: utilizationPct, isPositive: true }
                : utilizationPct >= 50
                ? { value: utilizationPct, isPositive: true }
                : { value: 100 - utilizationPct, isPositive: false }
            }
            description={`Target: ${TARGET_HOURS}h/week`}
          />
          <StatCard
            title="Active Timer"
            value={activeTimer ? timerDisplay : "Stopped"}
            icon={Timer}
            description={activeTimer ? "Timer running" : "Start a timer on any row"}
          />
        </StatGrid>

        {/* Target Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-[0.2em] opacity-50">
              {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {grandTotal}h / {TARGET_HOURS}h target
              </span>
            </div>
          </div>
          <Progress
            value={utilizationPct}
            className={cn(
              "h-2",
              utilizationPct > 100 && "[&>div]:bg-destructive",
              utilizationPct >= 80 && utilizationPct <= 100 && "[&>div]:bg-semantic-success"
            )}
          />
        </div>

        {/* Timesheet Grid */}
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table ref={gridRef} className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[280px]">
                      Project / Task
                    </th>
                    {weekDates.map((d) => {
                      const isToday = d.toDateString() === new Date().toDateString();
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      const dayTotal = weekTotals[dateKey(d)] || 0;
                      const isOverTarget = dayTotal > 8;
                      return (
                        <th
                          key={dateKey(d)}
                          className={cn(
                            "text-center px-2 py-3 font-medium w-[80px]",
                            isToday && "text-primary bg-primary/5",
                            isWeekend && "opacity-50"
                          )}
                        >
                          <div className="text-[10px] uppercase tracking-wider">{formatDay(d)}</div>
                          <div className={cn("text-xs", isToday && "font-bold")}>{d.getDate()}</div>
                          {dayTotal > 0 && (
                            <div className={cn(
                              "text-[9px] font-mono font-bold mt-0.5",
                              isOverTarget ? "text-semantic-warning" : "opacity-40"
                            )}>
                              {dayTotal}h
                            </div>
                          )}
                        </th>
                      );
                    })}
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground w-[80px]">
                      Total
                    </th>
                    <th className="w-[50px]" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                        {weekDates.map((d) => (
                          <td key={dateKey(d)} className="px-1 py-3 text-center"><Skeleton className="h-8 w-16 mx-auto" /></td>
                        ))}
                        <td className="px-4 py-3"><Skeleton className="h-4 w-10 mx-auto" /></td>
                        <td />
                      </tr>
                    ))
                  ) : gridRows.length === 0 ? (
                    <tr>
                      <td colSpan={weekDates.length + 3} className="px-4 py-12 text-center">
                        <div className="text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm font-medium">No time entries this week</p>
                          <p className="text-xs opacity-60 mt-1">Log time from your assigned tasks or projects</p>
                          <Button variant="outline" size="sm" className="mt-3" onClick={handleCopyPreviousWeek}>
                            <Copy className="h-3 w-3 mr-1.5" />
                            Copy from last week
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    gridRows.map((row, rowIdx) => {
                      const rowKey = `${row.projectId}::${row.taskId ?? "none"}`;
                      const total = rowTotal(row);
                      const isTimerActive = activeTimer === rowKey;
                      return (
                        <tr
                          key={rowKey}
                          className={cn(
                            "border-b border-border hover:bg-accent/30 transition-colors",
                            isTimerActive && "bg-primary/5"
                          )}
                        >
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {isTimerActive && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                </span>
                              )}
                              <div>
                                <div className="font-medium text-sm">{row.projectName}</div>
                                {row.taskName && (
                                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 mt-0.5">
                                    {row.taskName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          {weekDates.map((d, colIdx) => {
                            const key = dateKey(d);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            const isToday = d.toDateString() === new Date().toDateString();
                            return (
                              <td
                                key={key}
                                className={cn(
                                  "px-1 py-2 text-center",
                                  isWeekend && "opacity-50",
                                  isToday && "bg-primary/5"
                                )}
                              >
                                <Input
                                  type="number"
                                  min={0}
                                  max={24}
                                  step={0.5}
                                  data-cell={`${rowIdx}-${colIdx}`}
                                  value={row.hours[key]?.value || ""}
                                  onChange={(e) => handleHoursChange(row, key, e.target.value)}
                                  onKeyDown={(e) => handleCellKeyDown(e, rowIdx, colIdx)}
                                  className="h-8 w-16 text-center text-xs mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="—"
                                  disabled={weekStatus === "submitted" || weekStatus === "approved"}
                                />
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-center">
                            <span className={cn(
                              "font-mono text-xs font-bold",
                              total > 0 ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {total}h
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={isTimerActive ? "destructive" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleToggleTimer(rowKey)}
                                  >
                                    {isTimerActive ? (
                                      <Square className="h-3 w-3" />
                                    ) : (
                                      <Play className="h-3 w-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isTimerActive ? "Stop timer" : "Start timer"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-medium">
                    <td className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em] opacity-50">
                      Daily Total
                    </td>
                    {weekDates.map((d) => {
                      const key = dateKey(d);
                      const dayTotal = weekTotals[key] || 0;
                      const isOverTarget = dayTotal > 8;
                      return (
                        <td key={key} className="px-2 py-3 text-center">
                          <span className={cn(
                            "font-mono text-xs font-bold",
                            isOverTarget && "text-semantic-warning"
                          )}>
                            {dayTotal}h
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={utilizationPct >= 80 ? "default" : "secondary"}
                        className="font-mono font-bold"
                      >
                        {grandTotal}h
                      </Badge>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
