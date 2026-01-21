"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  parseISO,
  isSameDay,
} from "date-fns";

export type TimelineZoom = "hours" | "days" | "weeks" | "months";

export interface TimelineItem {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  group?: string;
  data?: Record<string, unknown>;
}

export interface TimelineGroup {
  id: string;
  title: string;
  color?: string;
}

export interface TimelineViewProps {
  items: TimelineItem[];
  groups?: TimelineGroup[];
  startDate?: Date;
  endDate?: Date;
  zoom?: TimelineZoom;
  onZoomChange?: (zoom: TimelineZoom) => void;
  onItemClick?: (item: TimelineItem) => void;
  onDateRangeChange?: (start: Date, end: Date) => void;
  showGroups?: boolean;
  showToday?: boolean;
  className?: string;
}

const CELL_WIDTH = {
  hours: 60,
  days: 80,
  weeks: 120,
  months: 150,
};

const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 60;
const GROUP_WIDTH = 200;

export function TimelineView({
  items,
  groups = [],
  startDate: initialStartDate,
  endDate: initialEndDate,
  zoom = "days",
  onZoomChange,
  onItemClick,
  onDateRangeChange,
  showGroups = true,
  showToday = true,
  className,
}: TimelineViewProps) {
  const [currentZoom, setCurrentZoom] = React.useState<TimelineZoom>(zoom);
  const [viewStart, setViewStart] = React.useState(
    initialStartDate || subDays(new Date(), 7)
  );
  const [viewEnd, setViewEnd] = React.useState(
    initialEndDate || addDays(new Date(), 21)
  );

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleZoomChange = (newZoom: TimelineZoom) => {
    setCurrentZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    let newStart: Date;
    let newEnd: Date;

    if (direction === "today") {
      const range = differenceInDays(viewEnd, viewStart);
      newStart = subDays(new Date(), Math.floor(range / 2));
      newEnd = addDays(new Date(), Math.ceil(range / 2));
    } else {
      const delta = direction === "next" ? 1 : -1;
      switch (currentZoom) {
        case "hours":
          newStart = addDays(viewStart, delta);
          newEnd = addDays(viewEnd, delta);
          break;
        case "days":
          newStart = addWeeks(viewStart, delta);
          newEnd = addWeeks(viewEnd, delta);
          break;
        case "weeks":
          newStart = addMonths(viewStart, delta);
          newEnd = addMonths(viewEnd, delta);
          break;
        case "months":
          newStart = addMonths(viewStart, delta * 3);
          newEnd = addMonths(viewEnd, delta * 3);
          break;
        default:
          newStart = addWeeks(viewStart, delta);
          newEnd = addWeeks(viewEnd, delta);
      }
    }

    setViewStart(newStart);
    setViewEnd(newEnd);
    onDateRangeChange?.(newStart, newEnd);
  };

  const getTimeUnits = (): Date[] => {
    switch (currentZoom) {
      case "hours":
        return eachDayOfInterval({ start: viewStart, end: viewEnd });
      case "days":
        return eachDayOfInterval({ start: viewStart, end: viewEnd });
      case "weeks":
        return eachWeekOfInterval({ start: viewStart, end: viewEnd });
      case "months":
        return eachMonthOfInterval({ start: viewStart, end: viewEnd });
      default:
        return eachDayOfInterval({ start: viewStart, end: viewEnd });
    }
  };

  const formatTimeUnit = (date: Date): string => {
    switch (currentZoom) {
      case "hours":
        return format(date, "MMM d");
      case "days":
        return format(date, "EEE d");
      case "weeks":
        return format(date, "MMM d");
      case "months":
        return format(date, "MMM yyyy");
      default:
        return format(date, "MMM d");
    }
  };

  const getItemPosition = (item: TimelineItem): { left: number; width: number } | null => {
    const itemStart = typeof item.start === "string" ? parseISO(item.start) : item.start;
    const itemEnd = typeof item.end === "string" ? parseISO(item.end) : item.end;

    const viewInterval = { start: startOfDay(viewStart), end: endOfDay(viewEnd) };

    if (!isWithinInterval(itemStart, viewInterval) && !isWithinInterval(itemEnd, viewInterval)) {
      if (itemStart > viewEnd || itemEnd < viewStart) {
        return null;
      }
    }

    const effectiveStart = itemStart < viewStart ? viewStart : itemStart;
    const effectiveEnd = itemEnd > viewEnd ? viewEnd : itemEnd;

    const totalDays = differenceInDays(viewEnd, viewStart) + 1;
    const startOffset = differenceInDays(effectiveStart, viewStart);
    const duration = differenceInDays(effectiveEnd, effectiveStart) + 1;

    const cellWidth = CELL_WIDTH[currentZoom];
    const left = (startOffset / totalDays) * (totalDays * cellWidth);
    const width = Math.max((duration / totalDays) * (totalDays * cellWidth), 40);

    return { left, width };
  };

  const timeUnits = getTimeUnits();
  const cellWidth = CELL_WIDTH[currentZoom];
  const totalWidth = timeUnits.length * cellWidth;

  const groupedItems = React.useMemo(() => {
    if (!showGroups || groups.length === 0) {
      return [{ group: null, items }];
    }

    const grouped: Array<{ group: TimelineGroup | null; items: TimelineItem[] }> = [];
    const ungroupedItems: TimelineItem[] = [];

    groups.forEach((group) => {
      const groupItems = items.filter((item) => item.group === group.id);
      if (groupItems.length > 0) {
        grouped.push({ group, items: groupItems });
      }
    });

    items.forEach((item) => {
      if (!item.group || !groups.find((g) => g.id === item.group)) {
        ungroupedItems.push(item);
      }
    });

    if (ungroupedItems.length > 0) {
      grouped.push({ group: null, items: ungroupedItems });
    }

    return grouped;
  }, [items, groups, showGroups]);

  const todayPosition = React.useMemo(() => {
    const today = new Date();
    if (today < viewStart || today > viewEnd) return null;

    const totalDays = differenceInDays(viewEnd, viewStart) + 1;
    const offset = differenceInDays(today, viewStart);
    return (offset / totalDays) * totalWidth;
  }, [viewStart, viewEnd, totalWidth]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <CardTitle className="text-lg font-semibold">
              {format(viewStart, "MMM d")} - {format(viewEnd, "MMM d, yyyy")}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const zoomLevels: TimelineZoom[] = ["hours", "days", "weeks", "months"];
                const currentIndex = zoomLevels.indexOf(currentZoom);
                if (currentIndex > 0) {
                  handleZoomChange(zoomLevels[currentIndex - 1]);
                }
              }}
              disabled={currentZoom === "hours"}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Badge variant="secondary">{currentZoom}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const zoomLevels: TimelineZoom[] = ["hours", "days", "weeks", "months"];
                const currentIndex = zoomLevels.indexOf(currentZoom);
                if (currentIndex < zoomLevels.length - 1) {
                  handleZoomChange(zoomLevels[currentIndex + 1]);
                }
              }}
              disabled={currentZoom === "months"}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex">
          {showGroups && groups.length > 0 && (
            <div className="flex-shrink-0 border-r" style={{ width: GROUP_WIDTH }}>
              <div
                className="border-b bg-muted/50 px-4 flex items-center font-medium text-sm"
                style={{ height: HEADER_HEIGHT }}
              >
                Groups
              </div>
              {groupedItems.map(({ group }, index) => (
                <div
                  key={group?.id || `ungrouped-${index}`}
                  className="border-b px-4 flex items-center text-sm"
                  style={{ height: ROW_HEIGHT }}
                >
                  {group ? (
                    <div className="flex items-center gap-2">
                      {group.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      <span className="truncate">{group.title}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Ungrouped</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div style={{ width: totalWidth, minWidth: "100%" }}>
              {/* Header */}
              <div
                className="flex border-b bg-muted/50 sticky top-0 z-10"
                style={{ height: HEADER_HEIGHT }}
              >
                {timeUnits.map((unit, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-shrink-0 border-r flex items-center justify-center text-sm font-medium",
                      showToday && isSameDay(unit, new Date()) && "bg-primary/10"
                    )}
                    style={{ width: cellWidth }}
                  >
                    {formatTimeUnit(unit)}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {timeUnits.map((unit, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-shrink-0 border-r",
                        showToday && isSameDay(unit, new Date()) && "bg-primary/5"
                      )}
                      style={{ width: cellWidth }}
                    />
                  ))}
                </div>

                {/* Today line */}
                {showToday && todayPosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-20"
                    style={{ left: todayPosition }}
                  />
                )}

                {/* Items */}
                {groupedItems.map(({ group, items: groupItems }, groupIndex) => (
                  <div
                    key={group?.id || `ungrouped-${groupIndex}`}
                    className="relative border-b"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <TooltipProvider>
                      {groupItems.map((item) => {
                        const position = getItemPosition(item);
                        if (!position) return null;

                        return (
                          <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "absolute top-2 h-8 rounded px-2 flex items-center cursor-pointer",
                                  "text-xs font-medium truncate shadow-sm",
                                  "hover:shadow-md transition-shadow",
                                  item.color ? "" : "bg-primary text-primary-foreground"
                                )}
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  backgroundColor: item.color || undefined,
                                  color: item.color ? "#fff" : undefined,
                                }}
                                onClick={() => onItemClick?.(item)}
                              >
                                {item.title}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(
                                    typeof item.start === "string" ? parseISO(item.start) : item.start,
                                    "MMM d, yyyy"
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    typeof item.end === "string" ? parseISO(item.end) : item.end,
                                    "MMM d, yyyy"
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
