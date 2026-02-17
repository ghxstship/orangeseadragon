'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPORT SUBSCRIPTION MODAL — Scheduled Report Delivery (G7)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Subscribe to any report for daily/weekly/monthly delivery via
 * email, Slack, or in-app notification.
 */

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Inbox } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ReportSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportName: string;
}

type Channel = 'email' | 'slack' | 'in-app';
type Frequency = 'daily' | 'weekly' | 'monthly';

const CHANNEL_OPTIONS: { value: Channel; label: string; icon: typeof Mail }[] = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'slack', label: 'Slack', icon: MessageSquare },
  { value: 'in-app', label: 'In-App', icon: Inbox },
];

export function ReportSubscriptionModal({
  open,
  onOpenChange,
  reportId,
  reportName,
}: ReportSubscriptionModalProps) {
  const { toast } = useToast();
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [channel, setChannel] = useState<Channel>('email');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [time, setTime] = useState('09:00');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/reports/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          frequency,
          channel,
          dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : undefined,
          dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth) : undefined,
          time,
          webhookUrl: channel === 'slack' ? webhookUrl : undefined,
          enabled,
        }),
      });

      if (!res.ok) throw new Error('Failed to create subscription');

      toast({ title: 'Subscription created', description: `You'll receive "${reportName}" ${frequency}` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to create subscription', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [reportId, reportName, frequency, channel, dayOfWeek, dayOfMonth, time, webhookUrl, enabled, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Subscribe to Report
          </DialogTitle>
          <DialogDescription>
            Get &quot;{reportName}&quot; delivered on a schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Delivery Channel</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CHANNEL_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.value}
                    variant={channel === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setChannel(opt.value)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                    <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Day of Month</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">Delivery Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          {channel === 'slack' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Slack Webhook URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Enabled</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Subscribe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
