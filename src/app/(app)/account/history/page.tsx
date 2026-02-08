'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function HistoryPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Activity History</h1>
        <p className="text-muted-foreground">View your account activity and audit log</p>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">Activity log will appear here once events are recorded.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
