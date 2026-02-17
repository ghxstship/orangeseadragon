'use client';

import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';

export default function ArApReportPage() {
  return (
    <PageShell title="AR/AP Report" description="Accounts receivable and payable aging">
      <ContextualEmptyState
        type="first-time"
        title="AR/AP Report coming soon"
        description="Accounts receivable and payable reporting is under development."
      />
    </PageShell>
  );
}
