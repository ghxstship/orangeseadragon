"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";

export type CalendarViewMode = "month" | "week" | "day" | "agenda";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  color?: string;
  data?: Record<string, unknown>;
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  view?: CalendarViewMode;
  onViewChange?: (view: CalendarViewMode) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventCreate?: (start: Date, end: Date) => void;
  selectedDate?: Date;
  className?: string;
  showViewSwitcher?: boolean;
  showNavigation?: boolean;
}

export function CalendarView({
  events,
  view = "month",
  onViewChange,
  onDateChange,
  onEventClick,
  onDateClick,
  selectedDate = new Date(),
  className,
  showViewSwitcher = true,
  showNavigation = true,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(selectedDate);
  const [currentView, setCurrentView] = React.useState<CalendarViewMode>(view);

  const handleViewChange = (newView: CalendarViewMode) => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    let newDate: Date;
    
    if (direction === "today") {
      newDate = new Date();
    } else {
      const delta = direction === "next" ? 1 : -1;
      switch (currentView) {
        case "month":
          newDate = delta > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
          break;
        case "week":
          newDate = delta > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
          break;
        case "day":
          newDate = delta > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1);
          break;
        default:
          newDate = delta > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
      }
    }
    
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return events.filter((event) => {
      const eventStart = typeof event.start === "string" ? parseISO(event.start) : event.start;
      const eventEnd = event.end
        ? typeof event.end === "string" ? parseISO(event.end) : event.end
        : eventStart;
      
      return (
        (eventStart >= dayStart && eventStart <= dayEnd) ||
        (eventEnd >= dayStart && eventEnd <= dayEnd) ||
        (eventStart <= dayStart && eventEnd >= dayEnd)
      );
    });
  };

  const getHeaderText = () => {
    switch (currentView) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "agenda":
        return format(currentDate, "MMMM yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showNavigation && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleNavigate("today")}>
                  Today
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleNavigate("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleNavigate("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            <CardTitle className="text-lg font-semibold">{getHeaderText()}</CardTitle>
          </div>
          
          {showViewSwitcher && (
            <div className="flex items-center gap-2">
              <Select value={currentView} onValueChange={(v) => handleViewChange(v as CalendarViewMode)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Month
                    </div>
                  </SelectItem>
                  <SelectItem value="week">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Week
                    </div>
                  </SelectItem>
                  <SelectItem value="day">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Day
                    </div>
                  </SelectItem>
                  <SelectItem value="agenda">
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Agenda
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {currentView === "month" && (
          <MonthView
            currentDate={currentDate}
            events={events}
            getEventsForDate={getEventsForDate}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
          />
        )}
        {currentView === "week" && (
          <WeekView
            currentDate={currentDate}
            events={events}
            getEventsForDate={getEventsForDate}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
          />
        )}
        {currentView === "day" && (
          <DayView
            currentDate={currentDate}
            events={getEventsForDate(currentDate)}
            onEventClick={onEventClick}
          />
        )}
        {currentView === "agenda" && (
          <AgendaView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

function MonthView({ currentDate, getEventsForDate, onEventClick, onDateClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-px bg-muted rounded-t-lg overflow-hidden">
        {weekDays.map((day) => (
          <div key={day} className="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-muted rounded-b-lg overflow-hidden">
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "bg-background min-h-[100px] p-2 cursor-pointer hover:bg-muted/50 transition-colors",
                !isCurrentMonth && "text-muted-foreground bg-muted/30"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded truncate cursor-pointer",
                      event.color ? "" : "bg-primary/10 text-primary"
                    )}
                    style={event.color ? { backgroundColor: `${event.color}20`, color: event.color } : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
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

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

function WeekView({ currentDate, getEventsForDate, onEventClick, onDateClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(currentDate, { weekStartsOn: 0 }),
  });

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayEvents = getEventsForDate(day);
        
        return (
          <div
            key={day.toISOString()}
            className={cn(
              "border rounded-lg p-2 min-h-[200px] cursor-pointer hover:bg-muted/50 transition-colors",
              isToday(day) && "border-primary"
            )}
            onClick={() => onDateClick?.(day)}
          >
            <div className="text-center mb-2">
              <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
              <div
                className={cn(
                  "text-lg font-semibold w-8 h-8 flex items-center justify-center mx-auto rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
            <div className="space-y-1">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded truncate cursor-pointer",
                    event.color ? "" : "bg-primary/10 text-primary"
                  )}
                  style={event.color ? { backgroundColor: `${event.color}20`, color: event.color } : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

function DayView({ events, onEventClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="divide-y">
        {hours.map((hour) => {
          const hourEvents = events.filter((event) => {
            const eventStart = typeof event.start === "string" ? parseISO(event.start) : event.start;
            return eventStart.getHours() === hour;
          });

          return (
            <div key={hour} className="flex min-h-[60px]">
              <div className="w-16 p-2 text-xs text-muted-foreground border-r bg-muted/30">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              <div className="flex-1 p-1 relative">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-2 rounded mb-1 cursor-pointer",
                      event.color ? "" : "bg-primary/10 text-primary"
                    )}
                    style={event.color ? { backgroundColor: `${event.color}20`, color: event.color } : undefined}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.end && (
                      <div className="text-muted-foreground">
                        {format(typeof event.start === "string" ? parseISO(event.start) : event.start, "h:mm a")} -{" "}
                        {format(typeof event.end === "string" ? parseISO(event.end) : event.end, "h:mm a")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

function AgendaView({ currentDate, events, onEventClick }: AgendaViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const monthEvents = events
    .filter((event) => {
      const eventStart = typeof event.start === "string" ? parseISO(event.start) : event.start;
      return eventStart >= monthStart && eventStart <= monthEnd;
    })
    .sort((a, b) => {
      const aStart = typeof a.start === "string" ? parseISO(a.start) : a.start;
      const bStart = typeof b.start === "string" ? parseISO(b.start) : b.start;
      return aStart.getTime() - bStart.getTime();
    });

  const groupedEvents: Record<string, CalendarEvent[]> = {};
  monthEvents.forEach((event) => {
    const eventStart = typeof event.start === "string" ? parseISO(event.start) : event.start;
    const dateKey = format(eventStart, "yyyy-MM-dd");
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });

  return (
    <div className="space-y-4">
      {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
        <div key={dateKey}>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isToday(parseISO(dateKey)) ? "default" : "secondary"}>
              {format(parseISO(dateKey), "EEE, MMM d")}
            </Badge>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            {dayEvents.map((event) => {
              const eventStart = typeof event.start === "string" ? parseISO(event.start) : event.start;
              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.allDay ? "All day" : format(eventStart, "h:mm a")}
                        {event.end && !event.allDay && (
                          <> - {format(typeof event.end === "string" ? parseISO(event.end) : event.end, "h:mm a")}</>
                        )}
                      </div>
                    </div>
                    {event.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {monthEvents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No events this month
        </div>
      )}
    </div>
  );
}
