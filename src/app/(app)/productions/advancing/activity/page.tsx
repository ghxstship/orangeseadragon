'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { captureError } from '@/lib/observability';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserPlus,
  Truck,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_label: string;
  action: string;
  actor_name: string;
  actor_id?: string;
  description: string;
  field_changes?: Array<{ field: string; from: string; to: string }>;
  created_at: string;
  advance_code?: string;
}

const actionIcons: Record<string, React.ElementType> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  approved: CheckCircle2,
  rejected: XCircle,
  status_changed: ArrowRight,
  assigned: UserPlus,
  shipped: Truck,
  fulfilled: ShieldCheck,
};

const actionColors: Record<string, string> = {
  created: 'bg-primary/10 text-primary',
  updated: 'bg-muted text-muted-foreground',
  deleted: 'bg-destructive/10 text-destructive',
  approved: 'bg-semantic-success/10 text-semantic-success',
  rejected: 'bg-destructive/10 text-destructive',
  status_changed: 'bg-primary/10 text-primary',
  assigned: 'bg-primary/10 text-primary',
  shipped: 'bg-semantic-info/10 text-semantic-info',
  fulfilled: 'bg-semantic-success/10 text-semantic-success',
};

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (actionFilter !== 'all') params.set('action', actionFilter);

      const res = await fetch(`/api/advancing/activity?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data || data.records || []);
      }
    } catch (error) {
      captureError(error, 'advancing.activity.fetch');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, actionFilter]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const grouped = events.reduce<Record<string, ActivityEvent[]>>((acc, event) => {
    const dateKey = new Date(event.created_at).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  return (
    <PageShell
      title="Activity"
      description="Full advance lifecycle audit trail & event log"
      icon={<Activity className="h-6 w-6" />}
      actions={
        <Button variant="ghost" size="icon" onClick={fetchActivity}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      }
      underHeader={
        <div className="py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="status_changed">Status Changed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      contentClassName="space-y-4"
    >

        {/* Timeline */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : events.length === 0 ? (
          <ContextualEmptyState
            type="no-data"
            icon={Activity}
            title="No activity recorded"
            description="Actions on advances will appear here as they happen."
          />
        ) : (
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-8">
              {Object.entries(grouped).map(([date, dayEvents]) => (
                <div key={date}>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3 sticky top-0 bg-background py-1">
                    {date}
                  </h3>
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                      const Icon = actionIcons[event.action] || Activity;
                      const colorClass = actionColors[event.action] || 'bg-muted text-muted-foreground';

                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 py-3 px-3 rounded-lg hover:bg-accent/30 transition-colors"
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{event.actor_name}</span>
                              {' '}
                              <span className="text-muted-foreground">{event.description}</span>
                            </p>

                            {event.advance_code && (
                              <Badge variant="outline" className="text-[10px] mt-1">
                                {event.advance_code}
                              </Badge>
                            )}

                            {event.field_changes && event.field_changes.length > 0 && (
                              <div className="mt-1.5 space-y-1">
                                {event.field_changes.map((change, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="font-medium">{change.field}:</span>
                                    <Badge variant="outline" className="text-[10px] px-1">
                                      {change.from || 'empty'}
                                    </Badge>
                                    <ArrowRight className="h-3 w-3" />
                                    <Badge variant="secondary" className="text-[10px] px-1">
                                      {change.to || 'empty'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
    </PageShell>
  );
}
