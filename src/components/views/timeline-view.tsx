"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { motion, AnimatePresence } from "framer-motion";
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

const _ROW_HEIGHT = 48;
const _HEADER_HEIGHT = 60;
const _GROUP_WIDTH = 200;

const ROW_HEIGHT_VAR = 'var(--timeline-row-height, 48px)';
const HEADER_HEIGHT_VAR = 'var(--timeline-header-height, 60px)';
const GROUP_WIDTH_VAR = 'var(--timeline-group-width, 200px)';

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

  const _formatTimeUnit = (date: Date): string => {
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
    <Card className={cn("w-full border-white/5 glass-morphism overflow-hidden shadow-2xl", className)}>
      <CardHeader className="pb-4 border-b border-white/5 bg-background/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <CardTitle className="text-xl font-black tracking-tight uppercase opacity-80">
              {format(viewStart, "MMMM d")} — {format(viewEnd, "MMMM d, yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-white/5">
              <Button variant="ghost" size="sm" onClick={() => handleNavigate("today")} className="h-7 text-[10px] font-black uppercase tracking-widest px-3 hover:bg-white/10">
                Today
              </Button>
              <div className="flex items-center gap-1 border-l border-white/10 pl-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-white/10"
                  onClick={() => handleNavigate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-white/10"
                  onClick={() => handleNavigate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-white/5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10"
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
            <div className="px-3 h-8 flex items-center justify-center bg-white/5 rounded-lg border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{currentZoom}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10"
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
            <div className="flex-shrink-0 border-r border-white/5 bg-background/20" style={{ width: GROUP_WIDTH_VAR }}>
              <div
                className="border-b border-white/5 bg-white/5 px-6 flex items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40"
                style={{ height: HEADER_HEIGHT_VAR }}
              >
                Groups
              </div>
              {groupedItems.map(({ group }, index) => (
                <div
                  key={group?.id || `ungrouped-${index}`}
                  className="border-b border-white/5 px-6 flex items-center text-xs font-bold transition-colors hover:bg-white/5"
                  style={{ height: ROW_HEIGHT_VAR }}
                >
                  {group ? (
                    <div className="flex items-center gap-3">
                      {group.color && (
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                          style={{ backgroundColor: group.color, color: group.color }}
                        />
                      )}
                      <span className="truncate tracking-tight">{group.title}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 italic font-medium uppercase tracking-[0.05em] text-[10px]">Ungrouped</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div style={{ width: totalWidth, minWidth: "100%" }}>
              {/* Header */}
              <div
                className="flex border-b border-white/5 bg-white/5 sticky top-0 z-30"
                style={{ height: HEADER_HEIGHT_VAR }}
              >
                {timeUnits.map((unit, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-shrink-0 border-r border-white/5 flex flex-col items-center justify-center gap-0.5",
                      showToday && isSameDay(unit, new Date()) && "bg-primary/10 shadow-[inner_0_0_20px_rgba(var(--primary),0.1)]"
                    )}
                    style={{ width: cellWidth }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-30">{format(unit, "EEE")}</span>
                    <span className={cn("text-sm font-black tracking-tight", showToday && isSameDay(unit, new Date()) && "text-primary")}>
                      {format(unit, "d")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex pointer-events-none z-0">
                  {timeUnits.map((unit, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-shrink-0 border-r border-white/5",
                        showToday && isSameDay(unit, new Date()) && "bg-primary/[0.03]"
                      )}
                      style={{ width: cellWidth }}
                    />
                  ))}
                </div>

                {/* Today line */}
                {showToday && todayPosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-primary z-40 shadow-[0_0_15px_rgba(var(--primary),0.8)]"
                    style={{ left: todayPosition }}
                  />
                )}

                {/* Items */}
                <AnimatePresence mode="popLayout">
                  {groupedItems.map(({ group, items: groupItems }, groupIndex) => (
                    <div
                      key={group?.id || `ungrouped-${groupIndex}`}
                      className="relative border-b border-white/5 group/row"
                      style={{ height: ROW_HEIGHT_VAR }}
                    >
                      <TooltipProvider>
                        {groupItems.map((item) => {
                          const position = getItemPosition(item);
                          if (!position) return null;

                          return (
                            <Tooltip key={item.id}>
                              <TooltipTrigger asChild>
                                <motion.div
                                  layoutId={item.id}
                                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  whileHover={{ scale: 1.02, zIndex: 50, y: -2 }}
                                  className={cn(
                                    "absolute top-2 h-9 rounded-xl px-4 flex items-center cursor-pointer",
                                    "text-[11px] font-black uppercase tracking-wider truncate shadow-xl border border-white/10",
                                    "glass-morphism transition-all duration-300",
                                    !item.color && "bg-primary/20 text-primary-foreground border-primary/30"
                                  )}
                                  style={{
                                    left: position.left + 4,
                                    width: position.width - 8,
                                    backgroundColor: item.color ? `${item.color}20` : undefined,
                                    color: item.color || undefined,
                                    borderColor: item.color ? `${item.color}40` : undefined,
                                    boxShadow: item.color ? `0 4px 20px -5px ${item.color}40` : undefined
                                  }}
                                  onClick={() => onItemClick?.(item)}
                                >
                                  {item.title}
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent className="glass-morphism border-white/10 p-4 shadow-2xl">
                                <div className="space-y-2">
                                  <div className="font-black uppercase tracking-widest text-xs opacity-80">{item.title}</div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                    <div className="bg-white/10 px-2 py-0.5 rounded uppercase">
                                      {format(typeof item.start === "string" ? parseISO(item.start) : item.start, "MMM d")}
                                    </div>
                                    <span className="opacity-30">—</span>
                                    <div className="bg-white/10 px-2 py-0.5 rounded uppercase">
                                      {format(typeof item.end === "string" ? parseISO(item.end) : item.end, "MMM d, yyyy")}
                                    </div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
