'use client';

import { CertificationDashboard } from '../../components/CertificationDashboard';
import { PageShell } from '@/components/common/page-shell';

export default function CompliancePage() {
  return (
    <PageShell
      title="Certification Compliance"
      description="Track certifications, expirations, and compliance status"
    >
      <CertificationDashboard />
    </PageShell>
  );
}
