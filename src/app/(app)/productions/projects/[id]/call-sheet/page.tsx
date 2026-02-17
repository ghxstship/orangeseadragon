'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WorkspaceLayout } from '@/lib/layouts';
import type { WorkspaceLayoutConfig } from '@/lib/layouts/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  FileText,
  Download,
  Send,
  Printer,
  Clock,
  MapPin,
  Users,
  Phone,
  AlertTriangle,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface CallSheetContact {
  id: string;
  role: string;
  name: string;
  phone: string;
  email: string;
}

interface DepartmentCall {
  id: string;
  department: string;
  callTime: string;
  location: string;
  notes: string;
}

const DEFAULT_CONTACTS: CallSheetContact[] = [
  { id: '1', role: 'Production Manager', name: '', phone: '', email: '' },
  { id: '2', role: 'Stage Manager', name: '', phone: '', email: '' },
  { id: '3', role: 'Venue Contact', name: '', phone: '', email: '' },
];

const DEFAULT_DEPARTMENT_CALLS: DepartmentCall[] = [
  { id: '1', department: 'Audio', callTime: '', location: '', notes: '' },
  { id: '2', department: 'Lighting', callTime: '', location: '', notes: '' },
  { id: '3', department: 'Video', callTime: '', location: '', notes: '' },
  { id: '4', department: 'Backline', callTime: '', location: '', notes: '' },
  { id: '5', department: 'Catering', callTime: '', location: '', notes: '' },
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '', item: 'Load In', department: 'All', location: '', notes: '' },
  { id: '2', time: '', item: 'Sound Check', department: 'Audio', location: 'Stage', notes: '' },
  { id: '3', time: '', item: 'Doors', department: 'FOH', location: 'Main Entrance', notes: '' },
  { id: '4', time: '', item: 'Show', department: 'All', location: 'Stage', notes: '' },
  { id: '5', time: '', item: 'Load Out', department: 'All', location: '', notes: '' },
];

interface ScheduleItem {
  id: string;
  time: string;
  item: string;
  department: string;
  location: string;
  notes: string;
}

// ─────────────────────────────────────────────────────────────
// CALL SHEET GENERATOR PAGE (Layout D)
// ─────────────────────────────────────────────────────────────

