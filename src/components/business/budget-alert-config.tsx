'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUDGET ALERT CONFIG — Threshold-based budget overrun warnings (G8)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Configure alert rules: threshold %, notification channel, recipients.
 * Reusable across project budgets, department budgets, org-wide budgets.
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Bell, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface AlertRule {
  id: string;
  thresholdPercent: number;
  channel: 'email' | 'slack' | 'in-app';
  enabled: boolean;
}

interface BudgetAlertConfigProps {
  budgetId?: string;
  budgetName?: string;
  initialRules?: AlertRule[];
  onSave?: (rules: AlertRule[]) => void;
  className?: string;
}

const DEFAULT_THRESHOLDS = [50, 75, 90, 100];

export function BudgetAlertConfig({
  budgetId,
  budgetName,
  initialRules,
  onSave,
  className,
}: BudgetAlertConfigProps) {
  const { toast } = useToast();
  const [rules, setRules] = useState<AlertRule[]>(
    initialRules || DEFAULT_THRESHOLDS.map((t, i) => ({
      id: String(i + 1),
      thresholdPercent: t,
      channel: 'in-app' as const,
      enabled: true,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const addRule = useCallback(() => {
    setRules((prev) => [
      ...prev,
      { id: String(Date.now()), thresholdPercent: 80, channel: 'in-app', enabled: true },
    ]);
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRule = useCallback((id: string, field: keyof AlertRule, value: unknown) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      for (const rule of rules) {
        await fetch('/api/budget-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            budgetId,
            thresholdPercent: rule.thresholdPercent,
            channel: rule.channel,
            enabled: rule.enabled,
          }),
        });
      }
      onSave?.(rules);
      toast({ title: 'Alert rules saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save alert rules', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [rules, budgetId, onSave, toast]);

  const getThresholdColor = (pct: number) => {
    if (pct >= 100) return 'text-destructive';
    if (pct >= 90) return 'text-semantic-warning';
    if (pct >= 75) return 'text-semantic-warning';
    return 'text-semantic-success';
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-semantic-warning/10">
            <AlertTriangle className="h-5 w-5 text-semantic-warning" />
          </div>
          <div>
            <CardTitle className="text-lg">Budget Alerts</CardTitle>
            <CardDescription>
              {budgetName ? `Configure alerts for "${budgetName}"` : 'Set threshold-based budget overrun warnings'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <Switch
              checked={rule.enabled}
              onCheckedChange={(v) => updateRule(rule.id, 'enabled', v)}
            />

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('font-mono text-xs', getThresholdColor(rule.thresholdPercent))}>
                  {rule.thresholdPercent}%
                </Badge>
                <span className="text-xs text-muted-foreground">threshold</span>
              </div>
              <Slider
                value={[rule.thresholdPercent]}
                onValueChange={([v]) => updateRule(rule.id, 'thresholdPercent', v)}
                min={10}
                max={150}
                step={5}
                className="w-full"
                disabled={!rule.enabled}
              />
            </div>

            <Select
              value={rule.channel}
              onValueChange={(v) => updateRule(rule.id, 'channel', v)}
              disabled={!rule.enabled}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-app">In-App</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => removeRule(rule.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" className="gap-1" onClick={addRule}>
          <Plus className="h-3.5 w-3.5" />
          Add Alert Rule
        </Button>

        <Button className="w-full gap-1.5" onClick={handleSave} disabled={isSaving}>
          <Bell className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Alert Rules'}
        </Button>
      </CardContent>
    </Card>
  );
}
