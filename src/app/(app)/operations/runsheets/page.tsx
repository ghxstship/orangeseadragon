'use client';

import Link from 'next/link';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Calendar, ChevronRight, CheckCircle2, Maximize2, Plus } from "lucide-react";

interface RunSheet {
  id: string;
  title: string;
  status: 'live' | 'published' | 'draft' | 'completed';
  startTime: string;
  duration: string;
  totalCues: number;
  currentCue: string;
  location: string;
  date: string;
}

const mockRunsheets: RunSheet[] = [
  { id: '1', title: 'Main Stage: Opening Keynote', status: 'live', startTime: '09:00 AM', duration: '1h 30m', totalCues: 24, currentCue: 'Intro Video Playback', location: 'Grand Ballroom', date: 'Today' },
  { id: '2', title: 'Breakout A: Tech Directions', status: 'published', startTime: '11:00 AM', duration: '45m', totalCues: 12, currentCue: '-', location: 'Room 302', date: 'Today' },
  { id: '3', title: 'Morning Briefing', status: 'completed', startTime: '07:30 AM', duration: '30m', totalCues: 8, currentCue: 'End of session', location: 'Staff Room', date: 'Today' },
  { id: '4', title: 'Evening Gala - Main Program', status: 'draft', startTime: '07:00 PM', duration: '3h 00m', totalCues: 45, currentCue: '-', location: 'Grand Ballroom', date: 'Tomorrow' },
];

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  live: 'destructive',
  published: 'default',
  draft: 'secondary',
  completed: 'outline',
};

const statusIcon: Record<string, React.ElementType> = {
  live: Play,
  published: Clock,
  draft: Clock,
  completed: CheckCircle2,
};

export default function RunsheetsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Runsheets</h1>
            <p className="text-muted-foreground">Manage live show flows and cue sheets</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Runsheet
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4">
          {mockRunsheets.map((sheet, index) => {
            const StatusIcon = statusIcon[sheet.status];
            return (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "p-6 flex items-center justify-between group transition-all duration-300",
                  sheet.status === 'live' && "border-primary/30",
                )}>
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center border bg-muted/50 text-muted-foreground",
                      sheet.status === 'live' && "bg-primary/10 border-primary/30 text-primary",
                    )}>
                      <StatusIcon className={cn("h-5 w-5", sheet.status === 'live' && "fill-current")} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/operations/runsheets/${sheet.id}`}
                          className="font-semibold text-lg group-hover:text-primary transition-colors"
                        >
                          {sheet.title}
                        </Link>
                        <Badge variant={statusBadgeVariant[sheet.status]} className="uppercase text-[10px] tracking-wider font-bold">
                          {sheet.status === 'live' ? 'LIVE' : sheet.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {sheet.date}
                        </div>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {sheet.startTime} ({sheet.duration})
                        </div>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{sheet.totalCues} cues</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{sheet.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {sheet.status === 'live' && (
                      <div className="text-right mr-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Current Cue</p>
                        <p className="font-medium text-primary animate-pulse">{sheet.currentCue}</p>
                      </div>
                    )}

                    {(sheet.status === 'live' || sheet.status === 'published') && (
                      <Link href={`/operations/runsheets/${sheet.id}/show-mode`}>
                        <Button
                          size="sm"
                          variant={sheet.status === 'live' ? 'default' : 'outline'}
                          className="gap-2"
                        >
                          <Maximize2 className="h-4 w-4" />
                          Show Mode
                        </Button>
                      </Link>
                    )}

                    <Link href={`/operations/runsheets/${sheet.id}`}>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
