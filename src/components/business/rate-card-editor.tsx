'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RATE CARD EDITOR — Client-specific rate cards (G6)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Create/edit rate cards with per-role hourly rates.
 * Used by: invoice generation, proposal builder, budget planning.
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface RateEntry {
  id: string;
  roleId: string;
  roleName: string;
  hourlyRate: number;
  overtimeRate: number;
}

interface RateCardEditorProps {
  initialName?: string;
  initialRates?: RateEntry[];
  clientId?: string;
  clients?: { id: string; name: string }[];
  roles?: { id: string; name: string }[];
  onSave?: (data: { name: string; clientId: string; isDefault: boolean; currency: string; rates: RateEntry[] }) => void;
  className?: string;
}

export function RateCardEditor({
  initialName = '',
  initialRates = [],
  clientId: initialClientId = '',
  clients = [],
  roles = [],
  onSave,
  className,
}: RateCardEditorProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [clientId, setClientId] = useState(initialClientId);
  const [isDefault, setIsDefault] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState<RateEntry[]>(
    initialRates.length > 0
      ? initialRates
      : [{ id: '1', roleId: '', roleName: '', hourlyRate: 0, overtimeRate: 0 }]
  );
  const [isSaving, setIsSaving] = useState(false);

  const addRate = useCallback(() => {
    setRates((prev) => [
      ...prev,
      { id: String(Date.now()), roleId: '', roleName: '', hourlyRate: 0, overtimeRate: 0 },
    ]);
  }, []);

  const removeRate = useCallback((id: string) => {
    setRates((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRate = useCallback((id: string, field: keyof RateEntry, value: string | number) => {
    setRates((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === 'roleId') {
          const role = roles.find((rl) => rl.id === value);
          return { ...r, roleId: String(value), roleName: role?.name || String(value) };
        }
        return { ...r, [field]: value };
      })
    );
  }, [roles]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name, clientId, isDefault, currency, rates };

      const res = await fetch('/api/rate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      onSave?.(payload);
      toast({ title: 'Rate card saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save rate card', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [name, clientId, isDefault, currency, rates, onSave, toast]);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Rate Card</CardTitle>
        <CardDescription>Define per-role hourly rates for billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Rate Card Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard 2025" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Client (optional)</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={isDefault} onCheckedChange={setIsDefault} id="default-toggle" />
            <Label htmlFor="default-toggle" className="text-xs">Default rate card</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Rates</Label>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_100px_100px_32px] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
              <span>Role</span>
              <span>Hourly Rate</span>
              <span>Overtime</span>
              <span />
            </div>
            {rates.map((rate) => (
              <div key={rate.id} className="grid grid-cols-[1fr_100px_100px_32px] gap-2 items-center">
                {roles.length > 0 ? (
                  <Select value={rate.roleId} onValueChange={(v) => updateRate(rate.id, 'roleId', v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={rate.roleName}
                    onChange={(e) => updateRate(rate.id, 'roleName', e.target.value)}
                    placeholder="Role name"
                    className="h-8 text-sm"
                  />
                )}
                <Input
                  type="number"
                  value={rate.hourlyRate}
                  onChange={(e) => updateRate(rate.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                  className="h-8 text-sm"
                  min={0}
                />
                <Input
                  type="number"
                  value={rate.overtimeRate}
                  onChange={(e) => updateRate(rate.id, 'overtimeRate', parseFloat(e.target.value) || 0)}
                  className="h-8 text-sm"
                  min={0}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRate(rate.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={addRate}>
            <Plus className="h-3.5 w-3.5" />
            Add Role
          </Button>
        </div>

        <Button className="w-full gap-1.5" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Rate Card'}
        </Button>
      </CardContent>
    </Card>
  );
}
