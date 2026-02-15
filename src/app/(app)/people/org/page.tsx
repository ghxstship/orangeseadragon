'use client';

import { useRouter } from 'next/navigation';
import { OrgChart } from '@/components/people/OrgChart';
import { PageShell } from '@/components/common/page-shell';

export default function OrgChartPage() {
  const router = useRouter();

  return (
    <PageShell
      title="Organization Structure"
      description="View and manage your organizational hierarchy"
    >
      <OrgChart
        onNodeClick={(node) => {
          router.push(`/people/rosters/${node.id}`);
        }}
        onExport={() => {
          window.print();
        }}
      />
    </PageShell>
  );
}
