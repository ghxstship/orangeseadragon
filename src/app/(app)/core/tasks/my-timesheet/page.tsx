"use client";

import { useState, useMemo, useCallback } from "react";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function MyTimesheetPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const isCurrentWeek = weekOffset === 0;
  const weekStart = dateKey(weekDates[0]);
  const weekEnd = dateKey(weekDates[6]);

  const { data: rawEntries, isLoading } = useMyTimeEntries(weekStart, weekEnd);
  const upsertEntry = useUpsertTimeEntry();
  const submitWeek = useSubmitWeekTimeEntries();

  // Group raw entries into grid rows (project+task → days)
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
    const targetHours = 40;
    return Math.min(100, Math.round((grandTotal / targetHours) * 100));
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

  const rowTotal = useCallback(
    (row: GridRow) =>
      weekDates.reduce((sum, d) => sum + (row.hours[dateKey(d)]?.value || 0), 0),
    [weekDates]
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Timesheet</h1>
            <p className="text-muted-foreground">Weekly time entry and tracking</p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button size="sm" onClick={handleSubmitWeek} disabled={submitWeek.isPending || grandTotal === 0}>
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
          <StatCard title="Weekly Total" value={`${grandTotal}h`} icon={Clock} />
          <StatCard title="Billable Hours" value={`${billableTotal}h`} icon={Timer} />
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
          />
          <StatCard title="Active Timer" value={activeTimer ? "Running" : "Stopped"} icon={Timer} />
        </StatGrid>

        {/* Week Label */}
        <div className="text-xs font-black uppercase tracking-[0.2em] opacity-50">
          {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
        </div>

        {/* Timesheet Grid */}
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[280px]">
                      Project / Task
                    </th>
                    {weekDates.map((d) => {
                      const isToday = d.toDateString() === new Date().toDateString();
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <th
                          key={dateKey(d)}
                          className={cn(
                            "text-center px-2 py-3 font-medium w-[80px]",
                            isToday && "text-primary",
                            isWeekend && "opacity-50"
                          )}
                        >
                          <div className="text-[10px] uppercase tracking-wider">{formatDay(d)}</div>
                          <div className={cn("text-xs", isToday && "font-bold")}>{d.getDate()}</div>
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
                        </div>
                      </td>
                    </tr>
                  ) : (
                    gridRows.map((row) => {
                      const rowKey = `${row.projectId}::${row.taskId ?? "none"}`;
                      return (
                        <tr key={rowKey} className="border-b border-border hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-2">
                            <div className="font-medium text-sm">{row.projectName}</div>
                            {row.taskName && (
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 mt-0.5">
                                {row.taskName}
                              </div>
                            )}
                          </td>
                          {weekDates.map((d) => {
                            const key = dateKey(d);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                              <td key={key} className={cn("px-1 py-2 text-center", isWeekend && "opacity-50")}>
                                <Input
                                  type="number"
                                  min={0}
                                  max={24}
                                  step={0.5}
                                  value={row.hours[key]?.value || ""}
                                  onChange={(e) => handleHoursChange(row, key, e.target.value)}
                                  className="h-8 w-16 text-center text-xs mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="—"
                                />
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-center">
                            <span className="font-mono text-xs font-bold">{rowTotal(row)}h</span>
                          </td>
                          <td className="px-2 py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleToggleTimer(rowKey)}
                            >
                              {activeTimer === rowKey ? (
                                <Square className="h-3 w-3 text-destructive" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
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
                      return (
                        <td key={key} className="px-2 py-3 text-center">
                          <span className="font-mono text-xs font-bold">
                            {weekTotals[key] || 0}h
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary" className="font-mono font-bold">
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
