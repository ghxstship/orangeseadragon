"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface ScheduleEntry {
  id: string;
  employee_name: string;
  role: string;
  department: string;
  shifts: {
    date: string;
    start_time: string;
    end_time: string;
    event_name: string;
    status: "scheduled" | "confirmed" | "working" | "completed";
  }[];
}

const statusConfig: Record<string, { color: string }> = {
  scheduled: { color: "bg-gray-200 text-gray-800" },
  confirmed: { color: "bg-blue-200 text-blue-800" },
  working: { color: "bg-green-200 text-green-800" },
  completed: { color: "bg-purple-200 text-purple-800" },
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getDepartmentColor(dept: string): string {
  const colors: Record<string, string> = {
    Production: "bg-purple-500",
    Audio: "bg-blue-500",
    Lighting: "bg-yellow-500",
    Video: "bg-green-500",
  };
  return colors[dept] || "bg-gray-500";
}

export default function CrewSchedulingPage() {
  const [scheduleData, setScheduleData] = React.useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [weekStart, setWeekStart] = React.useState(new Date("2024-01-15"));

  React.useEffect(() => {
    async function fetchScheduleData() {
      try {
        const response = await fetch("/api/v1/crew-scheduling");
        if (response.ok) {
          const result = await response.json();
          setScheduleData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch crew scheduling data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchScheduleData();
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() - 7);
    setWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + 7);
    setWeekStart(newDate);
  };

  const totalShifts = scheduleData.reduce((acc, e) => acc + e.shifts.length, 0);
  const confirmedShifts = scheduleData.reduce(
    (acc, e) => acc + e.shifts.filter((s) => s.status === "confirmed").length,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crew Scheduling"
        description="Manage crew schedules and assignments"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Crew Members"
          value={scheduleData.length}
          icon={Users}
        />
        <StatCard
          title="Total Shifts"
          value={totalShifts}
          icon={FileText}
        />
        <StatCard
          title="Confirmed"
          value={confirmedShifts}
          valueClassName="text-blue-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Pending"
          value={totalShifts - confirmedShifts}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[200px] text-center">
                {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 w-48">Crew Member</th>
                  {weekDays.map((day) => (
                    <th key={day.toISOString()} className="text-center p-3 min-w-[120px]">
                      <div className="text-xs text-muted-foreground">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="font-medium">
                        {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={getDepartmentColor(entry.department)}>
                            {getInitials(entry.employee_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{entry.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{entry.role}</p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const dateStr = day.toISOString().split("T")[0];
                      const shift = entry.shifts.find((s) => s.date === dateStr);

                      return (
                        <td key={day.toISOString()} className="p-2 text-center">
                          {shift ? (
                            <div className={`rounded-md p-2 text-xs ${statusConfig[shift.status].color}`}>
                              <div className="font-medium flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3" />
                                {shift.start_time}-{shift.end_time}
                              </div>
                              <div className="truncate mt-1">{shift.event_name}</div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-xs">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-200"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-200"></div>
          <span>Working</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-200"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
