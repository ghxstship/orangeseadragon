'use client';

import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';

export default function CashFlowReportPage() {
  return (
    <PageShell title="Cash Flow Report" description="Track cash inflows and outflows">
      <ContextualEmptyState
        type="first-time"
        title="Cash Flow Report coming soon"
        description="Cash flow analysis and reporting is under development."
      />
    </PageShell>
  );
}
