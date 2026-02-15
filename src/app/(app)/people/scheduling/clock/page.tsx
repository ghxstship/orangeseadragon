'use client';

import { ClockInOut } from '../../components/ClockInOut';
import { PageShell } from '@/components/common/page-shell';

export default function ClockPage() {
  return (
    <PageShell
      title="Clock In/Out"
      description="Track your work hours with GPS verification"
    >
      <ClockInOut />
    </PageShell>
  );
}
