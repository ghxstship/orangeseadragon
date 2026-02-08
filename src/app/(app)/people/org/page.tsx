'use client';

import { OrgChart } from '@/components/people/OrgChart';

export default function OrgChartPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Structure</h2>
          <p className="text-muted-foreground">View and manage your organizational hierarchy</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <OrgChart 
          onNodeClick={(node) => console.log('Selected:', node)}
          onExport={() => console.log('Export org chart')}
        />
      </div>
    </div>
  );
}
