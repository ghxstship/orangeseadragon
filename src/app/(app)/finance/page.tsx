'use client';

import { PageHeader } from '@/components/common/page-header';
import { CashFlowChart } from './components/CashFlowChart';
import { FinancialHealthCard } from './components/FinancialHealthCard';
import { ActionCenter } from './components/ActionCenter';

export default function FinancePage() {
  return (
    <div className="space-y-6 pt-6">
      <PageHeader
        title="Finance"
        description="Financial overview and operations"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FinancialHealthCard />
        <ActionCenter />
        <CashFlowChart />
      </div>
    </div>
  );
}
