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

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  module: string;
  details: string;
}

const mockEntries: AuditEntry[] = [
  { id: '1', timestamp: '2026-02-11 08:32:14', actor: 'Julian C.', action: 'Updated', entity: 'Project: Summer Festival 2026', module: 'Productions', details: 'Changed phase from Pre-Production to Load-In' },
  { id: '2', timestamp: '2026-02-11 08:28:01', actor: 'Sarah M.', action: 'Created', entity: 'Invoice #INV-2026-0042', module: 'Finance', details: 'New invoice for Acme Corp — $24,500.00' },
  { id: '3', timestamp: '2026-02-11 08:15:33', actor: 'Mike R.', action: 'Approved', entity: 'Budget: Q1 Corporate Tour', module: 'Finance', details: 'Budget approved — total $185,000' },
  { id: '4', timestamp: '2026-02-11 07:58:22', actor: 'Julian C.', action: 'Assigned', entity: 'Task: Finalize vendor contracts', module: 'Projects', details: 'Assigned to Sarah M.' },
  { id: '5', timestamp: '2026-02-11 07:45:10', actor: 'System', action: 'Triggered', entity: 'Automation: Invoice Reminder', module: 'System', details: 'Sent 3 payment reminders for overdue invoices' },
  { id: '6', timestamp: '2026-02-10 18:22:45', actor: 'Alex K.', action: 'Deleted', entity: 'Contact: John Doe (Draft)', module: 'Business', details: 'Permanently deleted draft contact record' },
  { id: '7', timestamp: '2026-02-10 17:14:30', actor: 'Sarah M.', action: 'Exported', entity: 'Report: Revenue by Client', module: 'Analytics', details: 'Exported as PDF — 12 pages' },
  { id: '8', timestamp: '2026-02-10 16:55:18', actor: 'Mike R.', action: 'Checked Out', entity: 'Asset: QSC K12.2 (x4)', module: 'Assets', details: 'Checked out for Project: Brand Launch' },
  { id: '9', timestamp: '2026-02-10 15:30:00', actor: 'Julian C.', action: 'Updated', entity: 'Organization Settings', module: 'Admin', details: 'Changed default currency to USD' },
  { id: '10', timestamp: '2026-02-10 14:12:44', actor: 'System', action: 'Synced', entity: 'Integration: QuickBooks', module: 'System', details: 'Synced 14 invoices and 8 payments' },
];

const actionColors: Record<string, string> = {
  Created: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Updated: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  Deleted: 'bg-destructive/10 text-destructive',
  Approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Assigned: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  Exported: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  Triggered: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Synced: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  'Checked Out': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
};

export default function AuditLogPage() {
  const [search, setSearch] = React.useState('');
  const [moduleFilter, setModuleFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');

  const filtered = mockEntries.filter((e) => {
    const matchesSearch = !search ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.entity.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || e.module === moduleFilter;
    const matchesAction = actionFilter === 'all' || e.action === actionFilter;
    return matchesSearch && matchesModule && matchesAction;
  });

  const modules = Array.from(new Set(mockEntries.map((e) => e.module)));
  const actions = Array.from(new Set(mockEntries.map((e) => e.action)));

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Audit Log
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete record of all actions across the platform
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Log
          </Button>
        </div>
      </header>

      <div className="px-6 py-3 border-b flex items-center gap-3">
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

      <div className="flex-1 overflow-y-auto">
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
    </div>
  );
}
