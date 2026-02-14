'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Palmtree,
  Stethoscope,
  Baby,
  Briefcase,
  GraduationCap,
  Heart,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getLeaveTypeSolidClass, getStatusSolidClass, getStatusTextClass } from '@/lib/tokens/semantic-colors';

type LeaveType = 'annual' | 'sick' | 'parental' | 'bereavement' | 'study' | 'unpaid';
type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason?: string;
}

interface LeaveCalendarProps {
  requests?: LeaveRequest[];
  onDateClick?: (date: Date) => void;
  onRequestClick?: (request: LeaveRequest) => void;
  onNewRequest?: () => void;
}

const LEAVE_TYPE_CONFIG: Record<LeaveType, { icon: React.ElementType; getColor: () => string; label: string }> = {
  annual: { icon: Palmtree, getColor: () => getLeaveTypeSolidClass('annual'), label: 'Annual Leave' },
  sick: { icon: Stethoscope, getColor: () => getLeaveTypeSolidClass('sick'), label: 'Sick Leave' },
  parental: { icon: Baby, getColor: () => getLeaveTypeSolidClass('parental'), label: 'Parental Leave' },
  bereavement: { icon: Heart, getColor: () => getLeaveTypeSolidClass('bereavement'), label: 'Bereavement' },
  study: { icon: GraduationCap, getColor: () => getLeaveTypeSolidClass('study'), label: 'Study Leave' },
  unpaid: { icon: Briefcase, getColor: () => getLeaveTypeSolidClass('unpaid'), label: 'Unpaid Leave' },
};

const STATUS_CONFIG: Record<LeaveStatus, { getColor: () => string; getBgColor: () => string }> = {
  pending: { getColor: () => getStatusTextClass('pending'), getBgColor: () => `${getStatusSolidClass('pending')}/20` },
  approved: { getColor: () => getStatusTextClass('approved'), getBgColor: () => `${getStatusSolidClass('approved')}/20` },
  rejected: { getColor: () => getStatusTextClass('rejected'), getBgColor: () => `${getStatusSolidClass('rejected')}/20` },
  cancelled: { getColor: () => getStatusTextClass('cancelled'), getBgColor: () => `${getStatusSolidClass('cancelled')}/20` },
};


const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function LeaveCalendar({
  requests = [],
  onDateClick,
  onRequestClick,
  onNewRequest,
}: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        days.push(null);
      }
    }
    
    return days;
  }, [year, month, startDay, daysInMonth]);

  const getRequestsForDate = (date: Date) => {
    return requests.filter(req => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className="bg-card/80 border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Leave Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="default" size="sm" onClick={onNewRequest} className="gap-2">
              <Plus className="w-4 h-4" />
              Request Leave
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
              {MONTHS[month]} {year}
            </h3>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-4">
            {Object.entries(LEAVE_TYPE_CONFIG).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={cn("w-3 h-3 rounded-full", config.getColor())} />
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {DAYS.map(day => (
            <div 
              key={day} 
              className="bg-muted/70 p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div key={`empty-${index}`} className="bg-muted/20 min-h-[100px]" />
              );
            }

            const dayRequests = getRequestsForDate(date);
            const today = isToday(date);
            const weekend = isWeekend(date);

            return (
              <motion.div
                key={date.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                className={cn(
                  "bg-card/70 min-h-[100px] p-1 cursor-pointer transition-colors",
                  "hover:bg-muted/60",
                  weekend && "bg-muted/30",
                  today && "ring-2 ring-primary ring-inset"
                )}
                onClick={() => onDateClick?.(date)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                  today ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  weekend && !today && "text-muted-foreground/70"
                )}>
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  <TooltipProvider>
                    {dayRequests.slice(0, 3).map((request) => {
                      const typeConfig = LEAVE_TYPE_CONFIG[request.leaveType];
                      const statusConfig = STATUS_CONFIG[request.status];

                      return (
                        <Tooltip key={request.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer",
                                typeConfig.getColor(),
                                "bg-opacity-20 hover:bg-opacity-30 transition-colors"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestClick?.(request);
                              }}
                            >
                              <span className="text-foreground truncate">
                                {request.employeeName.split(' ')[0]}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-popover border-border">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {request.employeeName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{request.employeeName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-xs", statusConfig.getColor(), statusConfig.getBgColor())}>
                                  {request.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{typeConfig.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>

                  {dayRequests.length > 3 && (
                    <div className="text-xs text-muted-foreground/80 px-1">
                      +{dayRequests.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
