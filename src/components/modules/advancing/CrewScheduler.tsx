'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  Check,
  Loader2,
  MoreHorizontal,
  Phone,
  Mail,
  Star,
  Filter
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { getStatusSolidClass } from '@/lib/tokens/semantic-colors';
import { extractApiErrorMessage, getErrorMessage } from '@/lib/api/error-message';
import { captureError } from '@/lib/observability';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

interface CrewMember {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  skills: string[];
  hourly_rate?: number;
  day_rate?: number;
  rating?: number;
  status: string;
}

interface Assignment {
  id: string;
  crew_member_id: string;
  event_id?: string;
  role: string;
  department?: string;
  shift_start: string;
  shift_end: string;
  status: string;
  scheduled_hours?: number;
  crew_member?: CrewMember;
  event?: {
    id: string;
    name: string;
  };
}

interface CrewSchedulerProps {
  eventId?: string;
  advanceId?: string;
  className?: string;
}

// Status colors resolved via SSOT semantic tokens
const statusColors = (status: string) => getStatusSolidClass(status);

const ROLES = [
  'Audio Engineer',
  'Lighting Technician',
  'Video Operator',
  'Stage Manager',
  'Production Assistant',
  'Rigger',
  'Backline Tech',
  'FOH Engineer',
  'Monitor Engineer',
  'Stagehand',
  'Runner',
  'Load In/Out',
];

const DEPARTMENTS = [
  'Audio',
  'Lighting',
  'Video',
  'Stage',
  'Production',
  'Rigging',
  'Backline',
  'General',
];

