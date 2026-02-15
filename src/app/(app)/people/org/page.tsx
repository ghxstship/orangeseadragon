'use client';

import { OrgChart } from '@/components/people/OrgChart';
import { PageShell } from '@/components/common/page-shell';

export default function OrgChartPage() {
  return (
    <PageShell
      title="Organization Structure"
      description="View and manage your organizational hierarchy"
    >
      <OrgChart
        onNodeClick={() => { /* TODO: implement node click */ }}
        onExport={() => { /* TODO: implement export */ }}
      />
    </PageShell>
  );
}
