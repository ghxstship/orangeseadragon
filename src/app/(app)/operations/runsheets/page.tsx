'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/common/page-header';
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
  {
    id: '1',
    title: 'Main Stage: Opening Keynote',
    status: 'live',
    startTime: '09:00 AM',
    duration: '1h 30m',
    totalCues: 24,
    currentCue: 'Intro Video Playback',
    location: 'Grand Ballroom',
    date: 'Today'
  },
  {
    id: '2',
    title: 'Breakout A: Tech Directions',
    status: 'published',
    startTime: '11:00 AM',
    duration: '45m',
    totalCues: 12,
    currentCue: '-',
    location: 'Room 302',
    date: 'Today'
  },
  {
    id: '3',
    title: 'Morning Briefing',
    status: 'completed',
    startTime: '07:30 AM',
    duration: '30m',
    totalCues: 8,
    currentCue: 'End of session',
    location: 'Staff Room',
    date: 'Today'
  },
  {
    id: '4',
    title: 'Evening Gala - Main Program',
    status: 'draft',
    startTime: '07:00 PM',
    duration: '3h 00m',
    totalCues: 45,
    currentCue: '-',
    location: 'Grand Ballroom',
    date: 'Tomorrow'
  }
];

export default function RunsheetsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      <PageHeader
        title="Runsheets"
        description="Manage live show flows and cue sheets with automatic time calculations"
        actions={
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 gap-2">
            <Plus className="h-4 w-4" />
            Create Runsheet
          </Button>
        }
      />

      <div className="grid gap-4">
        {mockRunsheets.map((sheet, index) => (
          <motion.div
            key={sheet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "p-6 flex items-center justify-between group transition-all duration-300 border-white/5",
              sheet.status === 'live'
                ? "bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                : "bg-white/5 hover:bg-white/10"
            )}>
              <div className="flex items-center gap-6">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center border",
                  sheet.status === 'live'
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : sheet.status === 'completed'
                      ? "bg-white/5 border-white/10 text-neutral-400"
                      : sheet.status === 'draft'
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                )}>
                  {sheet.status === 'live' ? <Play className="h-5 w-5 fill-current" /> :
                    sheet.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> :
                      <Clock className="h-5 w-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/operations/runsheets/${sheet.id}`}
                      className="font-semibold text-lg text-white group-hover:text-amber-400 transition-colors"
                    >
                      {sheet.title}
                    </Link>
                    <Badge variant="outline" className={cn(
                      "uppercase text-[10px] tracking-wider font-bold border-0 px-2 py-0.5",
                      sheet.status === 'live' ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse" :
                        sheet.status === 'published' ? "bg-blue-500/20 text-blue-400" :
                          sheet.status === 'draft' ? "bg-amber-500/20 text-amber-400" :
                            "bg-white/10 text-neutral-400"
                    )}>
                      {sheet.status === 'live' ? '🔴 LIVE' : sheet.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {sheet.date}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-neutral-700" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {sheet.startTime} ({sheet.duration})
                    </div>
                    <div className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span>{sheet.totalCues} cues</span>
                    <div className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span>{sheet.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {sheet.status === 'live' && (
                  <div className="text-right mr-4">
                    <p className="text-xs text-emerald-400/70 font-medium uppercase tracking-wider mb-1">Current Cue</p>
                    <p className="font-medium text-emerald-300 animate-pulse">{sheet.currentCue}</p>
                  </div>
                )}

                {(sheet.status === 'live' || sheet.status === 'published') && (
                  <Link href={`/operations/runsheets/${sheet.id}/show-mode`}>
                    <Button 
                      size="sm" 
                      variant={sheet.status === 'live' ? 'default' : 'outline'}
                      className={cn(
                        "gap-2",
                        sheet.status === 'live' 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "border-white/20 hover:bg-white/10"
                      )}
                    >
                      <Maximize2 className="h-4 w-4" />
                      Show Mode
                    </Button>
                  </Link>
                )}

                <Link href={`/operations/runsheets/${sheet.id}`}>
                  <ChevronRight className="h-5 w-5 text-neutral-600 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
