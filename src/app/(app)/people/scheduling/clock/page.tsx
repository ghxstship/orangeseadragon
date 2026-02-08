'use client';

import { ClockInOut } from '../../components/ClockInOut';

export default function ClockPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Clock In/Out</h1>
        <p className="text-muted-foreground">Track your work hours with GPS verification</p>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <ClockInOut />
      </div>
    </div>
  );
}
