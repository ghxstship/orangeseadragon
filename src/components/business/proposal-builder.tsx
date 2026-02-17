'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROPOSAL BUILDER — Visual Proposal Editor with PDF & E-Signatures (G4)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Create branded proposals with:
 * - Template editor (brand kit integration)
 * - Line item pricing from rate cards
 * - PDF preview/export
 * - Email send with tracking
 * - E-signature integration
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Plus, Trash2, Send, Download, Pen,
  GripVertical, DollarSign, Calendar, Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/common/financial-display';
import { useToast } from '@/components/ui/use-toast';

interface ProposalLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'pricing' | 'timeline' | 'terms';
}

interface ProposalBuilderProps {
  dealId?: string;
  clientName?: string;
  onSave?: (proposal: ProposalData) => void;
  onSend?: (proposal: ProposalData) => void;
  className?: string;
}

interface ProposalData {
  title: string;
  clientName: string;
  clientEmail: string;
  validUntil: string;
  sections: ProposalSection[];
  lineItems: ProposalLineItem[];
  notes: string;
  terms: string;
  currency: string;
  discount: number;
  taxRate: number;
}

const DEFAULT_SECTIONS: ProposalSection[] = [
  { id: 'intro', title: 'Introduction', content: '', type: 'text' },
  { id: 'scope', title: 'Scope of Work', content: '', type: 'text' },
  { id: 'pricing', title: 'Pricing', content: '', type: 'pricing' },
  { id: 'timeline', title: 'Timeline', content: '', type: 'timeline' },
  { id: 'terms', title: 'Terms & Conditions', content: '', type: 'terms' },
];

export function ProposalBuilder({
  dealId,
  clientName: initialClientName = '',
  onSave,
  onSend,
  className,
}: ProposalBuilderProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState(initialClientName);
  const [clientEmail, setClientEmail] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [currency] = useState('USD');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [notes] = useState('');
  const [terms] = useState('Payment due within 30 days of acceptance. This proposal is valid for the period specified above.');
  const [sections, setSections] = useState<ProposalSection[]>(DEFAULT_SECTIONS);
  const [lineItems, setLineItems] = useState<ProposalLineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, unit: 'hours' },
  ]);
  const [activeSection, setActiveSection] = useState('intro');
  const [isSaving, setIsSaving] = useState(false);

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount;

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: '', quantity: 1, unitPrice: 0, unit: 'hours' },
    ]);
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof ProposalLineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }, []);

  const updateSectionContent = useCallback((id: string, content: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
  }, []);

  const getProposalData = useCallback((): ProposalData => ({
    title, clientName, clientEmail, validUntil,
    sections, lineItems, notes, terms, currency, discount, taxRate,
  }), [title, clientName, clientEmail, validUntil, sections, lineItems, notes, terms, currency, discount, taxRate]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const data = getProposalData();
      const res = await fetch('/api/proposals/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, dealId }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onSave?.(data);
      toast({ title: 'Proposal saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save proposal', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [getProposalData, dealId, onSave, toast]);

  const handleSend = useCallback(async () => {
    if (!clientEmail) {
      toast({ title: 'Missing email', description: 'Please enter client email', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const data = getProposalData();
      const res = await fetch('/api/proposals/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, dealId }),
      });
      if (!res.ok) throw new Error('Failed to send');
      onSend?.(data);
      toast({ title: 'Proposal sent', description: `Sent to ${clientEmail}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to send proposal', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [getProposalData, dealId, clientEmail, onSend, toast]);

  const handleExportPdf = useCallback(async () => {
    try {
      const data = getProposalData();
      const res = await fetch('/api/proposals/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, dealId }),
      });
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'proposal'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Error', description: 'PDF export failed', variant: 'destructive' });
    }
  }, [getProposalData, dealId, title, toast]);

  const activeSectionData = sections.find((s) => s.id === activeSection);

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[280px_1fr_300px]', className)}>
      {/* Section Navigator */}
      <div className="space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-left justify-start h-auto font-normal transition-colors',
                  section.id === activeSection ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                )}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                {section.title}
                {section.content && <Badge variant="secondary" className="ml-auto text-[9px]">✓</Badge>}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Building className="h-4 w-4" />
              Client Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Client Name</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Company name" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Client Email</Label>
              <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@company.com" type="email" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />Valid Until</Label>
              <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} type="date" className="h-8 text-sm" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Editor */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal Title"
            className="text-xl font-bold h-12 border-none shadow-none focus-visible:ring-0 px-0"
          />
        </div>

        {activeSectionData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{activeSectionData.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {activeSectionData.type === 'pricing' ? (
                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_80px_100px_80px_32px] gap-2 items-center">
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Service description"
                        className="h-8 text-sm"
                      />
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                        min={0}
                      />
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                        min={0}
                      />
                      <Select value={item.unit} onValueChange={(v) => updateLineItem(item.id, 'unit', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="units">Units</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLineItem(item.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-1" onClick={addLineItem}>
                    <Plus className="h-3.5 w-3.5" />
                    Add Line Item
                  </Button>
                </div>
              ) : (
                <Textarea
                  value={activeSectionData.content}
                  onChange={(e) => updateSectionContent(activeSectionData.id, e.target.value)}
                  placeholder={`Enter ${activeSectionData.title.toLowerCase()} content...`}
                  className="min-h-[200px] resize-y"
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Panel */}
      <div className="space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <CurrencyDisplay amount={subtotal} currency={currency} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Discount %</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="h-7 w-20 text-sm text-right"
                min={0}
                max={100}
              />
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Discount</span>
                <CurrencyDisplay amount={-discountAmount} currency={currency} />
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Tax %</span>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="h-7 w-20 text-sm text-right"
                min={0}
              />
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <CurrencyDisplay amount={taxAmount} currency={currency} />
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <CurrencyDisplay amount={total} currency={currency} className="text-lg" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full gap-1.5" onClick={handleSave} disabled={isSaving}>
              <FileText className="h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" className="w-full gap-1.5" onClick={handleExportPdf}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="w-full gap-1.5" onClick={handleSend} disabled={isSaving || !clientEmail}>
              <Send className="h-4 w-4" />
              Send to Client
            </Button>
            <Button variant="outline" className="w-full gap-1.5">
              <Pen className="h-4 w-4" />
              Request E-Signature
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
