'use client';

import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';

export default function PnLReportPage() {
  return (
    <PageShell title="Profit & Loss Report" description="Revenue, expenses, and net income summary">
      <ContextualEmptyState
        type="first-time"
        title="P&L Report coming soon"
        description="Financial profit and loss reporting is under development."
      />
    </PageShell>
  );
}