export function CrewScheduler({ eventId, advanceId, className }: CrewSchedulerProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [skillFilter, setSkillFilter] = useState<string>('all');

  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  
  const days = useMemo(() => {
    const result = [];
    let current = weekStart;
    while (current <= weekEnd) {
      result.push(current);
      current = addDays(current, 1);
    }
    return result;
  }, [weekStart, weekEnd]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      const [crewRes, assignmentsRes] = await Promise.all([
        fetch('/api/advancing/crew?status=active'),
        fetch(`/api/advancing/crew/assignments?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}${eventId ? `&eventId=${eventId}` : ''}`),
      ]);
      
      if (crewRes.ok) {
        const crewData = await crewRes.json();
        setCrewMembers(crewData.records || []);
      }
      
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData.records || []);
      }
    } catch (error) {
      captureError(error, 'crewScheduler.fetchData');
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd, eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAssignmentsForCrewAndDay = useCallback((crewId: string, day: Date) => {
    return assignments.filter(a => {
      if (a.crew_member_id !== crewId) return false;
      const shiftStart = new Date(a.shift_start);
      const shiftEnd = new Date(a.shift_end);
      return isSameDay(shiftStart, day) || isWithinInterval(day, { start: shiftStart, end: shiftEnd });
    });
  }, [assignments]);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    crewMembers.forEach(c => c.skills?.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, [crewMembers]);

  const filteredCrew = useMemo(() => {
    if (skillFilter === 'all') return crewMembers;
    return crewMembers.filter(c => c.skills?.includes(skillFilter));
  }, [crewMembers, skillFilter]);

  const handlePrevWeek = () => setWeekStart(prev => addDays(prev, -7));
  const handleNextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const handleToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handleCellClick = (crew: CrewMember, day: Date) => {
    setSelectedCrew(crew);
    setSelectedDate(day);
    setAssignDialogOpen(true);
  };

  if (loading && crewMembers.length === 0) {
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Crew Schedule</h3>
          </div>
          
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[180px] h-8">
              <Filter className="h-3 w-3 mr-2" />
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {allSkills.map(skill => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 border-b bg-muted/50">
              <div className="p-3 font-medium text-sm border-r">Crew Member</div>
              {days.map(day => (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "p-3 text-center border-r last:border-r-0",
                    isSameDay(day, new Date()) && "bg-primary/10"
                  )}
                >
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    "text-lg font-semibold",
                    isSameDay(day, new Date()) && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Crew Rows */}
            {filteredCrew.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No crew members found</p>
              </div>
            ) : (
              filteredCrew.map(crew => (
                <div key={crew.id} className="grid grid-cols-8 border-b last:border-b-0">
                  {/* Crew Info */}
                  <div className="p-3 border-r flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={crew.avatar_url} />
                      <AvatarFallback>{crew.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate flex items-center gap-1">
                        {crew.full_name}
                        {crew.rating && crew.rating >= 4.5 && (
                          <Star className="h-3 w-3 text-semantic-warning fill-semantic-warning" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {crew.skills?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {crew.phone && (
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            {crew.phone}
                          </DropdownMenuItem>
                        )}
                        {crew.email && (
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            {crew.email}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Day Cells */}
                  {days.map(day => {
                    const dayAssignments = getAssignmentsForCrewAndDay(crew.id, day);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <TooltipProvider key={day.toISOString()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleCellClick(crew, day)}
                              className={cn(
                                "h-full w-full p-1 border-r last:border-r-0 min-h-[60px] rounded-none transition-colors",
                                isToday && "bg-primary/5",
                                dayAssignments.length === 0 && "hover:bg-muted/50",
                                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                              )}
                            >
                              {dayAssignments.length === 0 ? (
                                <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <Plus className="h-4 w-4 text-muted-foreground" />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {dayAssignments.map(assignment => (
                                    <div
                                      key={assignment.id}
                                      className={cn(
                                        "text-xs p-1 rounded truncate text-white",
                                        statusColors(assignment.status)
                                      )}
                                    >
                                      <div className="font-medium truncate">
                                        {assignment.event?.name || assignment.role}
                                      </div>
                                      <div className="opacity-80">
                                        {format(new Date(assignment.shift_start), 'h:mma')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {dayAssignments.length === 0 ? (
                              <p>Click to assign {crew.full_name}</p>
                            ) : (
                              <div className="space-y-2">
                                {dayAssignments.map(a => (
                                  <div key={a.id}>
                                    <p className="font-medium">{a.event?.name || 'Assignment'}</p>
                                    <p className="text-xs">{a.role}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(a.shift_start), 'h:mm a')} - {format(new Date(a.shift_end), 'h:mm a')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {['confirmed', 'pending', 'invited', 'checked_in', 'declined'].map((status) => (
          <div key={status} className="flex items-center gap-1">
            <div className={cn("w-3 h-3 rounded", statusColors(status))} />
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        crewMember={selectedCrew}
        date={selectedDate}
        eventId={eventId}
        advanceId={advanceId}
        onSuccess={() => {
          fetchData();
          setAssignDialogOpen(false);
        }}
      />
    </div>
  );
}

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewMember: CrewMember | null;
  date: Date | null;
  eventId?: string;
  advanceId?: string;
  onSuccess: () => void;
}

function AssignmentDialog({
  open,
  onOpenChange,
  crewMember,
  date,
  eventId,
  advanceId,
  onSuccess,
}: AssignmentDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crewMember || !date || !role) return;
    
    setSubmitting(true);
    
    try {
      const shiftStart = new Date(date);
      const [startHour, startMin] = startTime.split(':').map(Number);
      shiftStart.setHours(startHour, startMin, 0, 0);
      
      const shiftEnd = new Date(date);
      const [endHour, endMin] = endTime.split(':').map(Number);
      shiftEnd.setHours(endHour, endMin, 0, 0);
      
      const res = await fetch('/api/advancing/crew/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewMemberId: crewMember.id,
          eventId,
          advanceId,
          role,
          department: department || undefined,
          shiftStart: shiftStart.toISOString(),
          shiftEnd: shiftEnd.toISOString(),
          notes: notes || undefined,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        if (error.conflicts) {
          toast({
            title: 'Scheduling Conflict',
            description: `${crewMember.full_name} already has assignments during this time.`,
            variant: 'destructive',
          });
          return;
        }
        throw new Error(extractApiErrorMessage(error, 'Failed to create assignment'));
      }
      
      toast({
        title: 'Assignment Created',
        description: `${crewMember.full_name} assigned as ${role}.`,
      });
      
      onSuccess();
      
      // Reset form
      setRole('');
      setDepartment('');
      setStartTime('09:00');
      setEndTime('18:00');
      setNotes('');
    } catch (error) {
      captureError(error, 'crewScheduler.createAssignment');
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to create assignment.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign {crewMember?.full_name}
            {date && ` - ${format(date, 'EEEE, MMM d')}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          
          {crewMember?.hourly_rate && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Estimated Hours:</span>
                <span className="font-medium">
                  {(() => {
                    const [sh, sm] = startTime.split(':').map(Number);
                    const [eh, em] = endTime.split(':').map(Number);
                    const hours = (eh + em/60) - (sh + sm/60);
                    return hours > 0 ? hours.toFixed(1) : '0';
                  })()}h
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rate:</span>
                <span className="font-medium">${crewMember.hourly_rate}/hr</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!role || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Assign
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
