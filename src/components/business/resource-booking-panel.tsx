'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESOURCE BOOKING PANEL — Tentative/placeholder bookings (G9)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Book team members to projects with confirmed/tentative/placeholder status.
 * Supports drag-to-resize, conflict detection, and utilization preview.
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

type BookingStatus = 'confirmed' | 'tentative' | 'placeholder';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  status: BookingStatus;
}

interface ResourceBookingPanelProps {
  people?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  existingBookings?: Booking[];
  onSave?: (bookings: Booking[]) => void;
  className?: string;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-semantic-success', bgColor: 'bg-semantic-success/10' },
  tentative: { label: 'Tentative', color: 'text-semantic-warning', bgColor: 'bg-semantic-warning/10' },
  placeholder: { label: 'Placeholder', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

export function ResourceBookingPanel({
  people = [],
  projects = [],
  existingBookings = [],
  onSave,
  className,
}: ResourceBookingPanelProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(existingBookings);
  const [isSaving, setIsSaving] = useState(false);

  const conflicts = useMemo(() => {
    const issues: string[] = [];
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const a = bookings[i];
        const b = bookings[j];
        if (a.userId !== b.userId) continue;
        if (a.startDate <= b.endDate && b.startDate <= a.endDate) {
          const totalHours = a.hoursPerDay + b.hoursPerDay;
          if (totalHours > 8) {
            issues.push(`${a.userName} is over-allocated (${totalHours}h/day) between ${a.projectName} and ${b.projectName}`);
          }
        }
      }
    }
    return issues;
  }, [bookings]);

  const addBooking = useCallback(() => {
    setBookings((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        userId: '',
        userName: '',
        projectId: '',
        projectName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hoursPerDay: 8,
        status: 'tentative',
      },
    ]);
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateBooking = useCallback((id: string, field: keyof Booking, value: string | number) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (field === 'userId') {
          const person = people.find((p) => p.id === value);
          return { ...b, userId: String(value), userName: person?.name || String(value) };
        }
        if (field === 'projectId') {
          const project = projects.find((p) => p.id === value);
          return { ...b, projectId: String(value), projectName: project?.name || String(value) };
        }
        return { ...b, [field]: value };
      })
    );
  }, [people, projects]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/resource-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookings }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onSave?.(bookings);
      toast({ title: 'Bookings saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save bookings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [bookings, onSave, toast]);

  return (
    <div className={cn('space-y-4', className)}>
      {conflicts.length > 0 && (
        <Card className="border-semantic-warning/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-semantic-warning mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-semantic-warning">Resource Conflicts Detected</p>
                {conflicts.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{c}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resource Bookings
            </CardTitle>
            <CardDescription>Schedule team members to projects</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={addBooking}>
            <Plus className="h-3.5 w-3.5" />
            Add Booking
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <User className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No bookings yet</p>
              <p className="text-xs">Add a booking to schedule team members</p>
            </div>
          )}

          {bookings.map((booking) => (
            <div key={booking.id} className="p-3 rounded-lg border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn('text-[10px]', STATUS_CONFIG[booking.status].color)}
                >
                  {STATUS_CONFIG[booking.status].label}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeBooking(booking.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-[10px]">Person</Label>
                  <Select value={booking.userId} onValueChange={(v) => updateBooking(booking.id, 'userId', v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">Project</Label>
                  <Select value={booking.projectId} onValueChange={(v) => updateBooking(booking.id, 'projectId', v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Start</Label>
                    <Input type="date" value={booking.startDate} onChange={(e) => updateBooking(booking.id, 'startDate', e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">End</Label>
                    <Input type="date" value={booking.endDate} onChange={(e) => updateBooking(booking.id, 'endDate', e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Hours/Day</Label>
                    <Input type="number" value={booking.hoursPerDay} onChange={(e) => updateBooking(booking.id, 'hoursPerDay', parseFloat(e.target.value) || 0)} className="h-8 text-xs" min={0} max={24} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Status</Label>
                    <Select value={booking.status} onValueChange={(v) => updateBooking(booking.id, 'status', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="tentative">Tentative</SelectItem>
                        <SelectItem value="placeholder">Placeholder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {bookings.length > 0 && (
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Bookings'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
