'use client';

import { WorkforceAnalytics } from '@/components/people/WorkforceAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <WorkforceAnalytics 
        onRefresh={() => console.log('Refreshing analytics...')}
        onInsightAction={(id, action) => console.log('Insight action:', id, action)}
      />
    </div>
  );
}
