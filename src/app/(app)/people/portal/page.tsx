'use client';

import { PageShell } from '@/components/common/page-shell';
import { EmployeePortal } from '@/components/people/EmployeePortal';

export default function EmployeePortalPage() {
  return (
    <PageShell title="Employee Portal" description="Self-service employee hub">
      <EmployeePortal />
    </PageShell>
  );
}
