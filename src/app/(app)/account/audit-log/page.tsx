'use client';

import * as React from 'react';
import {
  Shield,
  Search,
  Download,
  Filter,
  User,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SEMANTIC_BADGE_CLASSES } from '@/lib/tokens/semantic-colors';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';
import { PageShell } from '@/components/common/page-shell';

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  module: string;
  details: string;
}

const actionColors: Record<string, string> = {
  created: SEMANTIC_BADGE_CLASSES.success,
  updated: SEMANTIC_BADGE_CLASSES.info,
  deleted: SEMANTIC_BADGE_CLASSES.danger,
  approved: SEMANTIC_BADGE_CLASSES.success,
  assigned: SEMANTIC_BADGE_CLASSES.purple,
  exported: SEMANTIC_BADGE_CLASSES.orange,
  triggered: SEMANTIC_BADGE_CLASSES.warning,
  synced: SEMANTIC_BADGE_CLASSES.cyan,
  insert: SEMANTIC_BADGE_CLASSES.success,
  update: SEMANTIC_BADGE_CLASSES.info,
  delete: SEMANTIC_BADGE_CLASSES.danger,
};

function useAuditLog(orgId: string | null) {
  const [entries, setEntries] = React.useState<AuditEntry[]>([]);

  React.useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();

    const fetchData = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, entity_type, entity_id, created_at, user_id, new_values')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Fetch user names for actors
      const userIds = Array.from(new Set((data ?? []).map(d => d.user_id).filter(Boolean))) as string[];
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', userIds)
        : { data: [] };
      const userMap = new Map((users ?? []).map(u => [u.id, u.full_name ?? 'Unknown']));

      const mapped: AuditEntry[] = (data ?? []).map((row) => {
        const ts = row.created_at ? new Date(row.created_at).toLocaleString() : '';
        const actionLabel = row.action.charAt(0).toUpperCase() + row.action.slice(1);
        const entityLabel = row.entity_type.replace(/_/g, ' ');
        const details = row.new_values
          ? (typeof row.new_values === 'object' ? Object.keys(row.new_values as Record<string, unknown>).join(', ') : '')
          : '';
        return {
          id: row.id,
          timestamp: ts,
          actor: row.user_id ? (userMap.get(row.user_id) ?? 'Unknown') : 'System',
          action: actionLabel,
          entity: `${entityLabel}: ${row.entity_id.slice(0, 8)}`,
          module: row.entity_type.split('_')[0] ?? '',
          details: details ? `Changed: ${details}` : '',
        };
      });

      setEntries(mapped);
    };

    fetchData();
  }, [orgId]);

  return entries;
}

export default function AuditLogPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const allEntries = useAuditLog(orgId);
  const [search, setSearch] = React.useState('');
  const [moduleFilter, setModuleFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');

  const filtered = allEntries.filter((e) => {
    const matchesSearch = !search ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.entity.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || e.module === moduleFilter;
    const matchesAction = actionFilter === 'all' || e.action.toLowerCase() === actionFilter.toLowerCase();
    return matchesSearch && matchesModule && matchesAction;
  });

  const modules = Array.from(new Set(allEntries.map((e) => e.module)));
  const actions = Array.from(new Set(allEntries.map((e) => e.action)));

  return (
    <PageShell
      title="Audit Log"
      description="Complete record of all actions across the platform"
      icon={<Shield className="h-6 w-6" />}
      actions={
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button>
      }
      underHeader={
        <div className="py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search actors, entities, details..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-3 w-3" />
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      }
      contentPadding={false}
    >
      <div>
        <div className="divide-y">
          {filtered.map((entry) => (
            <div key={entry.id} className="px-6 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 w-40 shrink-0">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">{entry.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 w-28 shrink-0">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{entry.actor}</span>
                </div>
                <Badge className={`text-[10px] shrink-0 ${actionColors[entry.action] || ''}`} variant="secondary">
                  {entry.action}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{entry.entity}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{entry.details}</p>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0">{entry.module}</Badge>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No audit entries match your filters</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
