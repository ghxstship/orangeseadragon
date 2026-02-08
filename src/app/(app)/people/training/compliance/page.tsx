'use client';

import { PageHeader } from '@/components/common/page-header';
import { CertificationDashboard } from '../../components/CertificationDashboard';

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Certification Compliance"
        description="Track certifications, expirations, and compliance status"
      />
      <CertificationDashboard />
    </div>
  );
}
