'use client';

import { PipelineStats } from '@/components/modules/business/PipelineStats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, FileCheck, Handshake, Send } from 'lucide-react';
import Link from 'next/link';

function QuickAccessCard({ 
  title, 
  description, 
  href, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: React.ElementType;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BusinessPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Business</h1>
            <p className="text-muted-foreground text-sm">Revenue + relationships management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/business/companies">View Companies</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/business/pipeline">Open Pipeline</Link>
            </Button>
          </div>
        </div>

        {/* Pipeline Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Pipeline Overview</h2>
          <PipelineStats />
        </section>

        {/* Quick Access */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
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
      </div>
    </div>
  );
}
