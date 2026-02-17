'use client';

import { PipelineStats } from '@/components/modules/business/PipelineStats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickAccessCard } from '@/components/common/quick-access-card';
import { PageShell } from '@/components/common/page-shell';
import { StaggerList } from '@/components/ui/motion';
import { ActivityFeed, ActivityItem } from '@/components/views/activity-feed';
import { useCopilotContext } from '@/hooks/use-copilot-context';
import { Building2, FileCheck, Handshake, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ActivityFeedApiItem {
  id: string;
  activityType: string;
  actorId: string | null;
  actorName: string | null;
  entityType: string | null;
  entityId: string | null;
  entityName: string | null;
  content: string | null;
  metadata: Record<string, unknown> | null;
  activityAt: string;
}

const activityTypeMap: Partial<Record<string, ActivityItem['type']>> = {
  comment: 'commented',
  note: 'updated',
  call: 'commented',
  email: 'commented',
  meeting: 'commented',
  task: 'assigned',
  demo: 'created',
  proposal: 'created',
  approval: 'approved',
  status_change: 'status_changed',
};

export default function BusinessPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  useCopilotContext({ module: 'business' });

  useEffect(() => {
    let cancelled = false;

    const fetchActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);

      try {
        const response = await fetch('/api/activity/feed?limit=12&activityCategory=crm');
        if (!response.ok) {
          throw new Error(`Failed to load activity (${response.status})`);
        }

        const payload = await response.json();
        const items: ActivityFeedApiItem[] = payload?.data?.items ?? [];

        const mapped: ActivityItem[] = items.map((item) => ({
          id: item.id,
          type: activityTypeMap[item.activityType] ?? 'updated',
          timestamp: item.activityAt,
          user: {
            id: item.actorId ?? 'system',
            name: item.actorName ?? 'System',
          },
          entity: item.entityType && item.entityId
            ? {
                type: item.entityType,
                id: item.entityId,
                name: item.entityName ?? item.entityType,
              }
            : undefined,
          metadata: {
            comment: item.content ?? undefined,
            oldValue: typeof item.metadata?.old_value === 'string' ? item.metadata.old_value : undefined,
            newValue: typeof item.metadata?.new_value === 'string' ? item.metadata.new_value : undefined,
          },
        }));

        if (!cancelled) {
          setActivities(mapped);
        }
      } catch (error) {
        if (!cancelled) {
          setActivityError(error instanceof Error ? error.message : 'Failed to load activity');
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    void fetchActivity();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell
      title="Business"
      description="Revenue + relationships management"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/business/companies">View Companies</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/business/pipeline">Open Pipeline</Link>
          </Button>
        </div>
      }
      contentClassName="space-y-6"
    >

        {/* Pipeline Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Pipeline Overview</h2>
          <PipelineStats />
        </section>

        {/* Quick Access */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAccessCard
              title="Pipeline"
              description="Sales opportunities & deals"
              href="/business/pipeline"
              icon={Handshake}
            />
            <QuickAccessCard
              title="Companies"
              description="Clients, vendors & partners"
              href="/business/companies"
              icon={Building2}
            />
            <QuickAccessCard
              title="Contracts"
              description="Active agreements"
              href="/business/contracts"
              icon={FileCheck}
            />
            <QuickAccessCard
              title="Campaigns"
              description="Email marketing"
              href="/business/campaigns"
              icon={Send}
            />
          </StaggerList>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/business/pipeline/activities">View All</Link>
            </Button>
          </div>
          {activityError ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p className="text-sm">{activityError}</p>
              </CardContent>
            </Card>
          ) : (
            <ActivityFeed
              activities={activities}
              title="Recent Activity"
              showFilters={false}
              maxHeight={360}
              loading={activityLoading}
            />
          )}
        </section>
    </PageShell>
  );
}
