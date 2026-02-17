'use client';

import { PageShell } from '@/components/common/page-shell';
import { BudgetAlertConfig } from '@/components/business/budget-alert-config';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BudgetAlertsPage() {
  const router = useRouter();

  return (
    <PageShell
      title="Budget Alerts"
      description="Configure threshold-based budget overrun warnings"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/finance/budgets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Budgets
        </Button>
      }
    >
      <div className="max-w-2xl">
        <BudgetAlertConfig
          onSave={() => {
            router.push('/finance/budgets');
          }}
        />
      </div>
    </PageShell>
  );
}