export default function CallSheetPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [currentTab, setCurrentTab] = React.useState('production-info');
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  // ── Call Sheet State ──
  const [productionInfo, setProductionInfo] = React.useState({
    showName: '',
    date: '',
    venue: '',
    venueAddress: '',
    loadInTime: '',
    doorsTime: '',
    showTime: '',
    curfew: '',
    weatherForecast: '',
    parkingInstructions: '',
    generalNotes: '',
  });

  const [contacts, setContacts] = React.useState<CallSheetContact[]>(DEFAULT_CONTACTS);

  const [departmentCalls, setDepartmentCalls] = React.useState<DepartmentCall[]>(DEFAULT_DEPARTMENT_CALLS);

  const [schedule, setSchedule] = React.useState<ScheduleItem[]>(DEFAULT_SCHEDULE);

  React.useEffect(() => {
    let isCancelled = false;

    const loadCallSheet = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/projects/${projectId}/call-sheet`);
        if (!res.ok) {
          throw new Error('Failed to load call sheet');
        }

        const json = await res.json();
        const data = json?.data as {
          production_info?: typeof productionInfo;
          contacts?: CallSheetContact[];
          department_calls?: DepartmentCall[];
          schedule?: ScheduleItem[];
        } | null;

        if (!data || isCancelled) {
          return;
        }

        if (data.production_info) {
          setProductionInfo((prev) => ({ ...prev, ...data.production_info }));
        }
        if (Array.isArray(data.contacts) && data.contacts.length > 0) {
          setContacts(data.contacts);
        }
        if (Array.isArray(data.department_calls) && data.department_calls.length > 0) {
          setDepartmentCalls(data.department_calls);
        }
        if (Array.isArray(data.schedule) && data.schedule.length > 0) {
          setSchedule(data.schedule);
        }
      } catch {
        if (!isCancelled) {
          toast({
            title: 'Could not load saved call sheet',
            description: 'Starting with a new draft.',
            variant: 'destructive',
          });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void loadCallSheet();

    return () => {
      isCancelled = true;
    };
  }, [projectId, toast]);

  // ── Workspace Config ──
  const workspaceConfig: WorkspaceLayoutConfig = {
    title: 'Call Sheet Generator',
    subtitle: productionInfo.showName || 'Untitled Production',
    tabs: [
      { key: 'production-info', label: 'Production Info' },
      { key: 'contacts', label: 'Key Contacts' },
      { key: 'department-calls', label: 'Department Calls' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'notes', label: 'Notes & Maps' },
      { key: 'preview', label: 'Preview' },
    ],
    defaultTab: 'production-info',
    header: {
      showBackButton: true,
      showSettings: false,
    },
    sidebar: {
      enabled: true,
      position: 'right',
      width: 280,
      defaultOpen: true,
    },
  };

  // ── Handlers ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/call-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productionInfo, contacts, departmentCalls, schedule }),
      });

      if (!response.ok) {
        throw new Error('Failed to save call sheet');
      }

      toast({ title: 'Call sheet saved' });
      return true;
    } catch (err) {
      toast({
        title: 'Failed to save call sheet',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const buildPrintHtml = () => {
    const title = productionInfo.showName || 'Call Sheet';
    const contactRows = contacts
      .filter((c) => c.name)
      .map((c) => `<tr><td>${c.role || ''}</td><td>${c.name || ''}</td><td>${c.phone || ''}</td><td>${c.email || ''}</td></tr>`)
      .join('');
    const departmentRows = departmentCalls
      .filter((d) => d.callTime)
      .map((d) => `<tr><td>${d.department || ''}</td><td>${d.callTime || ''}</td><td>${d.location || ''}</td><td>${d.notes || ''}</td></tr>`)
      .join('');
    const scheduleRows = schedule
      .filter((s) => s.time)
      .map((s) => `<tr><td>${s.time || ''}</td><td>${s.item || ''}</td><td>${s.department || ''}</td><td>${s.location || ''}</td><td>${s.notes || ''}</td></tr>`)
      .join('');

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
      h1, h2 { margin: 0 0 12px; }
      h1 { font-size: 28px; }
      h2 { font-size: 16px; margin-top: 24px; text-transform: uppercase; letter-spacing: .08em; }
      .meta { margin-bottom: 16px; color: #444; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #f5f5f5; }
      .notes { white-space: pre-wrap; font-size: 12px; color: #333; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <div class="meta">
      <div><strong>Date:</strong> ${productionInfo.date || '-'}</div>
      <div><strong>Venue:</strong> ${productionInfo.venue || '-'}${productionInfo.venueAddress ? ` — ${productionInfo.venueAddress}` : ''}</div>
      <div><strong>Load In:</strong> ${productionInfo.loadInTime || '-'} | <strong>Doors:</strong> ${productionInfo.doorsTime || '-'} | <strong>Show:</strong> ${productionInfo.showTime || '-'} | <strong>Curfew:</strong> ${productionInfo.curfew || '-'}</div>
    </div>

    <h2>Key Contacts</h2>
    <table>
      <thead><tr><th>Role</th><th>Name</th><th>Phone</th><th>Email</th></tr></thead>
      <tbody>${contactRows || '<tr><td colspan="4">No contact entries.</td></tr>'}</tbody>
    </table>

    <h2>Department Calls</h2>
    <table>
      <thead><tr><th>Department</th><th>Call Time</th><th>Location</th><th>Notes</th></tr></thead>
      <tbody>${departmentRows || '<tr><td colspan="4">No department calls.</td></tr>'}</tbody>
    </table>

    <h2>Schedule</h2>
    <table>
      <thead><tr><th>Time</th><th>Item</th><th>Department</th><th>Location</th><th>Notes</th></tr></thead>
      <tbody>${scheduleRows || '<tr><td colspan="5">No schedule items.</td></tr>'}</tbody>
    </table>

    <h2>General Notes</h2>
    <div class="notes">${productionInfo.generalNotes || 'No additional notes.'}</div>
  </body>
</html>`;
  };

  const openPrintWindow = (autoPrint: boolean) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      throw new Error('Popup blocked by browser');
    }

    printWindow.document.write(buildPrintHtml());
    printWindow.document.close();

    if (autoPrint) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const handlePrint = async () => {
    const saved = await handleSave();
    if (!saved) return false;

    try {
      openPrintWindow(true);
      return true;
    } catch (err) {
      toast({
        title: 'Unable to open print window',
        description: err instanceof Error ? err.message : 'Please allow popups and try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const printed = await handlePrint();
      if (printed) {
        toast({ title: 'Print dialog opened', description: 'Choose "Save as PDF" to export the call sheet.' });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendToCrew = async () => {
    setIsSending(true);
    try {
      const saved = await handleSave();
      if (!saved) return;

      const shareUrl = `${window.location.origin}/productions/projects/${projectId}/call-sheet`;
      const title = productionInfo.showName ? `${productionInfo.showName} Call Sheet` : 'Call Sheet';
      const text = `Call sheet is ready: ${shareUrl}`;

      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text, url: shareUrl });
      } else if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(`${title}\n${text}`);
      }

      toast({
        title: 'Call sheet ready to share',
        description: 'Link copied or shared to crew.',
      });
    } catch (err) {
      toast({
        title: 'Unable to share call sheet',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const addContact = () => {
    setContacts(prev => [...prev, { id: crypto.randomUUID(), role: '', name: '', phone: '', email: '' }]);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const updateContact = (id: string, field: keyof CallSheetContact, value: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addDepartmentCall = () => {
    setDepartmentCalls(prev => [...prev, { id: crypto.randomUUID(), department: '', callTime: '', location: '', notes: '' }]);
  };

  const removeDepartmentCall = (id: string) => {
    setDepartmentCalls(prev => prev.filter(d => d.id !== id));
  };

  const updateDepartmentCall = (id: string, field: keyof DepartmentCall, value: string) => {
    setDepartmentCalls(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addScheduleItem = () => {
    setSchedule(prev => [...prev, { id: crypto.randomUUID(), time: '', item: '', department: '', location: '', notes: '' }]);
  };

  const removeScheduleItem = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const updateScheduleItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // ── Sidebar ──
  const sidebarContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Actions</h3>
        <div className="space-y-2">
          <Button className="w-full justify-start" size="sm" onClick={handleSave} disabled={saving}>
            <FileText className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleExportPdf} disabled={isExporting || saving}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Preparing...' : 'Export PDF'}
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleSendToCrew} disabled={isSending}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send to Crew'}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Checklist</h3>
        <div className="space-y-1.5 text-sm">
          {[
            { label: 'Production info', done: !!productionInfo.showName && !!productionInfo.date },
            { label: 'Venue details', done: !!productionInfo.venue },
            { label: 'Key contacts', done: contacts.some(c => c.name) },
            { label: 'Department calls', done: departmentCalls.some(d => d.callTime) },
            { label: 'Schedule', done: schedule.some(s => s.time) },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${item.done ? 'bg-semantic-success' : 'bg-muted-foreground/30'}`} />
              <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Summary</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{contacts.length} contacts</p>
          <p>{departmentCalls.length} departments</p>
          <p>{schedule.length} schedule items</p>
        </div>
      </div>
    </div>
  );

  // ── Tab Content ──
  const renderTabContent = () => {
    switch (currentTab) {
      case 'production-info':
        return (
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardHeader><CardTitle className="text-base">Production Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Show / Event Name</label>
                    <Input value={productionInfo.showName} onChange={e => setProductionInfo(p => ({ ...p, showName: e.target.value }))} placeholder="e.g. Summer Festival 2026" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" value={productionInfo.date} onChange={e => setProductionInfo(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Venue</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Venue Name</label>
                    <Input value={productionInfo.venue} onChange={e => setProductionInfo(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Madison Square Garden" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Address</label>
                    <Input value={productionInfo.venueAddress} onChange={e => setProductionInfo(p => ({ ...p, venueAddress: e.target.value }))} placeholder="Full address" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Parking Instructions</label>
                  <Textarea value={productionInfo.parkingInstructions} onChange={e => setProductionInfo(p => ({ ...p, parkingInstructions: e.target.value }))} placeholder="Where to park, load-in dock access..." rows={2} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Key Times</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Load In', field: 'loadInTime' as const },
                    { label: 'Doors', field: 'doorsTime' as const },
                    { label: 'Show', field: 'showTime' as const },
                    { label: 'Curfew', field: 'curfew' as const },
                  ].map(t => (
                    <div key={t.field} className="space-y-1.5">
                      <label className="text-sm font-medium">{t.label}</label>
                      <Input type="time" value={productionInfo[t.field]} onChange={e => setProductionInfo(p => ({ ...p, [t.field]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Phone className="h-5 w-5" /> Key Contacts</h2>
              <Button size="sm" onClick={addContact}><Plus className="h-4 w-4 mr-1" /> Add Contact</Button>
            </div>
            <div className="space-y-3">
              {contacts.map(contact => (
                <Card key={contact.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Role</label>
                          <Input value={contact.role} onChange={e => updateContact(contact.id, 'role', e.target.value)} placeholder="Role" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Name</label>
                          <Input value={contact.name} onChange={e => updateContact(contact.id, 'name', e.target.value)} placeholder="Full name" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Phone</label>
                          <Input value={contact.phone} onChange={e => updateContact(contact.id, 'phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Email</label>
                          <Input value={contact.email} onChange={e => updateContact(contact.id, 'email', e.target.value)} placeholder="email@example.com" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 mt-5" onClick={() => removeContact(contact.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'department-calls':
        return (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Department Call Times</h2>
              <Button size="sm" onClick={addDepartmentCall}><Plus className="h-4 w-4 mr-1" /> Add Department</Button>
            </div>
            <div className="rounded-lg border">
              <div className="grid grid-cols-[1fr_120px_1fr_1fr_40px] gap-3 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Department</span><span>Call Time</span><span>Location</span><span>Notes</span><span />
              </div>
              {departmentCalls.map(dept => (
                <div key={dept.id} className="grid grid-cols-[1fr_120px_1fr_1fr_40px] gap-3 p-3 border-t items-center">
                  <Input value={dept.department} onChange={e => updateDepartmentCall(dept.id, 'department', e.target.value)} placeholder="Department" className="h-8" />
                  <Input type="time" value={dept.callTime} onChange={e => updateDepartmentCall(dept.id, 'callTime', e.target.value)} className="h-8" />
                  <Input value={dept.location} onChange={e => updateDepartmentCall(dept.id, 'location', e.target.value)} placeholder="Location" className="h-8" />
                  <Input value={dept.notes} onChange={e => updateDepartmentCall(dept.id, 'notes', e.target.value)} placeholder="Notes" className="h-8" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDepartmentCall(dept.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5" /> Day Schedule</h2>
              <Button size="sm" onClick={addScheduleItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
            </div>
            <div className="rounded-lg border">
              <div className="grid grid-cols-[100px_1fr_120px_120px_1fr_40px] gap-3 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Time</span><span>Item</span><span>Department</span><span>Location</span><span>Notes</span><span />
              </div>
              {schedule.map(item => (
                <div key={item.id} className="grid grid-cols-[100px_1fr_120px_120px_1fr_40px] gap-3 p-3 border-t items-center">
                  <Input type="time" value={item.time} onChange={e => updateScheduleItem(item.id, 'time', e.target.value)} className="h-8" />
                  <Input value={item.item} onChange={e => updateScheduleItem(item.id, 'item', e.target.value)} placeholder="Schedule item" className="h-8" />
                  <Input value={item.department} onChange={e => updateScheduleItem(item.id, 'department', e.target.value)} placeholder="Dept" className="h-8" />
                  <Input value={item.location} onChange={e => updateScheduleItem(item.id, 'location', e.target.value)} placeholder="Location" className="h-8" />
                  <Input value={item.notes} onChange={e => updateScheduleItem(item.id, 'notes', e.target.value)} placeholder="Notes" className="h-8" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeScheduleItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Weather & Safety</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Weather Forecast</label>
                  <Textarea value={productionInfo.weatherForecast} onChange={e => setProductionInfo(p => ({ ...p, weatherForecast: e.target.value }))} placeholder="Expected weather conditions..." rows={2} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">General Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={productionInfo.generalNotes} onChange={e => setProductionInfo(p => ({ ...p, generalNotes: e.target.value }))} placeholder="Additional notes for the crew..." rows={6} />
              </CardContent>
            </Card>
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-3xl mx-auto bg-white dark:bg-card rounded-lg border shadow-sm p-8 space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">{productionInfo.showName || 'Untitled Production'}</h1>
              <p className="text-lg text-muted-foreground">{productionInfo.date || 'Date TBD'}</p>
              <p className="text-sm text-muted-foreground">{productionInfo.venue}{productionInfo.venueAddress ? ` — ${productionInfo.venueAddress}` : ''}</p>
            </div>

            {(productionInfo.loadInTime || productionInfo.doorsTime || productionInfo.showTime || productionInfo.curfew) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Load In', value: productionInfo.loadInTime },
                  { label: 'Doors', value: productionInfo.doorsTime },
                  { label: 'Show', value: productionInfo.showTime },
                  { label: 'Curfew', value: productionInfo.curfew },
                ].filter(t => t.value).map(t => (
                  <div key={t.label} className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{t.label}</p>
                    <p className="text-lg font-bold">{t.value}</p>
                  </div>
                ))}
              </div>
            )}

            {contacts.some(c => c.name) && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50 mb-2">Key Contacts</h2>
                <div className="rounded-lg border divide-y">
                  {contacts.filter(c => c.name).map(c => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <div>
                        <span className="font-medium">{c.role}</span>
                        <span className="text-muted-foreground ml-2">{c.name}</span>
                      </div>
                      <div className="text-muted-foreground">{c.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {departmentCalls.some(d => d.callTime) && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50 mb-2">Department Calls</h2>
                <div className="rounded-lg border divide-y">
                  {departmentCalls.filter(d => d.callTime).map(d => (
                    <div key={d.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="font-medium">{d.department}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{d.callTime}</Badge>
                        {d.location && <span className="text-muted-foreground">{d.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {schedule.some(s => s.time) && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50 mb-2">Schedule</h2>
                <div className="rounded-lg border divide-y">
                  {schedule.filter(s => s.time).map(s => (
                    <div key={s.id} className="flex items-center gap-4 px-4 py-2 text-sm">
                      <span className="font-mono font-bold w-16">{s.time}</span>
                      <span className="font-medium flex-1">{s.item}</span>
                      <Badge variant="outline">{s.department}</Badge>
                      {s.location && <span className="text-muted-foreground">{s.location}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {productionInfo.generalNotes && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50 mb-2">Notes</h2>
                <p className="text-sm whitespace-pre-wrap">{productionInfo.generalNotes}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
