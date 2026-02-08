'use client';

import { SmartRostering } from '@/components/scheduling/SmartRostering';

export default function SchedulingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Smart Scheduling</h2>
          <p className="text-muted-foreground">Manage shifts, conflicts, and resource allocation</p>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <SmartRostering />
      </div>
    </div>
  );
}
