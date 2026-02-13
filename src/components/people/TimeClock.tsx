'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, Square, Coffee, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ClockStatus = 'idle' | 'clocked_in' | 'on_break' | 'clocked_out';

interface TimeClockProps {
  employeeId?: string;
  employeeName?: string;
  onClockIn?: (data: ClockEventData) => void;
  onClockOut?: (data: ClockEventData) => void;
  onBreakStart?: () => void;
  onBreakEnd?: () => void;
}

interface ClockEventData {
  timestamp: Date;
  location?: { lat: number; lng: number };
  locationName?: string;
}

export function TimeClock({
  employeeId,
  employeeName = 'Team Member',
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
}: TimeClockProps) {
  const [status, setStatus] = useState<ClockStatus>('idle');
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [totalBreakMinutes, setTotalBreakMinutes] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationName('Current Location');
        },
        () => {
          setLocationName('Location unavailable');
        }
      );
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getElapsedTime = () => {
    if (!clockInTime) return '00:00:00';
    const elapsed = Math.floor((currentTime.getTime() - clockInTime.getTime()) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClockIn = () => {
    const now = new Date();
    setClockInTime(now);
    setStatus('clocked_in');
    setTotalBreakMinutes(0);
    onClockIn?.({
      timestamp: now,
      location: location || undefined,
      locationName,
    });
  };

  const handleClockOut = () => {
    const now = new Date();
    setStatus('clocked_out');
    onClockOut?.({
      timestamp: now,
      location: location || undefined,
      locationName,
    });
    setTimeout(() => {
      setStatus('idle');
      setClockInTime(null);
    }, 3000);
  };

  const handleBreakStart = () => {
    setBreakStartTime(new Date());
    setStatus('on_break');
    onBreakStart?.();
  };

  const handleBreakEnd = () => {
    if (breakStartTime) {
      const breakDuration = Math.floor((new Date().getTime() - breakStartTime.getTime()) / 60000);
      setTotalBreakMinutes((prev) => prev + breakDuration);
    }
    setBreakStartTime(null);
    setStatus('clocked_in');
    onBreakEnd?.();
  };

  const statusConfig = {
    idle: { color: 'bg-zinc-500', label: 'Not Clocked In', glow: '' },
    clocked_in: { color: 'bg-semantic-success', label: 'Working', glow: 'shadow-[0_0_30px_-5px_hsl(var(--semantic-success)/0.5)]' },
    on_break: { color: 'bg-semantic-warning', label: 'On Break', glow: 'shadow-[0_0_30px_-5px_hsl(var(--semantic-warning)/0.5)]' },
    clocked_out: { color: 'bg-semantic-info', label: 'Clocked Out', glow: 'shadow-[0_0_30px_-5px_hsl(var(--semantic-info)/0.5)]' },
  };

  return (
    <Card className={cn(
      "bg-zinc-900/60 backdrop-blur-xl border-border overflow-hidden transition-shadow duration-500",
      statusConfig[status].glow
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-zinc-300 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Clock
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs transition-colors",
              status === 'clocked_in' && "border-semantic-success/50 text-semantic-success",
              status === 'on_break' && "border-semantic-warning/50 text-semantic-warning",
              status === 'clocked_out' && "border-semantic-info/50 text-semantic-info",
              status === 'idle' && "border-zinc-500/50 text-zinc-400"
            )}
          >
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Time Display */}
        <div className="text-center py-4">
          <motion.div
            key={currentTime.getSeconds()}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="text-5xl font-mono font-bold text-white tracking-wider"
          >
            {formatTime(currentTime)}
          </motion.div>
          <p className="text-sm text-zinc-500 mt-2">{formatDate(currentTime)}</p>
        </div>

        {/* Elapsed Time (when clocked in) */}
        <AnimatePresence>
          {(status === 'clocked_in' || status === 'on_break') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-zinc-800/50 rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Elapsed Time</p>
                  <p className="text-2xl font-mono font-semibold text-white">{getElapsedTime()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Break Time</p>
                  <p className="text-lg font-mono text-zinc-400">{totalBreakMinutes} min</p>
                </div>
              </div>
              {clockInTime && (
                <p className="text-xs text-zinc-500 mt-2">
                  Clocked in at {formatTime(clockInTime)}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {status === 'clocked_out' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-semantic-info/10 border border-semantic-info/20 rounded-xl p-4 flex items-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-blue-300 font-medium">Successfully Clocked Out</p>
                <p className="text-xs text-blue-400/70">Your time has been recorded</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location */}
        {locationName && status !== 'clocked_out' && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <MapPin className="w-3 h-3" />
            <span>{locationName}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {status === 'idle' && (
            <Button
              onClick={handleClockIn}
              className="col-span-2 h-14 bg-semantic-success hover:bg-semantic-success/90 text-white font-medium text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Clock In
            </Button>
          )}

          {status === 'clocked_in' && (
            <>
              <Button
                onClick={handleBreakStart}
                variant="outline"
                className="h-14 border-semantic-warning/30 text-semantic-warning hover:bg-semantic-warning/10"
              >
                <Coffee className="w-5 h-5 mr-2" />
                Start Break
              </Button>
              <Button
                onClick={handleClockOut}
                className="h-14 bg-destructive hover:bg-destructive/90 text-white"
              >
                <Square className="w-5 h-5 mr-2" />
                Clock Out
              </Button>
            </>
          )}

          {status === 'on_break' && (
            <Button
              onClick={handleBreakEnd}
              className="col-span-2 h-14 bg-semantic-warning hover:bg-semantic-warning/90 text-white font-medium text-lg"
            >
              <Pause className="w-5 h-5 mr-2" />
              End Break
            </Button>
          )}
        </div>

        {/* Employee Info */}
        <div className="pt-4 border-t border-border text-center">
          <p className="text-sm text-zinc-400">{employeeName}</p>
          {employeeId && <p className="text-xs text-zinc-600">ID: {employeeId}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
