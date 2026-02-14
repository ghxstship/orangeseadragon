'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WorkspaceLayout } from '@/lib/layouts';
import type { WorkspaceLayoutConfig } from '@/lib/layouts/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Printer,
  Plus,
  Trash2,
  Clock,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface RunSheetCue {
  id: string;
  time: string;
  endTime: string;
  item: string;
  department: string;
  responsible: string;
  location: string;
  notes: string;
  status: 'pending' | 'active' | 'done' | 'skipped';
}

const DEPARTMENTS = [
  { value: 'production', label: 'Production', color: 'bg-semantic-info' },
  { value: 'audio', label: 'Audio', color: 'bg-semantic-purple' },
  { value: 'lighting', label: 'Lighting', color: 'bg-semantic-warning' },
  { value: 'video', label: 'Video', color: 'bg-semantic-cyan' },
  { value: 'backline', label: 'Backline', color: 'bg-semantic-orange' },
  { value: 'catering', label: 'Catering', color: 'bg-semantic-success' },
  { value: 'foh', label: 'FOH', color: 'bg-semantic-accent' },
  { value: 'security', label: 'Security', color: 'bg-destructive' },
  { value: 'transport', label: 'Transport', color: 'bg-semantic-indigo' },
  { value: 'all', label: 'All Departments', color: 'bg-muted-foreground' },
];

// ─────────────────────────────────────────────────────────────
// RUN SHEET VIEW PAGE (Layout D)
// ─────────────────────────────────────────────────────────────

