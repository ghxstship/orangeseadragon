'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceLayout } from '@/lib/layouts';
import type { WorkspaceLayoutConfig } from '@/lib/layouts/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Send,
  Eye,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  Calculator,
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/common/financial-display';
import { formatCurrency } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  source: 'manual' | 'time' | 'expense' | 'rate-card';
}

// ─────────────────────────────────────────────────────────────
// INVOICE BUILDER PAGE (Layout D)
// ─────────────────────────────────────────────────────────────

export default function InvoiceBuilderPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = React.useState('details');

  // ── Invoice Header State ──
  const [invoiceNumber, setInvoiceNumber] = React.useState('INV-2026-001');
  const [clientName, setClientName] = React.useState('');
  const [projectName, setProjectName] = React.useState('');
  const [issueDate, setIssueDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = React.useState('');
  const [paymentTerms, setPaymentTerms] = React.useState('net-30');
  const [notes, setNotes] = React.useState('');
  const [internalNotes, setInternalNotes] = React.useState('');

  // ── Line Items ──
  const [lineItems, setLineItems] = React.useState<InvoiceLineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, source: 'manual' },
  ]);

  // ── Discount & Deposit ──
  const [discountType, setDiscountType] = React.useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = React.useState(0);
  const [depositCredit, setDepositCredit] = React.useState(0);

  // ── Computed Totals ──
  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
  const discount = discountType === 'percent' ? subtotal * (discountValue / 100) : discountValue;
  const total = subtotal + taxTotal - discount;
  const amountDue = total - depositCredit;

  // ── Handlers ──
  const addLineItem = () => {
    setLineItems(prev => [...prev, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, taxRate: 0, source: 'manual' }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // ── Workspace Config ──
  const workspaceConfig: WorkspaceLayoutConfig = {
    title: 'Invoice Builder',
    subtitle: invoiceNumber,
    tabs: [
      { key: 'details', label: 'Details' },
      { key: 'line-items', label: 'Line Items' },
      { key: 'totals', label: 'Totals & Discounts' },
      { key: 'notes', label: 'Notes' },
      { key: 'preview', label: 'Preview' },
    ],
    defaultTab: 'details',
    header: { showBackButton: true },
    sidebar: { enabled: true, position: 'right', width: 280, defaultOpen: true },
  };

  // ── Sidebar ──
  const sidebarContent = (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Totals</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <CurrencyDisplay amount={subtotal} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <CurrencyDisplay amount={taxTotal} />
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-semantic-success">-<CurrencyDisplay amount={discount} /></span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <CurrencyDisplay amount={total} />
          </div>
          {depositCredit > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit Credit</span>
              <span className="text-semantic-success">-<CurrencyDisplay amount={depositCredit} /></span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-base font-bold">
            <span>Amount Due</span>
            <CurrencyDisplay amount={amountDue} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Actions</h3>
        <div className="space-y-2">
          <Button className="w-full justify-start" size="sm">
            <FileText className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Eye className="h-4 w-4 mr-2" /> Preview PDF
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Send className="h-4 w-4 mr-2" /> Finalize & Send
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Add From</h3>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-sm h-8" size="sm">
            <Calculator className="h-3.5 w-3.5 mr-2" /> Time Entries
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-8" size="sm">
            <DollarSign className="h-3.5 w-3.5 mr-2" /> Expenses
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-8" size="sm">
            <FileText className="h-3.5 w-3.5 mr-2" /> Rate Card Services
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Tab Content ──
  const renderTabContent = () => {
    switch (currentTab) {
      case 'details':
        return (
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Invoice Number</label>
                    <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Payment Terms</label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                        <SelectItem value="net-15">Net 15</SelectItem>
                        <SelectItem value="net-30">Net 30</SelectItem>
                        <SelectItem value="net-45">Net 45</SelectItem>
                        <SelectItem value="net-60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Issue Date</label>
                    <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Client & Project</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Client / Company</label>
                    <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Select or type client name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Project (optional)</label>
                    <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Link to project" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'line-items':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Line Items</h2>
              <Button size="sm" onClick={addLineItem}><Plus className="h-4 w-4 mr-1" /> Add Line</Button>
            </div>
            <div className="rounded-lg border">
              <div className="grid grid-cols-[1fr_80px_110px_80px_100px_40px] gap-3 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Description</span><span className="text-right">Qty</span><span className="text-right">Unit Price</span><span className="text-right">Tax %</span><span className="text-right">Subtotal</span><span />
              </div>
              {lineItems.map(item => {
                const lineSubtotal = item.quantity * item.unitPrice;
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_80px_110px_80px_100px_40px] gap-3 p-3 border-t items-center">
                    <Input value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} placeholder="Description" className="h-8" />
                    <Input type="number" value={item.quantity || ''} onChange={e => updateLineItem(item.id, 'quantity', Number(e.target.value))} className="h-8 text-right" min={0} />
                    <Input type="number" value={item.unitPrice || ''} onChange={e => updateLineItem(item.id, 'unitPrice', Number(e.target.value))} className="h-8 text-right" min={0} step={0.01} />
                    <Input type="number" value={item.taxRate || ''} onChange={e => updateLineItem(item.id, 'taxRate', Number(e.target.value))} className="h-8 text-right" min={0} max={100} />
                    <div className="text-right text-sm font-medium">{formatCurrency(lineSubtotal)}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
              <div className="grid grid-cols-[1fr_80px_110px_80px_100px_40px] gap-3 p-3 border-t bg-muted/30 font-medium text-sm">
                <span>{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
                <span /><span /><span />
                <span className="text-right">{formatCurrency(subtotal)}</span>
                <span />
              </div>
            </div>
          </div>
        );

      case 'totals':
        return (
          <div className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader><CardTitle className="text-base">Discount</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Discount Type</label>
                    <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'fixed' | 'percent')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        <SelectItem value="percent">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Discount Value</label>
                    <Input type="number" value={discountValue || ''} onChange={e => setDiscountValue(Number(e.target.value))} min={0} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Deposit / Credit</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Deposit Credit Applied</label>
                  <Input type="number" value={depositCredit || ''} onChange={e => setDepositCredit(Number(e.target.value))} min={0} />
                  <p className="text-xs text-muted-foreground">Amount already received as deposit or advance payment</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(taxTotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-semantic-success">-{formatCurrency(discount)}</span></div>}
                  <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
                  {depositCredit > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Deposit Credit</span><span className="text-semantic-success">-{formatCurrency(depositCredit)}</span></div>}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold"><span>Amount Due</span><span>{formatCurrency(amountDue)}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardHeader><CardTitle className="text-base">Client-Facing Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes visible to the client on the invoice..." rows={4} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Internal notes (not visible on invoice)..." rows={4} />
              </CardContent>
            </Card>
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-3xl mx-auto bg-white dark:bg-card rounded-lg border shadow-sm p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">INVOICE</h1>
                <p className="text-lg text-muted-foreground">{invoiceNumber}</p>
              </div>
              <Badge variant="outline" className="text-sm">Draft</Badge>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Bill To</p>
                <p className="font-medium">{clientName || 'Client Name'}</p>
                {projectName && <p className="text-sm text-muted-foreground">Project: {projectName}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Invoice Details</p>
                <p className="text-sm">Issued: {issueDate}</p>
                <p className="text-sm">Due: {dueDate || 'TBD'}</p>
                <p className="text-sm capitalize">Terms: {paymentTerms.replace('-', ' ')}</p>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-[1fr_80px_110px_80px_100px] gap-3 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
                <span>Description</span><span className="text-right">Qty</span><span className="text-right">Unit Price</span><span className="text-right">Tax</span><span className="text-right">Amount</span>
              </div>
              {lineItems.filter(i => i.description).map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_110px_80px_100px] gap-3 p-3 border-t text-sm">
                  <span>{item.description}</span>
                  <span className="text-right">{item.quantity}</span>
                  <span className="text-right">{formatCurrency(item.unitPrice)}</span>
                  <span className="text-right">{item.taxRate}%</span>
                  <span className="text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(taxTotal)}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{formatCurrency(discount)}</span></div>}
                <div className="border-t pt-1.5 flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
                {depositCredit > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span>-{formatCurrency(depositCredit)}</span></div>}
                <div className="border-t pt-1.5 flex justify-between text-lg font-bold"><span>Amount Due</span><span>{formatCurrency(amountDue)}</span></div>
              </div>
            </div>

            {notes && (
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{notes}</p>
              </div>
            )}
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
      onBack={() => router.push('/finance/invoices')}
      sidebarContent={sidebarContent}
    >
      {renderTabContent()}
    </WorkspaceLayout>
  );
}
