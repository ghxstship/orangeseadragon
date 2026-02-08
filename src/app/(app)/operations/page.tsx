'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import {
  FileEdit,
  AlertTriangle,
  PlayCircle,
  Wrench,
  MapPin,
} from 'lucide-react';

interface NavCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function NavCard({ href, icon: Icon, title, description, badge, badgeVariant = 'secondary' }: NavCardProps) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer hover:bg-accent/50 transition-all border-border h-full">
        <CardContent className="flex flex-col justify-between h-full p-4 gap-4">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            {badge && (
              <Badge variant={badgeVariant} className="text-[10px] font-bold">
                {badge}
              </Badge>
            )}
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function OperationsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — Layout C */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
            <p className="text-muted-foreground">Run of show management</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard title="Active Shows" value="3" icon={PlayCircle} />
          <StatCard title="Open Incidents" value="2" icon={AlertTriangle} trend={{ value: 50, isPositive: true }} description="from yesterday" />
          <StatCard title="Work Orders" value="8" icon={Wrench} />
          <StatCard title="Active Venues" value="5" icon={MapPin} />
        </StatGrid>

        {/* Navigation Cards */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Operations Modules</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <NavCard
              href="/operations/runsheets"
              icon={FileEdit}
              title="Runsheets"
              description="Manage live cues and timing"
              badge="3 Active"
            />
            <NavCard
              href="/operations/incidents"
              icon={AlertTriangle}
              title="Incidents"
              description="Track and resolve issues"
              badge="2 Open"
              badgeVariant="destructive"
            />
            <NavCard
              href="/operations/shows"
              icon={PlayCircle}
              title="Shows"
              description="Manage productions & stages"
              badge="Live Now"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
