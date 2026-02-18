'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { WorkforceAnalytics } from '@/components/people/WorkforceAnalytics';
import { useUser } from '@/hooks/auth/use-supabase';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const handleInsightAction = (insightId: string, action: string) => {
    const actionRoutes: Record<string, string> = {
      'View Details': `/people/analytics/${insightId}`,
      'Review Turnover': '/people/analytics?tab=turnover',
      'View Training': '/people/training',
      'Review Compliance': '/people/compliance',
    };
    const route = actionRoutes[action] || `/people/analytics/${insightId}`;
    router.push(route);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <WorkforceAnalytics
        key={refreshKey}
        organizationId={orgId}
        onRefresh={handleRefresh}
        onInsightAction={handleInsightAction}
      />
    </div>
  );
}
