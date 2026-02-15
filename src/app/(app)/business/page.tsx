'use client';

import { PipelineStats } from '@/components/modules/business/PipelineStats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickAccessCard } from '@/components/common/quick-access-card';
import { PageShell } from '@/components/common/page-shell';
import { StaggerList } from '@/components/ui/motion';
import { useCopilotContext } from '@/hooks/use-copilot-context';
import { Building2, FileCheck, Handshake, Send } from 'lucide-react';
import Link from 'next/link';

export default function BusinessPage() {
  useCopilotContext({ module: 'business' });

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
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p className="text-sm">Activity timeline will appear here once you start logging activities.</p>
            </CardContent>
          </Card>
        </section>
    </PageShell>
  );
}
