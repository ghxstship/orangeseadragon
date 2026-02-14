'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WorkspaceLayout } from '@/lib/layouts';
import type { WorkspaceLayoutConfig } from '@/lib/layouts/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Download,
  Send,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  FileText,
  DollarSign,
} from 'lucide-react';
import { CurrencyDisplay, MarginIndicator, VarianceIndicator } from '@/components/common/financial-display';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface SettlementLineItem {
  id: string;
  category: string;
  description: string;
  estimated: number;
  actual: number;
  notes: string;
}

type ApprovalStatus = 'draft' | 'pm_review' | 'finance_review' | 'client_approval' | 'finalized';

// ─────────────────────────────────────────────────────────────
// SETTLEMENT WORKSHEET PAGE (Layout D)
// ─────────────────────────────────────────────────────────────

export default function SettlementPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [currentTab, setCurrentTab] = React.useState('summary');
  const [approvalStatus, setApprovalStatus] = React.useState<ApprovalStatus>('draft');

  // ── Line Items by Category ──
  const [laborItems, setLaborItems] = React.useState<SettlementLineItem[]>([
    { id: '1', category: 'labor', description: 'Audio Engineer', estimated: 2500, actual: 2500, notes: '' },
    { id: '2', category: 'labor', description: 'Lighting Designer', estimated: 2000, actual: 2200, notes: 'OT 2hrs' },
    { id: '3', category: 'labor', description: 'Stage Hands (4)', estimated: 3200, actual: 3600, notes: 'Added 1 extra' },
  ]);

  const [vendorItems, setVendorItems] = React.useState<SettlementLineItem[]>([
    { id: '1', category: 'vendor', description: 'Sound System Rental', estimated: 8000, actual: 8000, notes: '' },
    { id: '2', category: 'vendor', description: 'Lighting Package', estimated: 5500, actual: 5500, notes: '' },
    { id: '3', category: 'vendor', description: 'Backline', estimated: 1200, actual: 1400, notes: 'Added monitors' },
  ]);

  const [expenseItems, setExpenseItems] = React.useState<SettlementLineItem[]>([
    { id: '1', category: 'expense', description: 'Catering', estimated: 1500, actual: 1650, notes: '' },
    { id: '2', category: 'expense', description: 'Transportation', estimated: 800, actual: 750, notes: '' },
    { id: '3', category: 'expense', description: 'Miscellaneous', estimated: 500, actual: 420, notes: '' },
  ]);

  const [adjustmentItems, setAdjustmentItems] = React.useState<SettlementLineItem[]>([]);

  const [revenue, setRevenue] = React.useState(35000);
  const [agencyFeePercent, setAgencyFeePercent] = React.useState(15);
  const [settlementNotes, setSettlementNotes] = React.useState('');

  // ── Computed Totals ──
  const sumEstimated = (items: SettlementLineItem[]) => items.reduce((s, i) => s + i.estimated, 0);
  const sumActual = (items: SettlementLineItem[]) => items.reduce((s, i) => s + i.actual, 0);

  const totalEstimated = sumEstimated(laborItems) + sumEstimated(vendorItems) + sumEstimated(expenseItems) + sumEstimated(adjustmentItems);
  const totalActual = sumActual(laborItems) + sumActual(vendorItems) + sumActual(expenseItems) + sumActual(adjustmentItems);
  const agencyFee = revenue * (agencyFeePercent / 100);
  const margin = revenue - totalActual - agencyFee;

  // ── Helpers ──
  const addItem = (setter: React.Dispatch<React.SetStateAction<SettlementLineItem[]>>, category: string) => {
    setter(prev => [...prev, { id: crypto.randomUUID(), category, description: '', estimated: 0, actual: 0, notes: '' }]);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<SettlementLineItem[]>>, id: string) => {
    setter(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<SettlementLineItem[]>>, id: string, field: keyof SettlementLineItem, value: string | number) => {
    setter(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // ── Workspace Config ──
  const workspaceConfig: WorkspaceLayoutConfig = {
    title: 'Settlement Worksheet',
    subtitle: `Project ${projectId.slice(0, 8)}…`,
    tabs: [
      { key: 'summary', label: 'Summary' },
      { key: 'labor', label: 'Labor' },
      { key: 'vendors', label: 'Vendors' },
      { key: 'expenses', label: 'Expenses' },
      { key: 'adjustments', label: 'Adjustments' },
      { key: 'approval', label: 'Approval' },
    ],
    defaultTab: 'summary',
    header: { showBackButton: true },
    sidebar: { enabled: true, position: 'right', width: 300, defaultOpen: true },
  };

  const approvalSteps: { key: ApprovalStatus; label: string }[] = [
    { key: 'draft', label: 'Draft' },
    { key: 'pm_review', label: 'PM Review' },
    { key: 'finance_review', label: 'Finance Review' },
    { key: 'client_approval', label: 'Client Approval' },
    { key: 'finalized', label: 'Finalized' },
  ];

  const currentStepIndex = approvalSteps.findIndex(s => s.key === approvalStatus);

  // ── Line Item Table ──
  const renderLineItemTable = (
    items: SettlementLineItem[],
    setter: React.Dispatch<React.SetStateAction<SettlementLineItem[]>>,
    category: string,
    title: string,
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button size="sm" onClick={() => addItem(setter, category)}><Plus className="h-4 w-4 mr-1" /> Add Line</Button>
      </div>
      <div className="rounded-lg border">
        <div className="grid grid-cols-[1fr_110px_110px_110px_1fr_40px] gap-3 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Description</span><span className="text-right">Estimated</span><span className="text-right">Actual</span><span className="text-right">Variance</span><span>Notes</span><span />
        </div>
        {items.map(item => {
          const variance = item.actual - item.estimated;
          return (
            <div key={item.id} className="grid grid-cols-[1fr_110px_110px_110px_1fr_40px] gap-3 p-3 border-t items-center">
              <Input value={item.description} onChange={e => updateItem(setter, item.id, 'description', e.target.value)} placeholder="Description" className="h-8" />
              <Input type="number" value={item.estimated || ''} onChange={e => updateItem(setter, item.id, 'estimated', Number(e.target.value))} className="h-8 text-right" />
              <Input type="number" value={item.actual || ''} onChange={e => updateItem(setter, item.id, 'actual', Number(e.target.value))} className="h-8 text-right" />
              <div className={`text-right text-sm font-medium ${variance > 0 ? 'text-destructive' : variance < 0 ? 'text-semantic-success' : 'text-muted-foreground'}`}>
                {variance !== 0 ? `${variance > 0 ? '+' : ''}$${variance.toLocaleString()}` : '—'}
              </div>
              <Input value={item.notes} onChange={e => updateItem(setter, item.id, 'notes', e.target.value)} placeholder="Notes" className="h-8" />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(setter, item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          );
        })}
        <div className="grid grid-cols-[1fr_110px_110px_110px_1fr_40px] gap-3 p-3 border-t bg-muted/30 font-medium text-sm">
          <span>Total</span>
          <span className="text-right">${sumEstimated(items).toLocaleString()}</span>
          <span className="text-right">${sumActual(items).toLocaleString()}</span>
          <span className={`text-right ${sumActual(items) - sumEstimated(items) > 0 ? 'text-destructive' : 'text-semantic-success'}`}>
            {sumActual(items) - sumEstimated(items) !== 0 ? `${sumActual(items) - sumEstimated(items) > 0 ? '+' : ''}$${(sumActual(items) - sumEstimated(items)).toLocaleString()}` : '—'}
          </span>
          <span /><span />
        </div>
      </div>
    </div>
  );

  // ── Sidebar ──
  const sidebarContent = (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Financial Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Revenue</span>
            <CurrencyDisplay amount={revenue} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Costs</span>
            <CurrencyDisplay amount={totalActual} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Agency Fee ({agencyFeePercent}%)</span>
            <CurrencyDisplay amount={agencyFee} />
          </div>
          <div className="border-t pt-2 flex justify-between text-sm font-semibold">
            <span>Margin</span>
            <MarginIndicator revenue={revenue} cost={totalActual + agencyFee} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Variance</h3>
        <VarianceIndicator estimated={totalEstimated} actual={totalActual} />
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Approval Status</h3>
        <div className="space-y-1.5">
          {approvalSteps.map((step, idx) => (
            <div key={step.key} className="flex items-center gap-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${idx < currentStepIndex ? 'bg-semantic-success' : idx === currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              <span className={idx <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Button className="w-full" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
        <Button variant="outline" className="w-full" size="sm">
          <FileText className="h-4 w-4 mr-2" /> Generate Invoice
        </Button>
      </div>
    </div>
  );

  // ── Tab Content ──
  const renderTabContent = () => {
    switch (currentTab) {
      case 'summary':
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Revenue', value: revenue, icon: DollarSign, color: 'text-semantic-success' },
                { label: 'Total Costs', value: totalActual, icon: totalActual > totalEstimated ? TrendingUp : TrendingDown, color: totalActual > totalEstimated ? 'text-destructive' : 'text-semantic-success' },
                { label: 'Agency Fee', value: agencyFee, icon: DollarSign, color: 'text-muted-foreground' },
                { label: 'Net Margin', value: margin, icon: margin >= 0 ? TrendingUp : TrendingDown, color: margin >= 0 ? 'text-semantic-success' : 'text-destructive' },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</span>
                    </div>
                    <p className={`text-xl font-bold ${stat.color}`}>${stat.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Revenue & Fee</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Total Revenue</label>
                    <Input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Agency Fee %</label>
                    <Input type="number" value={agencyFeePercent} onChange={e => setAgencyFeePercent(Number(e.target.value))} min={0} max={100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Cost Breakdown (Estimated vs Actual)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Labor', estimated: sumEstimated(laborItems), actual: sumActual(laborItems) },
                    { label: 'Vendors', estimated: sumEstimated(vendorItems), actual: sumActual(vendorItems) },
                    { label: 'Expenses', estimated: sumEstimated(expenseItems), actual: sumActual(expenseItems) },
                    { label: 'Adjustments', estimated: sumEstimated(adjustmentItems), actual: sumActual(adjustmentItems) },
                  ].map(row => (
                    <div key={row.label} className="grid grid-cols-4 gap-4 text-sm items-center">
                      <span className="font-medium">{row.label}</span>
                      <span className="text-right text-muted-foreground">${row.estimated.toLocaleString()}</span>
                      <span className="text-right">${row.actual.toLocaleString()}</span>
                      <VarianceIndicator estimated={row.estimated} actual={row.actual} />
                    </div>
                  ))}
                  <div className="border-t pt-2 grid grid-cols-4 gap-4 text-sm font-semibold items-center">
                    <span>Total</span>
                    <span className="text-right">${totalEstimated.toLocaleString()}</span>
                    <span className="text-right">${totalActual.toLocaleString()}</span>
                    <VarianceIndicator estimated={totalEstimated} actual={totalActual} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'labor':
        return renderLineItemTable(laborItems, setLaborItems, 'labor', 'Labor Actuals');

      case 'vendors':
        return renderLineItemTable(vendorItems, setVendorItems, 'vendor', 'Vendor Costs');

      case 'expenses':
        return renderLineItemTable(expenseItems, setExpenseItems, 'expense', 'Expenses');

      case 'adjustments':
        return renderLineItemTable(adjustmentItems, setAdjustmentItems, 'adjustment', 'Adjustments');

      case 'approval':
        return (
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardHeader><CardTitle className="text-base">Approval Workflow</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-6">
                  {approvalSteps.map((step, idx) => (
                    <React.Fragment key={step.key}>
                      {idx > 0 && <div className={`h-0.5 flex-1 ${idx <= currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />}
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                        idx < currentStepIndex ? 'bg-semantic-success/10 text-semantic-success' :
                        idx === currentStepIndex ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {idx < currentStepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                        {step.label}
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {approvalStatus !== 'finalized' && (
                  <div className="flex items-center gap-3">
                    <Button onClick={() => {
                      const nextIdx = currentStepIndex + 1;
                      if (nextIdx < approvalSteps.length) setApprovalStatus(approvalSteps[nextIdx].key);
                    }}>
                      <Send className="h-4 w-4 mr-2" />
                      {currentStepIndex < approvalSteps.length - 1 ? `Submit for ${approvalSteps[currentStepIndex + 1].label}` : 'Finalize'}
                    </Button>
                    {currentStepIndex > 0 && (
                      <Button variant="outline" onClick={() => setApprovalStatus(approvalSteps[currentStepIndex - 1].key)}>
                        Return to {approvalSteps[currentStepIndex - 1].label}
                      </Button>
                    )}
                  </div>
                )}

                {approvalStatus === 'finalized' && (
                  <div className="flex items-center gap-2 text-semantic-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Settlement finalized</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Settlement Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={settlementNotes} onChange={e => setSettlementNotes(e.target.value)} placeholder="Notes for reviewers..." rows={4} />
              </CardContent>
            </Card>
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
