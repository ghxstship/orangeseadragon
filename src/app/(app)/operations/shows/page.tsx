'use client';

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Show {
  id: string;
  title: string;
  status: 'setup' | 'live' | 'strike';
  venue: string;
  date: string;
  attendees: number;
  crewCount: number;
}

const mockShows: Show[] = [
  { id: '1', title: 'Neon Nights Festival', status: 'live', venue: 'Main Arena', date: 'Today, 20:00', attendees: 15000, crewCount: 142 },
  { id: '2', title: 'Tech Summit 2026', status: 'setup', venue: 'Convention Center', date: 'Tomorrow, 09:00', attendees: 2500, crewCount: 45 },
  { id: '3', title: 'Corporate Galas', status: 'strike', venue: 'Grand Ballroom', date: 'Yesterday', attendees: 500, crewCount: 28 },
];

const statusBar: Record<string, string> = {
  live: "bg-primary",
  setup: "bg-muted-foreground",
  strike: "bg-border",
};

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  live: 'default',
  setup: 'secondary',
  strike: 'outline',
};

export default function ShowsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shows</h1>
            <p className="text-muted-foreground">Manage productions, stages, and events</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Show
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockShows.map((show, index) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden hover:bg-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={cn("h-1 w-full", statusBar[show.status])} />

                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Badge variant={statusBadgeVariant[show.status]} className="uppercase text-[10px] tracking-wider font-bold">
                        {show.status}
                      </Badge>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {show.title}
                      </h3>
                    </div>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {show.venue}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {show.date}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Pax</p>
                        <p className="text-sm font-semibold">{show.attendees.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Crew</p>
                        <p className="text-sm font-semibold">{show.crewCount}</p>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="gap-2">
                      Dashboard <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
