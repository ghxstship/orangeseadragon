'use client';

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/common/page-shell";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { useUser } from "@/hooks/use-supabase";
import { useEvents } from "@/hooks/use-events";

interface Show {
  id: string;
  title: string;
  status: 'setup' | 'live' | 'strike';
  venue: string;
  date: string;
  attendees: number;
  crewCount: number;
}

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

function mapEventStatus(status: string | null): Show['status'] {
  if (status === 'in_progress' || status === 'active') return 'live';
  if (status === 'completed' || status === 'cancelled') return 'strike';
  return 'setup';
}

function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Tomorrow, ${time}`;
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ShowsPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const { data: rawEvents } = useEvents(orgId);

  const shows: Show[] = (rawEvents ?? []).map((e) => ({
    id: e.id,
    title: e.name,
    status: mapEventStatus(e.status),
    venue: '',
    date: formatEventDate(e.start_date),
    attendees: e.expected_attendance ?? 0,
    crewCount: 0,
  }));

  return (
    <PageShell
      title="Shows"
      description="Manage productions, stages, and events"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Show
        </Button>
      }
    >
      {shows.length === 0 ? (
        <ContextualEmptyState
          type="no-data"
          title="No shows found"
          description="Create a show to start managing production events."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shows.map((show, index) => (
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
      )}
    </PageShell>
  );
}
