"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarView, type CalendarEvent } from "./calendar-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Filter,
  RefreshCw,
  Calendar,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
// Types aligned with the SSOT calendar_events API
export type CalendarSourceType =
  | 'event'
  | 'production'
  | 'task'
  | 'contract'
  | 'activation'
  | 'shift'
  | 'maintenance'
  | 'calendar_event';

export interface UnifiedCalendarItem {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  timezone?: string | null;
  sourceType: CalendarSourceType;
  sourceId: string;
  sourcePath: string;
  color?: string | null;
  location?: string | null;
  visibility?: string | null;
}

export interface CalendarAggregationResult {
  items: UnifiedCalendarItem[];
  sources: {
    type: CalendarSourceType;
    count: number;
    label: string;
    color: string;
  }[];
}


interface MasterCalendarProps {
  className?: string;
  defaultSources?: CalendarSourceType[];
  projectId?: string;
  readOnly?: boolean;
  onEventCreate?: (event: Partial<UnifiedCalendarItem>) => Promise<void>;
  onEventUpdate?: (id: string, updates: Partial<UnifiedCalendarItem>) => Promise<void>;
}

export function MasterCalendar({
  className,
  defaultSources,
  projectId,
  readOnly = false,
  onEventCreate,
  onEventUpdate,
}: MasterCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [createDate, setCreateDate] = React.useState<Date | null>(null);
  const [data, setData] = React.useState<CalendarAggregationResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [enabledSources, setEnabledSources] = React.useState<Set<CalendarSourceType>>(
    () => new Set<CalendarSourceType>(defaultSources || ["event", "production", "task", "contract", "activation", "calendar_event"])
  );

  const fetchCalendarData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const startDate = format(startOfMonth(subMonths(currentDate, 1)), "yyyy-MM-dd");
    const endDate = format(endOfMonth(addMonths(currentDate, 1)), "yyyy-MM-dd");
    const sources = Array.from(enabledSources).join(",");

    const params = new URLSearchParams({
      startDate,
      endDate,
      sources,
    });

    if (projectId) {
      params.set("projectId", projectId);
    }

    try {
      const response = await fetch(`/api/calendar/aggregated?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch calendar data");
      }
      const result: CalendarAggregationResult = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [currentDate, enabledSources, projectId]);

  React.useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const calendarEvents: CalendarEvent[] = React.useMemo(() => {
    if (!data) return [];

    return data.items
      .filter((item) => enabledSources.has(item.sourceType))
      .map((item) => ({
        id: item.id,
        title: item.title,
        start: item.startTime,
        end: item.endTime,
        allDay: item.allDay,
        color: item.color || undefined,
        data: item as unknown as Record<string, unknown>,
      }));
  }, [data, enabledSources]);

  const handleEventClick = (event: CalendarEvent) => {
    const item = event.data as unknown as UnifiedCalendarItem;
    if (item?.sourcePath) {
      router.push(item.sourcePath);
    }
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleDateClick = (date: Date) => {
    if (readOnly) return;
    setCreateDate(date);
    setIsCreateModalOpen(true);
  };

  const handleCreateEvent = async (eventData: Partial<UnifiedCalendarItem>) => {
    if (!onEventCreate) return;
    try {
      await onEventCreate(eventData);
      setIsCreateModalOpen(false);
      setCreateDate(null);
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // Note: handleUpdateEvent will be used for drag-to-reschedule in future
  void onEventUpdate; // Acknowledge prop for future use

  const toggleSource = (source: CalendarSourceType) => {
    setEnabledSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  };

  const selectAllSources = () => {
    if (data?.sources) {
      setEnabledSources(new Set<CalendarSourceType>(data.sources.map((s) => s.type)));
    }
  };

  const clearAllSources = () => {
    setEnabledSources(new Set<CalendarSourceType>());
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Master Calendar</h1>
          <Badge variant="secondary" className="text-xs">
            {calendarEvents.length} items
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Event Button */}
          {!readOnly && (
            <Button
              size="sm"
              onClick={() => {
                setCreateDate(new Date());
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          )}

          {/* Source Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Sources
                <Badge variant="secondary" className="ml-1">
                  {enabledSources.size}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filter by Source</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={selectAllSources}
                    >
                      All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={clearAllSources}
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {data?.sources.map((source) => (
                    <div
                      key={source.type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`source-${source.type}`}
                          checked={enabledSources.has(source.type)}
                          onCheckedChange={() => toggleSource(source.type)}
                        />
                        <Label
                          htmlFor={`source-${source.type}`}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          {source.label}
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {source.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCalendarData}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Source Legend */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        {data?.sources
          .filter((s) => enabledSources.has(s.type))
          .map((source) => (
            <div key={source.type} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              <span className="text-muted-foreground">{source.label}</span>
              <span className="text-muted-foreground/60">({source.count})</span>
            </div>
          ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">Failed to load calendar</p>
          <p className="text-xs mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchCalendarData}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      )}

      {/* Calendar */}
      {data && (
        <CalendarView
          events={calendarEvents}
          selectedDate={currentDate}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
          onDateClick={!readOnly ? handleDateClick : undefined}
          showViewSwitcher
          showNavigation
        />
      )}

      {/* Create Event Modal */}
      {isCreateModalOpen && createDate && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateDate(null);
          }}
          initialDate={createDate}
          onSubmit={handleCreateEvent}
        />
      )}

      {/* Empty State */}
      {data && calendarEvents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No items to display</p>
          <p className="text-sm mt-1">
            {enabledSources.size === 0
              ? "Enable at least one source to see calendar items"
              : "No events found for the selected date range"}
          </p>
        </div>
      )}
    </div>
  );
}

interface CalendarItemDetailProps {
  item: UnifiedCalendarItem;
  onNavigate?: () => void;
}

export function CalendarItemDetail({ item, onNavigate }: CalendarItemDetailProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{item.title}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
        </div>
        <Badge
          style={{ backgroundColor: `${item.color}20`, color: item.color || undefined }}
        >
          {item.sourceType}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Start:</span>{" "}
          {format(new Date(item.startTime), "PPp")}
        </div>
        <div>
          <span className="text-muted-foreground">End:</span>{" "}
          {format(new Date(item.endTime), "PPp")}
        </div>
        {item.location && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Location:</span> {item.location}
          </div>
        )}
      </div>

      {onNavigate && (
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={onNavigate}>
          <ExternalLink className="h-4 w-4" />
          View Details
        </Button>
      )}
    </div>
  );
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  onSubmit: (event: Partial<UnifiedCalendarItem>) => Promise<void>;
}

function CreateEventModal({ isOpen, onClose, initialDate, onSubmit }: CreateEventModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [startTime, setStartTime] = React.useState(format(initialDate, "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = React.useState(format(new Date(initialDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"));
  const [allDay, setAllDay] = React.useState(false);
  const [location, setLocation] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        startTime,
        endTime,
        allDay,
        location: location.trim() || undefined,
        sourceType: 'calendar_event',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Create Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="calendar-create-title" className="text-sm font-medium">Title</Label>
            <Input
              id="calendar-create-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              placeholder="Event title"
              autoFocus
              required
            />
          </div>
          <div>
            <Label htmlFor="calendar-create-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="calendar-create-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder="Optional description"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calendar-create-start" className="text-sm font-medium">Start</Label>
              <Input
                id="calendar-create-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="calendar-create-end" className="text-sm font-medium">End</Label>
              <Input
                id="calendar-create-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="all-day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(!!checked)}
            />
            <Label htmlFor="all-day" className="text-sm">All day event</Label>
          </div>
          <div>
            <Label htmlFor="calendar-create-location" className="text-sm font-medium">Location</Label>
            <Input
              id="calendar-create-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
              placeholder="Optional location"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
