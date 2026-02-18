'use client';

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/common/page-shell";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { useUser } from "@/hooks/auth/use-supabase";
import { useIncidents } from "@/hooks/data/people/use-incidents";

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'investigating' | 'resolved';
  time: string;
  location: string;
  reporter: string;
}

const severityIndicator: Record<string, string> = {
  critical: "bg-destructive animate-pulse",
  major: "bg-warning",
  minor: "bg-primary",
};

const statusBadgeVariant: Record<string, 'destructive' | 'warning' | 'default'> = {
  open: 'destructive',
  investigating: 'warning',
  resolved: 'default',
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function IncidentsPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const { data: rawIncidents } = useIncidents(orgId);

  const incidents: Incident[] = (rawIncidents ?? []).map((i) => ({
    id: i.id,
    title: i.title,
    severity: (i.severity as Incident['severity']) ?? 'minor',
    status: (i.status as Incident['status']) ?? 'open',
    time: formatTimeAgo(i.occurred_at),
    location: '',
    reporter: i.reported_by_name ?? 'Unknown',
  }));

  return (
    <PageShell
      title="Incident Log"
      description="Track and resolve operational issues"
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="destructive" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Log Incident
          </Button>
        </div>
      }
    >
      {incidents.length === 0 ? (
        <ContextualEmptyState
          type="no-data"
          title="No incidents logged"
          description="Operational incidents will appear here once they are reported."
        />
      ) : (
        <div className="grid gap-4">
          {incidents.map((incident, index) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "p-4 group transition-all duration-300",
                incident.status === 'open' && "border-destructive/30",
                incident.status === 'investigating' && "border-warning/30",
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      severityIndicator[incident.severity]
                    )} />

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {incident.title}
                        </h3>
                        <Badge variant={statusBadgeVariant[incident.status]} className="uppercase text-[10px] tracking-wider font-bold">
                          {incident.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {incident.time}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{incident.location}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>by {incident.reporter}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {incident.status !== 'resolved' && (
                      <Button size="sm" variant="ghost" className="text-xs">
                        Update Status
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
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
