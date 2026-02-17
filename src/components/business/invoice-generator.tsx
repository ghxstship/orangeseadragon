'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INVOICE GENERATOR — Auto-generate drafts from billable time (G5)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Select a project + date range, optionally apply a rate card,
 * preview line items, then generate an invoice draft.
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/common/financial-display';
import { useToast } from '@/components/ui/use-toast';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface GenerationResult {
  id: string | null;
  lineItems: LineItem[];
  total: number;
  timeEntriesCount: number;
  message: string;
}

interface InvoiceGeneratorProps {
  projects?: { id: string; name: string }[];
  rateCards?: { id: string; name: string }[];
  onGenerated?: (result: GenerationResult) => void;
  className?: string;
}

export function InvoiceGenerator({
  projects = [],
  rateCards = [],
  onGenerated,
  className,
}: InvoiceGeneratorProps) {
  const { toast } = useToast();
  const [projectId, setProjectId] = useState('');
  const [rateCardId, setRateCardId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!projectId) {
      toast({ title: 'Select a project', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/invoices/generate-from-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          rateCardId: rateCardId || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate invoice');

      const json = await res.json();
      setResult(json.data);
      onGenerated?.(json.data);
      toast({ title: 'Invoice draft generated', description: json.data.message });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate invoice', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [projectId, rateCardId, startDate, endDate, onGenerated, toast]);

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Generate Invoice from Time</CardTitle>
              <CardDescription>Auto-create invoice drafts from billable time entries</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                  {projects.length === 0 && (
                    <SelectItem value="_none" disabled>No projects available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Rate Card (optional)</Label>
              <Select value={rateCardId} onValueChange={setRateCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Default rates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_default">Default rates</SelectItem>
                  {rateCards.map((rc) => (
                    <SelectItem key={rc.id} value={rc.id}>{rc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Start Date (optional)</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">End Date (optional)</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !projectId}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Generate Invoice Draft
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {result.id ? (
                <CheckCircle2 className="h-5 w-5 text-semantic-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-semantic-warning" />
              )}
              <CardTitle className="text-sm">{result.message}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.lineItems.length > 0 && (
              <>
                <div className="space-y-2">
                  {result.lineItems.map((li, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="truncate">{li.description}</span>
                        <Badge variant="secondary" className="ml-2 text-[9px]">
                          {li.quantity}h × ${li.unit_price}
                        </Badge>
                      </div>
                      <CurrencyDisplay amount={li.amount} className="font-mono" />
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Total
                  </div>
                  <CurrencyDisplay amount={result.total} className="text-lg" />
                </div>
                {result.timeEntriesCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Generated from {result.timeEntriesCount} billable time entries
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
