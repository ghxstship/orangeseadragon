"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarPageConfig, CalendarViewType } from "@/config/pages/calendar-types";

export interface CalendarPageProps<T extends object> {
  config: CalendarPageConfig;
  events: T[];
  resources?: unknown[];
  getEventId: (event: T) => string;
  onAction?: (actionId: string, payload?: unknown) => void;
  onEventClick?: (event: T) => void;
  onDateSelect?: (date: Date) => void;
  loading?: boolean;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  
  const endPadding = 42 - days.length;
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
}

function MonthView<T extends object>({
  events,
  config,
  currentDate,
  onEventClick,
  onDateSelect,
}: {
  events: T[];
  config: CalendarPageConfig;
  currentDate: Date;
  onEventClick?: (event: T) => void;
  onDateSelect?: (date: Date) => void;
}) {
  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const record = event as Record<string, unknown>;
      const startDate = new Date(String(record[config.event.startField]));
      startDate.setHours(0, 0, 0, 0);
      return startDate.getTime() === date.getTime();
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.getTime() === today.getTime();
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] border-t border-r p-1 cursor-pointer hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                index % 7 === 0 && "border-l"
              )}
              onClick={() => onDateSelect?.(day)}
            >
              <div className={cn(
                "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                isToday && "bg-primary text-primary-foreground"
              )}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, i) => {
                  const record = event as Record<string, unknown>;
                  const color = config.event.colorField ? String(record[config.event.colorField] ?? "#3b82f6") : "#3b82f6";
                  return (
                    <div
                      key={i}
                      className="text-xs p-1 rounded truncate cursor-pointer"
                      style={{ backgroundColor: `${color}20`, color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {String(record[config.event.titleField] ?? "")}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
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

function WeekView<T extends object>({
  events,
  config,
  currentDate,
  onEventClick,
}: {
  events: T[];
  config: CalendarPageConfig;
  currentDate: Date;
  onEventClick?: (event: T) => void;
}) {
  const days = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 bg-muted">
        <div className="p-2 text-center text-sm font-medium border-r">Time</div>
        {days.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          return (
            <div key={day.toISOString()} className={cn("p-2 text-center text-sm font-medium", isToday && "bg-primary/10")}>
              <div>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div className={cn("text-lg", isToday && "text-primary font-bold")}>{day.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-t">
            <div className="p-2 text-xs text-muted-foreground border-r">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {days.map((day) => (
              <div key={day.toISOString()} className="min-h-[40px] border-r hover:bg-accent/50" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgendaView<T extends object>({
  events,
  config,
  onEventClick,
}: {
  events: T[];
  config: CalendarPageConfig;
  onEventClick?: (event: T) => void;
}) {
  const sortedEvents = [...events].sort((a, b) => {
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    return new Date(String(aRecord[config.event.startField])).getTime() -
           new Date(String(bRecord[config.event.startField])).getTime();
  });

  const groupedByDate = sortedEvents.reduce((acc, event) => {
    const record = event as Record<string, unknown>;
    const date = new Date(String(record[config.event.startField])).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, T[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate).map(([date, dayEvents]) => (
        <Card key={date}>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className="space-y-2">
              {dayEvents.map((event, index) => {
                const record = event as Record<string, unknown>;
                const color = config.event.colorField ? String(record[config.event.colorField] ?? "#3b82f6") : "#3b82f6";
                const startTime = new Date(String(record[config.event.startField])).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endTime = record[config.event.endField]
                  ? new Date(String(record[config.event.endField])).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50"
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: color }} />
                    <div className="flex-1">
                      <p className="font-medium">{String(record[config.event.titleField] ?? "")}</p>
                      <p className="text-sm text-muted-foreground">
                        {startTime}{endTime && ` - ${endTime}`}
                        {config.event.locationField && record[config.event.locationField] ? (
                          <> • {String(record[config.event.locationField])}</>
                        ) : null}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      {Object.keys(groupedByDate).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No events scheduled
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function CalendarPage<T extends object>({
  config,
  events,
  onAction,
  onEventClick,
  onDateSelect,
}: CalendarPageProps<T>) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [viewType, setViewType] = React.useState<CalendarViewType>(config.defaultView ?? config.views[0]);

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getTitle = () => {
    if (viewType === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (viewType === "week") {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const end = weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${start} - ${end}`;
    }
    return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const viewIcons: Record<CalendarViewType, React.ReactNode> = {
    month: <LayoutGrid className="h-4 w-4" />,
    week: <CalendarIcon className="h-4 w-4" />,
    day: <CalendarIcon className="h-4 w-4" />,
    agenda: <List className="h-4 w-4" />,
    timeline: <List className="h-4 w-4" />,
  };

  const actions = (
    <div className="flex items-center gap-2">
      {config.toolbar?.navigation !== false && (
        <>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={navigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      {config.toolbar?.viewSwitcher !== false && config.views.length > 1 && (
        <Select value={viewType} onValueChange={(v) => setViewType(v as CalendarViewType)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {config.views.map((view) => (
              <SelectItem key={view} value={view}>
                <span className="capitalize">{view}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {config.actions?.create?.enabled !== false && (
        <Button onClick={() => onAction?.("create")}>
          <Plus className="mr-2 h-4 w-4" />
          {config.actions?.create?.label ?? "Add Event"}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={getTitle()}
        actions={actions}
      />

      {viewType === "month" && (
        <MonthView
          events={events}
          config={config}
          currentDate={currentDate}
          onEventClick={onEventClick}
          onDateSelect={onDateSelect}
        />
      )}
      {viewType === "week" && (
        <WeekView
          events={events}
          config={config}
          currentDate={currentDate}
          onEventClick={onEventClick}
        />
      )}
      {(viewType === "agenda" || viewType === "timeline") && (
        <AgendaView
          events={events}
          config={config}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}
