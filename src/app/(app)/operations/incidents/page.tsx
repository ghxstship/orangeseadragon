'use client';

import { PageHeader } from "@/components/common/page-header";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'investigating' | 'resolved';
  time: string;
  location: string;
  reporter: string;
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Power Failure: Stage Left Audio',
    severity: 'critical',
    status: 'open',
    time: '2 mins ago',
    location: 'Main Stage',
    reporter: 'Mike T.'
  },
  {
    id: '2',
    title: 'Spill cleanup needed',
    severity: 'minor',
    status: 'resolved',
    time: '1 hour ago',
    location: 'Lobby Bar',
    reporter: 'Sarah J.'
  },
  {
    id: '3',
    title: 'Projector overheating warning',
    severity: 'major',
    status: 'investigating',
    time: '15 mins ago',
    location: 'Breakout Room B',
    reporter: 'Dave C.'
  }
];

export default function IncidentsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      <PageHeader
        title="Incident Log"
        description="Track and resolve operational issues"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="bg-rose-500 hover:bg-rose-600 text-white gap-2 shadow-lg shadow-rose-500/20">
              <AlertCircle className="h-4 w-4" />
              Log Incident
            </Button>
          </div>
        }
      />

      <div className="grid gap-4">
        {mockIncidents.map((incident, index) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "p-4 group transition-all duration-300 border-white/5",
              incident.status === 'open'
                ? "bg-gradient-to-r from-rose-500/10 to-transparent border-rose-500/20 shadow-lg shadow-rose-500/5"
                : incident.status === 'investigating'
                  ? "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20 shadow-lg shadow-amber-500/5"
                  : "bg-white/5 hover:bg-white/10"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]",
                    incident.severity === 'critical' ? "bg-rose-500 text-rose-500 animate-pulse" :
                      incident.severity === 'major' ? "bg-amber-500 text-amber-500" :
                        "bg-blue-500 text-blue-500"
                  )} />

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white group-hover:text-rose-400 transition-colors">
                        {incident.title}
                      </h3>
                      <Badge variant="outline" className={cn(
                        "uppercase text-[10px] tracking-wider font-bold border-0 px-2 py-0.5",
                        incident.status === 'open' ? "bg-rose-500/20 text-rose-400" :
                          incident.status === 'investigating' ? "bg-amber-500/20 text-amber-400" :
                            "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {incident.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {incident.time}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      <span>{incident.location}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      <span>by {incident.reporter}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {incident.status !== 'resolved' && (
                    <Button size="sm" variant="ghost" className="text-xs hover:bg-white/10 hover:text-white text-neutral-400">
                      Update Status
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10">
                    <MoreHorizontal className="h-4 w-4" />
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
