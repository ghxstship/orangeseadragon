'use client';

import { PageHeader } from "@/components/common/page-header";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Show {
  id: string;
  title: string;
  status: 'setup' | 'live' | 'strike';
  venue: string;
  date: string;
  attendees: number;
  crewCount: number;
  image?: string;
}

const mockShows: Show[] = [
  {
    id: '1',
    title: 'Neon Nights Festival',
    status: 'live',
    venue: 'Main Arena',
    date: 'Today, 20:00',
    attendees: 15000,
    crewCount: 142
  },
  {
    id: '2',
    title: 'Tech Summit 2026',
    status: 'setup',
    venue: 'Convention Center',
    date: 'Tomorrow, 09:00',
    attendees: 2500,
    crewCount: 45
  },
  {
    id: '3',
    title: 'Corporate Galas',
    status: 'strike',
    venue: 'Grand Ballroom',
    date: 'Yesterday',
    attendees: 500,
    crewCount: 28
  }
];

export default function ShowsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      <PageHeader
        title="Shows"
        description="Manage productions, stages, and events"
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-600/20">
            <Plus className="h-4 w-4" />
            New Show
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockShows.map((show, index) => (
          <motion.div
            key={show.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              {/* Status Bar */}
              <div className={cn(
                "h-1 w-full",
                show.status === 'live' ? "bg-emerald-500 shadow-[0_0_10px_currentColor]" :
                  show.status === 'setup' ? "bg-blue-500" :
                    "bg-neutral-600"
              )} />

              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Badge variant="outline" className={cn(
                      "uppercase text-[10px] tracking-wider font-bold border-0 px-2 py-0.5",
                      show.status === 'live' ? "bg-emerald-500/20 text-emerald-400 animate-pulse" :
                        show.status === 'setup' ? "bg-blue-500/20 text-blue-400" :
                          "bg-neutral-700/50 text-neutral-400"
                    )}>
                      {show.status}
                    </Badge>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {show.title}
                    </h3>
                  </div>
                  <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="h-4 w-4 text-neutral-400" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    {show.venue}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    {show.date}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Pax</p>
                      <p className="text-sm font-semibold text-white">{show.attendees.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Crew</p>
                      <p className="text-sm font-semibold text-white">{show.crewCount}</p>
                    </div>
                  </div>

                  <Button size="sm" className="gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10">
                    Dashboard <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
