'use client';

import { CashFlowChart } from './components/CashFlowChart';
import { FinancialHealthCard } from './components/FinancialHealthCard';
import { ActionCenter } from './components/ActionCenter';

export default function FinancePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
            <p className="text-muted-foreground">Financial overview and operations</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FinancialHealthCard />
          <ActionCenter />
          <CashFlowChart />
        </div>
      </div>
    </div>
  );
}
