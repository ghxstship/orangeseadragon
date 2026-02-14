'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  FileEdit,
  Plus,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';

interface ActivityEntry {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'exported' | 'imported' | 'approved' | 'submitted';
  module: string;
  entity: string;
  entityName: string;
  timestamp: string;
  details?: string;
}

const ACTION_MAP: Record<string, ActivityEntry['action']> = {
  insert: 'created',
  create: 'created',
  created: 'created',
  update: 'updated',
  updated: 'updated',
  delete: 'deleted',
  deleted: 'deleted',
  approved: 'approved',
  exported: 'exported',
  imported: 'imported',
  submitted: 'submitted',
  viewed: 'viewed',
};

const actionConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  created: { icon: Plus, color: 'text-semantic-success', label: 'Created' },
  updated: { icon: FileEdit, color: 'text-semantic-info', label: 'Updated' },
  deleted: { icon: Trash2, color: 'text-destructive', label: 'Deleted' },
  viewed: { icon: Eye, color: 'text-muted-foreground', label: 'Viewed' },
  exported: { icon: Download, color: 'text-semantic-purple', label: 'Exported' },
  imported: { icon: Upload, color: 'text-semantic-warning', label: 'Imported' },
  approved: { icon: CheckCircle, color: 'text-semantic-success', label: 'Approved' },
  submitted: { icon: Clock, color: 'text-semantic-info', label: 'Submitted' },
};

function useMyActivity(userId: string | null, orgId: string | null) {
  const [activities, setActivities] = React.useState<ActivityEntry[]>([]);

  React.useEffect(() => {
    if (!userId || !orgId) return;
    const supabase = createClient();

    const fetchData = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, entity_type, entity_id, created_at, new_values')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const mapped: ActivityEntry[] = (data ?? []).map((row) => {
        const actionKey = row.action.toLowerCase();
        const action = ACTION_MAP[actionKey] ?? 'updated';
        const entityType = row.entity_type.replace(/_/g, ' ');
        const modName = row.entity_type.split('_')[0] ?? '';
        const moduleLabel = modName.charAt(0).toUpperCase() + modName.slice(1);
        const details = row.new_values
          ? (typeof row.new_values === 'object' ? `Changed: ${Object.keys(row.new_values as Record<string, unknown>).join(', ')}` : '')
          : undefined;
        return {
          id: row.id,
          action,
          module: moduleLabel,
          entity: entityType,
          entityName: row.entity_id.slice(0, 8),
          timestamp: row.created_at ?? '',
          details: details || undefined,
        };
      });

      setActivities(mapped);
    };

    fetchData();
  }, [userId, orgId]);

  return activities;
}

export default function HistoryPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const userId = user?.id || null;
  const activities = useMyActivity(userId, orgId);
  const [search, setSearch] = React.useState('');
  const [moduleFilter, setModuleFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');

  const filtered = React.useMemo(() => {
    return activities.filter((a) => {
      if (moduleFilter !== 'all' && a.module !== moduleFilter) return false;
      if (actionFilter !== 'all' && a.action !== actionFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.entityName.toLowerCase().includes(q) || a.module.toLowerCase().includes(q) || (a.details?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [search, moduleFilter, actionFilter, activities]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">My Activity History</h1>
        <p className="text-sm text-muted-foreground mt-1">All actions you&apos;ve taken across all modules</p>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              <SelectItem value="Core">Core</SelectItem>
              <SelectItem value="Productions">Productions</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="People">People</SelectItem>
              <SelectItem value="Assets">Assets</SelectItem>
              <SelectItem value="Analytics">Analytics</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="exported">Exported</SelectItem>
              <SelectItem value="imported">Imported</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
          {(search || moduleFilter !== 'all' || actionFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setModuleFilter('all'); setActionFilter('all'); }}>
              Clear
            </Button>
          )}
        </div>

        {/* Activity List */}
        <Card>
          <CardContent className="p-0 divide-y">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity matches your filters</p>
              </div>
            ) : (
              filtered.map((entry) => {
                const config = actionConfig[entry.action];
                const Icon = config.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className={cn("mt-0.5 p-1.5 rounded-md bg-muted", config.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">{entry.module}</Badge>
                      </div>
                      <p className="text-sm font-medium mt-0.5">
                        {config.label} <span className="text-muted-foreground">{entry.entity}</span>{' '}
                        <span className="text-primary">{entry.entityName}</span>
                      </p>
                      {entry.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
