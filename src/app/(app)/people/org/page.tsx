'use client';

import { OrgChart } from '@/components/people/OrgChart';

export default function OrgChartPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">Organization Structure</h2>
        <p className="text-muted-foreground">View and manage your organizational hierarchy</p>
      </div>
      <OrgChart 
        onNodeClick={(node) => console.log('Selected:', node)}
        onExport={() => console.log('Export org chart')}
      />
    </div>
  );
}
