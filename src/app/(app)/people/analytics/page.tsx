'use client';

import * as React from 'react';
import { WorkforceAnalytics } from '@/components/people/WorkforceAnalytics';
import { useUser } from '@/hooks/use-supabase';

export default function AnalyticsPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="container mx-auto py-6 px-4">
      <WorkforceAnalytics
        key={refreshKey}
        organizationId={orgId}
        onRefresh={handleRefresh}
        onInsightAction={() => { /* TODO: implement insight actions */ }}
      />
    </div>
  );
}
