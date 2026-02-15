'use client';

import Link from 'next/link';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/common/page-shell";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { Play, Clock, Calendar, ChevronRight, CheckCircle2, Maximize2, Plus } from "lucide-react";
import { useUser } from "@/hooks/use-supabase";
import { useRunsheets } from "@/hooks/use-runsheets";

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

function mapRunsheetStatus(status: string | null): RunSheet['status'] {
  if (status === 'live') return 'live';
  if (status === 'published') return 'published';
  if (status === 'completed') return 'completed';
  return 'draft';
}

function formatRunsheetDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sheetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (sheetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RunsheetsPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const { data: rawRunsheets } = useRunsheets(orgId);

  const runsheets: RunSheet[] = (rawRunsheets ?? []).map((r) => ({
    id: r.id,
    title: r.name,
    status: mapRunsheetStatus(r.status),
    startTime: '',
    duration: '',
    totalCues: 0,
    currentCue: '-',
    location: '',
    date: formatRunsheetDate(r.date),
  }));

  return (
    <PageShell
      title="Runsheets"
      description="Manage live show flows and cue sheets"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Runsheet
        </Button>
      }
    >
      {runsheets.length === 0 ? (
        <ContextualEmptyState
          type="no-data"
          title="No runsheets yet"
          description="Create a runsheet to organize cues and show flow."
        />
      ) : (
        <div className="grid gap-4">
          {runsheets.map((sheet, index) => {
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
      )}
    </PageShell>
  );
}
