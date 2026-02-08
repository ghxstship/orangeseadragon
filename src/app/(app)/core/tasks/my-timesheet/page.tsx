"use client";

import { useState, useMemo, useCallback } from "react";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Clock,
  Timer,
  ChevronLeft,
  ChevronRight,
  Send,
  Play,
  Square,
} from "lucide-react";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  hours: Record<string, number>;
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
  const [entries, setEntries] = useState<TimeEntry[]>([
    { id: "1", project: "Summer Festival 2026", task: "Stage Design", hours: {} },
    { id: "2", project: "Corporate Gala", task: "Vendor Coordination", hours: {} },
    { id: "3", project: "Brand Activation", task: "Site Survey", hours: {} },
  ]);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const isCurrentWeek = weekOffset === 0;

  const weekTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weekDates.forEach((d) => {
      const key = dateKey(d);
      totals[key] = entries.reduce((sum, e) => sum + (e.hours[key] || 0), 0);
    });
    return totals;
  }, [entries, weekDates]);

  const grandTotal = useMemo(
    () => Object.values(weekTotals).reduce((sum, h) => sum + h, 0),
    [weekTotals]
  );

  const billableTotal = useMemo(() => Math.round(grandTotal * 0.85 * 10) / 10, [grandTotal]);
  const utilizationPct = useMemo(() => {
    const targetHours = 40;
    return Math.min(100, Math.round((grandTotal / targetHours) * 100));
  }, [grandTotal]);

  const handleHoursChange = useCallback(
    (entryId: string, day: string, value: string) => {
      const hours = parseFloat(value) || 0;
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, hours: { ...e.hours, [day]: hours } } : e
        )
      );
    },
    []
  );

  const handleToggleTimer = useCallback(
    (entryId: string) => {
      setActiveTimer((prev) => (prev === entryId ? null : entryId));
    },
    []
  );

  const rowTotal = useCallback(
    (entry: TimeEntry) =>
      weekDates.reduce((sum, d) => sum + (entry.hours[dateKey(d)] || 0), 0),
    [weekDates]
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — Layout A */}
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
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
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
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-2">
                        <div className="font-medium text-sm">{entry.project}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 mt-0.5">
                          {entry.task}
                        </div>
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
                              value={entry.hours[key] || ""}
                              onChange={(e) => handleHoursChange(entry.id, key, e.target.value)}
                              className="h-8 w-16 text-center text-xs mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="—"
                            />
                          </td>
                        );
                      })}
                      <td className="px-4 py-2 text-center">
                        <span className="font-mono text-xs font-bold">{rowTotal(entry)}h</span>
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleTimer(entry.id)}
                        >
                          {activeTimer === entry.id ? (
                            <Square className="h-3 w-3 text-destructive" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
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
