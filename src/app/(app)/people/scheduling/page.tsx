'use client';

import { SmartRostering } from '@/components/scheduling/SmartRostering';
import { PageShell } from '@/components/common/page-shell';

export default function SchedulingPage() {
  return (
    <PageShell
      title="Smart Scheduling"
      description="Manage shifts, conflicts, and resource allocation"
    >
      <SmartRostering />
    </PageShell>
  );
}
