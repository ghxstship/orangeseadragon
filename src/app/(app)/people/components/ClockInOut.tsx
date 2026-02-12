'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Coffee,
  LogIn,
  LogOut,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface ActiveShift {
  id: string;
  clockInTime: string;
  eventName?: string;
  venueName?: string;
  isWithinGeofence: boolean;
}

interface Event {
  id: string;
  name: string;
  venue?: { name: string };
}

export function ClockInOut() {
  const [isLoading, setIsLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'clock_in' | 'clock_out' | 'break_start' | 'break_end' | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active shift status
  useEffect(() => {
    fetchActiveShift();
    fetchTodayEvents();
  }, []);

  // Get location on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getLocation();
  }, []);

  const fetchActiveShift = async () => {
    try {
      const response = await fetch('/api/time-entries/active');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setActiveShift(data);
          setIsClockedIn(true);
          setIsOnBreak(data.isOnBreak || false);
        }
      }
    } catch (error) {
      console.error('Error fetching active shift:', error);
    }
  };

  const fetchTodayEvents = async () => {
    try {
      const response = await fetch('/api/events?date=today&assigned=true');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(loc);

        // Check if within geofence
        try {
          const response = await fetch('/api/geofences/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loc),
          });
          if (response.ok) {
            const data = await response.json();
            setIsWithinGeofence(data.isWithin);
          }
        } catch (error) {
          console.error('Error checking geofence:', error);
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleAction = (action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end') => {
    setPendingAction(action);
    
    // Show confirmation for clock out or if outside geofence
    if (action === 'clock_out' || (action === 'clock_in' && isWithinGeofence === false)) {
      setShowConfirmDialog(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: string) => {
    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      const endpoint = `/api/time-punches/${action.replace('_', '-')}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId || undefined,
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Action failed');
      }

      const data = await response.json();

      // Update state based on action
      switch (action) {
        case 'clock_in':
          setIsClockedIn(true);
          setActiveShift(data);
          toast.success('Clocked in successfully');
          break;
        case 'clock_out':
          setIsClockedIn(false);
          setActiveShift(null);
          setIsOnBreak(false);
          toast.success('Clocked out successfully');
          break;
        case 'break_start':
          setIsOnBreak(true);
          toast.success('Break started');
          break;
        case 'break_end':
          setIsOnBreak(false);
          toast.success('Break ended');
          break;
      }

      setNotes('');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const getElapsedTime = () => {
    if (!activeShift?.clockInTime) return '0:00:00';
    const start = new Date(activeShift.clockInTime);
    const diff = currentTime.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-mono tabular-nums">
            {format(currentTime, 'HH:mm:ss')}
          </CardTitle>
          <CardDescription>
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Location Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Location</span>
            </div>
            {locationError ? (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Error
              </Badge>
            ) : location ? (
              isWithinGeofence === true ? (
                <Badge variant="default" className="gap-1 bg-emerald-600 dark:bg-emerald-500">
                  <CheckCircle2 className="h-3 w-3" />
                  At Venue
                </Badge>
              ) : isWithinGeofence === false ? (
                <Badge variant="secondary" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Off-site
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking...
                </Badge>
              )
            ) : (
              <Button variant="ghost" size="sm" onClick={getLocation}>
                Enable
              </Button>
            )}
          </div>

          {/* Active Shift Info */}
          {isClockedIn && activeShift && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Currently Working
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {getElapsedTime()}
                </span>
              </div>
              {activeShift.eventName && (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {activeShift.eventName}
                  {activeShift.venueName && ` @ ${activeShift.venueName}`}
                </p>
              )}
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Started {formatDistanceToNow(new Date(activeShift.clockInTime), { addSuffix: true })}
              </p>
            </div>
          )}

          {/* Break Status */}
          {isOnBreak && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">
                  On Break
                </span>
              </div>
            </div>
          )}

          {/* Event Selection (only when not clocked in) */}
          {!isClockedIn && events.length > 0 && (
            <div className="space-y-2">
              <Label>Select Event (Optional)</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific event</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                      {event.venue && ` @ ${event.venue.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isClockedIn ? (
              <Button
                size="lg"
                className="w-full h-16 text-lg gap-3 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600"
                onClick={() => handleAction('clock_in')}
                disabled={isLoading}
              >
                {isLoading && pendingAction === 'clock_in' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <LogIn className="h-6 w-6" />
                )}
                Clock In
              </Button>
            ) : (
              <>
                {!isOnBreak ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 gap-2"
                      onClick={() => handleAction('break_start')}
                      disabled={isLoading}
                    >
                      {isLoading && pendingAction === 'break_start' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Coffee className="h-5 w-5" />
                      )}
                      Start Break
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="h-14 gap-2"
                      onClick={() => handleAction('clock_out')}
                      disabled={isLoading}
                    >
                      {isLoading && pendingAction === 'clock_out' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <LogOut className="h-5 w-5" />
                      )}
                      Clock Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full h-14 gap-2"
                    onClick={() => handleAction('break_end')}
                    disabled={isLoading}
                  >
                    {isLoading && pendingAction === 'break_end' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                    End Break
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Photo Capture Option */}
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
            <Camera className="h-4 w-4" />
            Add Photo Verification
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'clock_out' ? 'Confirm Clock Out' : 'Location Warning'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'clock_out' ? (
                <>
                  You are about to clock out. Your total time will be{' '}
                  <strong>{getElapsedTime()}</strong>.
                </>
              ) : (
                <>
                  You appear to be outside the venue geofence. Your clock-in will be
                  flagged for manager review.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === 'clock_out' ? 'destructive' : 'default'}
              onClick={() => pendingAction && executeAction(pendingAction)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {pendingAction === 'clock_out' ? 'Clock Out' : 'Clock In Anyway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