export default function RunSheetPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [currentTab, setCurrentTab] = React.useState('timeline');
  const [isLive, setIsLive] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState('');

  // ── Cues ──
  const [cues, setCues] = React.useState<RunSheetCue[]>([
    { id: '1', time: '06:00', endTime: '08:00', item: 'Load In', department: 'all', responsible: 'PM', location: 'Loading Dock', notes: 'Trucks arrive 05:45', status: 'pending' },
    { id: '2', time: '08:00', endTime: '10:00', item: 'Audio System Build', department: 'audio', responsible: 'Audio Lead', location: 'Stage', notes: 'PA + monitors', status: 'pending' },
    { id: '3', time: '08:00', endTime: '10:00', item: 'Lighting Rig', department: 'lighting', responsible: 'LD', location: 'Stage', notes: 'Focus after hang', status: 'pending' },
    { id: '4', time: '10:00', endTime: '10:30', item: 'Video Check', department: 'video', responsible: 'Video Dir', location: 'FOH', notes: 'IMAG + screens', status: 'pending' },
    { id: '5', time: '10:30', endTime: '12:00', item: 'Sound Check — Headliner', department: 'audio', responsible: 'Audio Lead', location: 'Stage', notes: '', status: 'pending' },
    { id: '6', time: '12:00', endTime: '13:00', item: 'Lunch Break', department: 'catering', responsible: 'Catering Lead', location: 'Green Room', notes: 'Crew meal for 40', status: 'pending' },
    { id: '7', time: '13:00', endTime: '14:00', item: 'Sound Check — Support', department: 'audio', responsible: 'Audio Lead', location: 'Stage', notes: '', status: 'pending' },
    { id: '8', time: '14:00', endTime: '15:00', item: 'Production Meeting', department: 'production', responsible: 'PM', location: 'Production Office', notes: 'All dept heads', status: 'pending' },
    { id: '9', time: '17:00', endTime: '17:00', item: 'Doors Open', department: 'foh', responsible: 'FOH Manager', location: 'Main Entrance', notes: '', status: 'pending' },
    { id: '10', time: '19:00', endTime: '19:45', item: 'Support Act', department: 'production', responsible: 'Stage Manager', location: 'Stage', notes: '45 min set', status: 'pending' },
    { id: '11', time: '20:00', endTime: '20:30', item: 'Changeover', department: 'all', responsible: 'Stage Manager', location: 'Stage', notes: '30 min', status: 'pending' },
    { id: '12', time: '20:30', endTime: '22:00', item: 'Headliner', department: 'production', responsible: 'Stage Manager', location: 'Stage', notes: '90 min set', status: 'pending' },
    { id: '13', time: '22:00', endTime: '22:30', item: 'Encore / Curfew', department: 'production', responsible: 'PM', location: 'Stage', notes: 'Hard curfew 22:30', status: 'pending' },
    { id: '14', time: '22:30', endTime: '01:00', item: 'Load Out', department: 'all', responsible: 'PM', location: 'Loading Dock', notes: '', status: 'pending' },
  ]);

  // ── Live Mode Timer ──
  React.useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const getDeptColor = (dept: string) => DEPARTMENTS.find(d => d.value === dept)?.color || 'bg-muted-foreground';
  const getDeptLabel = (dept: string) => DEPARTMENTS.find(d => d.value === dept)?.label || dept;

  const addCue = () => {
    setCues(prev => [...prev, {
      id: crypto.randomUUID(), time: '', endTime: '', item: '', department: 'production',
      responsible: '', location: '', notes: '', status: 'pending',
    }]);
  };

  const removeCue = (id: string) => setCues(prev => prev.filter(c => c.id !== id));

  const updateCue = (id: string, field: keyof RunSheetCue, value: string) => {
    setCues(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const advanceCue = (id: string) => {
    setCues(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (c.status === 'pending') return { ...c, status: 'active' };
      if (c.status === 'active') return { ...c, status: 'done' };
      return c;
    }));
  };

  const sortedCues = [...cues].sort((a, b) => a.time.localeCompare(b.time));

  // ── Workspace Config ──
  const workspaceConfig: WorkspaceLayoutConfig = {
    title: 'Run Sheet',
    subtitle: isLive ? `LIVE — ${currentTime}` : 'Edit Mode',
    tabs: [
      { key: 'timeline', label: 'Timeline' },
      { key: 'edit', label: 'Edit Cues' },
      { key: 'print', label: 'Print View' },
    ],
    defaultTab: 'timeline',
    header: { showBackButton: true },
    sidebar: { enabled: true, position: 'right', width: 260, defaultOpen: true },
  };

  // ── Sidebar ──
  const sidebarContent = (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Show Mode</h3>
        <Button
          className="w-full"
          variant={isLive ? 'destructive' : 'default'}
          size="sm"
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {isLive ? 'Stop Live Mode' : 'Go Live'}
        </Button>
        {isLive && (
          <p className="text-center text-2xl font-mono font-bold mt-3">{currentTime}</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Progress</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Cues</span>
            <span className="font-medium">{cues.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-medium text-semantic-success">{cues.filter(c => c.status === 'done').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active</span>
            <span className="font-medium text-semantic-info">{cues.filter(c => c.status === 'active').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-medium">{cues.filter(c => c.status === 'pending').length}</span>
          </div>
        </div>
        <Progress
          value={cues.length > 0 ? (cues.filter(c => c.status === 'done').length / cues.length) * 100 : 0}
          className="mt-2 h-2"
        />
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Departments</h3>
        <div className="space-y-1">
          {DEPARTMENTS.filter(d => cues.some(c => c.department === d.value)).map(dept => (
            <div key={dept.value} className="flex items-center gap-2 text-sm">
              <div className={cn('h-2.5 w-2.5 rounded-full', dept.color)} />
              <span>{dept.label}</span>
              <span className="ml-auto text-muted-foreground text-xs">{cues.filter(c => c.department === dept.value).length}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>
    </div>
  );

  // ── Tab Content ──
  const renderTabContent = () => {
    switch (currentTab) {
      case 'timeline':
        return (
          <div className="space-y-1">
            {sortedCues.map((cue) => {
              const deptColor = getDeptColor(cue.department);
              return (
                <div
                  key={cue.id}
                  className={cn(
                    'flex items-stretch gap-3 rounded-lg border p-3 transition-colors',
                    cue.status === 'active' && 'bg-primary/5 border-primary ring-1 ring-primary/20',
                    cue.status === 'done' && 'opacity-50',
                    cue.status === 'skipped' && 'opacity-30 line-through',
                  )}
                >
                  <div className={cn('w-1 rounded-full flex-shrink-0', deptColor)} />

                  <div className="flex-shrink-0 w-20 text-center">
                    <p className="font-mono text-lg font-bold">{cue.time}</p>
                    {cue.endTime && cue.endTime !== cue.time && (
                      <p className="font-mono text-xs text-muted-foreground">→ {cue.endTime}</p>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{cue.item}</span>
                      <Badge variant="outline" className="text-xs">{getDeptLabel(cue.department)}</Badge>
                      {cue.status === 'active' && <Badge className="text-xs bg-primary">NOW</Badge>}
                      {cue.status === 'done' && <Badge variant="secondary" className="text-xs">Done</Badge>}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 text-sm text-muted-foreground">
                      {cue.responsible && <span>{cue.responsible}</span>}
                      {cue.location && <span>📍 {cue.location}</span>}
                    </div>
                    {cue.notes && <p className="text-sm text-muted-foreground mt-1">{cue.notes}</p>}
                  </div>

                  {isLive && cue.status !== 'done' && cue.status !== 'skipped' && (
                    <div className="flex-shrink-0 flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => advanceCue(cue.id)}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'edit':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5" /> Cue List</h2>
              <Button size="sm" onClick={addCue}><Plus className="h-4 w-4 mr-1" /> Add Cue</Button>
            </div>
            <div className="space-y-2">
              {cues.map(cue => (
                <Card key={cue.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-[80px_80px_1fr_140px_140px_140px_40px] gap-2 items-center">
                      <Input type="time" value={cue.time} onChange={e => updateCue(cue.id, 'time', e.target.value)} className="h-8" />
                      <Input type="time" value={cue.endTime} onChange={e => updateCue(cue.id, 'endTime', e.target.value)} className="h-8" />
                      <Input value={cue.item} onChange={e => updateCue(cue.id, 'item', e.target.value)} placeholder="Cue item" className="h-8" />
                      <Select value={cue.department} onValueChange={v => updateCue(cue.id, 'department', v)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input value={cue.responsible} onChange={e => updateCue(cue.id, 'responsible', e.target.value)} placeholder="Responsible" className="h-8" />
                      <Input value={cue.location} onChange={e => updateCue(cue.id, 'location', e.target.value)} placeholder="Location" className="h-8" />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCue(cue.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Input value={cue.notes} onChange={e => updateCue(cue.id, 'notes', e.target.value)} placeholder="Notes..." className="h-7 text-xs" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'print':
        return (
          <div className="max-w-4xl mx-auto bg-white dark:bg-card rounded-lg border shadow-sm p-8 space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">RUN SHEET</h1>
              <p className="text-muted-foreground">Project {projectId.slice(0, 8)}…</p>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-[70px_70px_1fr_120px_120px_120px] gap-3 p-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
                <span>Start</span><span>End</span><span>Item</span><span>Department</span><span>Responsible</span><span>Location</span>
              </div>
              {sortedCues.map(cue => (
                <div key={cue.id} className="grid grid-cols-[70px_70px_1fr_120px_120px_120px] gap-3 p-2 border-t text-sm items-center">
                  <span className="font-mono font-bold">{cue.time}</span>
                  <span className="font-mono text-muted-foreground">{cue.endTime}</span>
                  <div>
                    <span className="font-medium">{cue.item}</span>
                    {cue.notes && <p className="text-xs text-muted-foreground">{cue.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('h-2 w-2 rounded-full', getDeptColor(cue.department))} />
                    <span className="text-xs">{getDeptLabel(cue.department)}</span>
                  </div>
                  <span className="text-xs">{cue.responsible}</span>
                  <span className="text-xs text-muted-foreground">{cue.location}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WorkspaceLayout
      config={workspaceConfig}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onBack={() => router.push(`/productions/projects/${projectId}`)}
      sidebarContent={sidebarContent}
    >
      {renderTabContent()}
    </WorkspaceLayout>
  );
}
