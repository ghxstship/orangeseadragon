'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  X,
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Booking {
  id: string;
  item_name: string;
  status: string;
  availability_status: string;
  scheduled_delivery: string;
  block_start: string;
  block_end: string;
  quantity_required: number;
  location?: string;
  advance?: {
    id: string;
    advance_code: string;
    advance_type: string;
  };
  event?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
}

interface AvailabilityWindow {
  start: string;
  end: string;
  duration_hours: number;
}

interface AvailabilityData {
  catalogItemId: string;
  dateRange: { start: string; end: string };
  bookings: Booking[];
  availabilityWindows: AvailabilityWindow[];
  summary: {
    totalBookings: number;
    availableWindows: number;
    nextAvailable: string | null;
  };
}

interface AvailabilityTimelineProps {
  catalogItemId: string;
  excludeEventId?: string;
  onSlotSelect?: (date: Date, available: boolean) => void;
  className?: string;
  daysToShow?: number;
}

const statusLabels: Record<string, string> = {
  available: 'Available',
  pending: 'Pending',
  reserved: 'Reserved',
  in_transit: 'In Transit',
  deployed: 'Deployed',
};

export function AvailabilityTimeline({
  catalogItemId,
  excludeEventId,
  onSlotSelect,
  className,
  daysToShow = 14,
}: AvailabilityTimelineProps) {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const endDate = useMemo(() => addDays(startDate, daysToShow), [startDate, daysToShow]);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        catalogItemId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      if (excludeEventId) {
        params.set('excludeEventId', excludeEventId);
      }
      
      const res = await fetch(`/api/advancing/availability?${params}`);
      
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  }, [catalogItemId, startDate, endDate, excludeEventId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const days = useMemo(() => {
    const result = [];
    let current = startDate;
    while (current < endDate) {
      result.push(current);
      current = addDays(current, 1);
    }
    return result;
  }, [startDate, endDate]);

  const getBookingsForDay = useCallback((day: Date) => {
    if (!data) return [];
    
    return data.bookings.filter(booking => {
      const blockStart = new Date(booking.block_start);
      const blockEnd = new Date(booking.block_end);
      const dayStart = startOfDay(day);
      const dayEnd = addDays(dayStart, 1);
      
      return blockStart < dayEnd && blockEnd > dayStart;
    });
  }, [data]);

  const isDateAvailable = useCallback((day: Date) => {
    const bookings = getBookingsForDay(day);
    return bookings.length === 0;
  }, [getBookingsForDay]);

  const handlePrevious = () => {
    setStartDate(prev => addDays(prev, -7));
  };

  const handleNext = () => {
    setStartDate(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setStartDate(startOfDay(new Date()));
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    onSlotSelect?.(day, isDateAvailable(day));
  };

  if (loading && !data) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Availability</h3>
          {data && (
            <Badge variant="outline" className="ml-2">
              {data.summary.totalBookings} bookings
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-2">
          <TooltipProvider>
            {days.map((day) => {
              const bookings = getBookingsForDay(day);
              const available = bookings.length === 0;
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <Tooltip key={day.toISOString()}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "h-auto min-w-[48px] px-2 py-2 rounded-lg border transition-all flex flex-col items-center",
                        available 
                          ? "border-semantic-success/20 bg-semantic-success/10 hover:bg-semantic-success/15" 
                          : "border-destructive/30 bg-destructive/5 hover:bg-destructive/10 dark:border-destructive/40 dark:bg-destructive/10",
                        isToday && "ring-2 ring-primary ring-offset-2",
                        isSelected && "ring-2 ring-semantic-info ring-offset-2"
                      )}
                    >
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        {format(day, 'EEE')}
                      </span>
                      <span className={cn(
                        "text-lg font-bold",
                        available ? "text-semantic-success" : "text-destructive"
                      )}>
                        {format(day, 'd')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(day, 'MMM')}
                      </span>
                      
                      <div className="mt-1">
                        {available ? (
                          <Check className="h-4 w-4 text-semantic-success" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-medium">
                        {format(day, 'EEEE, MMMM d, yyyy')}
                      </p>
                      {available ? (
                        <p className="text-semantic-success text-sm flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Available for booking
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {bookings.map(booking => (
                            <div key={booking.id} className="text-sm">
                              <p className="font-medium">{booking.event?.name || 'Unknown Event'}</p>
                              <p className="text-muted-foreground text-xs">
                                {booking.advance?.advance_code} • {statusLabels[booking.availability_status]}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-semantic-success" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-destructive" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded ring-2 ring-primary ring-offset-1" />
          <span>Today</span>
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="p-4 rounded-lg border bg-muted/50">
          <h4 className="font-medium mb-2">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h4>
          
          {isDateAvailable(selectedDate) ? (
            <div className="flex items-center gap-2 text-semantic-success">
              <Check className="h-4 w-4" />
              <span>This date is available for booking</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>This date has existing bookings</span>
              </div>
              
              {getBookingsForDay(selectedDate).map(booking => (
                <div key={booking.id} className="p-3 rounded bg-background border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{booking.event?.name}</span>
                    <Badge variant="secondary">
                      {statusLabels[booking.availability_status]}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(booking.block_start), 'h:mm a')} - {format(new Date(booking.block_end), 'h:mm a')}
                    </div>
                    {booking.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Next available */}
      {data?.summary.nextAvailable && !isDateAvailable(selectedDate || new Date()) && (
        <div className="text-sm text-muted-foreground">
          Next available: {format(new Date(data.summary.nextAvailable), 'EEEE, MMMM d')}
        </div>
      )}
    </div>
  );
}
