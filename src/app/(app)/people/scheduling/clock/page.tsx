'use client';

import { PageHeader } from '@/components/common/page-header';
import { ClockInOut } from '../../components/ClockInOut';

export default function ClockPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clock In/Out"
        description="Track your work hours with GPS verification"
      />
      <ClockInOut />
    </div>
  );
}
