'use client';

import { SmartRostering } from '@/components/scheduling/SmartRostering';

export default function SchedulingPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Scheduling</h2>
          <p className="text-muted-foreground">Manage shifts, conflicts, and resource allocation</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <SmartRostering />
      </div>
    </div>
  );
}
