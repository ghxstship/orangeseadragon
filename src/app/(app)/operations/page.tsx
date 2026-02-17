'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/common/page-shell';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { StaggerList } from '@/components/ui/motion';
import { useCopilotContext } from '@/hooks/use-copilot-context';
import { useUser } from '@/hooks/use-supabase';
import { useEvents } from '@/hooks/use-events';
import { useIncidents } from '@/hooks/use-incidents';
import { useVenues } from '@/hooks/use-venues';
import { useWorkOrders } from '@/hooks/use-work-orders';
import { cn } from '@/lib/utils';
import {
  FileEdit,
  AlertTriangle,
  PlayCircle,
  Wrench,
  CalendarRange,
  MapPin,
  RefreshCw,
  Radio,
  ClipboardList,
  Users,
  Building,
  FileText,
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
  const router = useRouter();
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;

  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useEvents(organizationId);
  const { data: incidents, isLoading: incidentsLoading, refetch: refetchIncidents } = useIncidents(organizationId);
  const { data: venues, isLoading: venuesLoading, refetch: refetchVenues } = useVenues(organizationId);
  const { data: workOrders, isLoading: workOrdersLoading, refetch: refetchWorkOrders } = useWorkOrders(organizationId);

  const isLoading = eventsLoading || incidentsLoading || venuesLoading || workOrdersLoading;

  const stats = useMemo(() => {
    const now = new Date();

    const activeShowStatuses = new Set(['active', 'in_progress', 'live', 'running', 'ongoing']);
    const activeShows = (events ?? []).filter((event: Record<string, unknown>) => {
      const status = String(event.status ?? '').toLowerCase();
      if (activeShowStatuses.has(status)) return true;

      const start = event.start_date ? new Date(String(event.start_date)) : null;
      const end = event.end_date ? new Date(String(event.end_date)) : null;
      return Boolean(start && end && start <= now && end >= now);
    }).length;

    const openIncidentStatuses = new Set(['open', 'investigating', 'in_progress', 'dispatched', 'on_scene']);
    const openIncidents = (incidents ?? []).filter((incident: Record<string, unknown>) => {
      const status = String(incident.status ?? '').toLowerCase();
      return openIncidentStatuses.has(status);
    }).length;

    const activeWorkOrders = (workOrders ?? []).filter((workOrder: Record<string, unknown>) => {
      const status = String(workOrder.status ?? '').toLowerCase();
      return status !== 'completed' && status !== 'cancelled';
    }).length;

    const activeVenues = (venues ?? []).length;

    return {
      activeShows,
      openIncidents,
      activeWorkOrders,
      activeVenues,
    };
  }, [events, incidents, venues, workOrders]);

  useCopilotContext({ module: 'operations' });

  return (
    <PageShell
      title="Operations"
      description="Run of show management"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              void refetchEvents();
              void refetchIncidents();
              void refetchVenues();
              void refetchWorkOrders();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          <Button onClick={() => router.push('/operations/runsheets')}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Live Shows
          </Button>
        </div>
      }
      contentClassName="space-y-8"
    >
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard title="Active Shows" value={isLoading ? '...' : String(stats.activeShows)} icon={PlayCircle} />
          <StatCard
            title="Open Incidents"
            value={isLoading ? '...' : String(stats.openIncidents)}
            icon={AlertTriangle}
            trend={stats.openIncidents > 0 ? { value: stats.openIncidents, isPositive: false } : undefined}
          />
          <StatCard title="Work Orders" value={isLoading ? '...' : String(stats.activeWorkOrders)} icon={Wrench} />
          <StatCard title="Active Venues" value={isLoading ? '...' : String(stats.activeVenues)} icon={MapPin} />
        </StatGrid>

        {/* Navigation Cards */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Operations Modules</h2>
          <StaggerList className="grid gap-4 md:grid-cols-3">
            <NavCard
              href="/operations/runsheets"
              icon={FileEdit}
              title="Runsheets"
              description="Manage live cues and timing"
              badge={`${stats.activeShows} Active`}
            />
            <NavCard
              href="/operations/incidents"
              icon={AlertTriangle}
              title="Incidents"
              description="Track and resolve issues"
              badge={`${stats.openIncidents} Open`}
              badgeVariant={stats.openIncidents > 0 ? 'destructive' : 'secondary'}
            />
            <NavCard
              href="/operations/shows"
              icon={PlayCircle}
              title="Shows"
              description="Manage productions & stages"
              badge="Live Now"
            />
            <NavCard
              href="/operations/venues"
              icon={Building}
              title="Venues"
              description="Venue maps, zones & checkpoints"
            />
            <NavCard
              href="/operations/events"
              icon={Users}
              title="Event Ops"
              description="Crew calls, talent & runsheets"
            />
            <NavCard
              href="/operations/work-orders"
              icon={Wrench}
              title="Work Orders"
              description="Maintenance and repair tasks"
            />
            <NavCard
              href="/operations/resource-bookings"
              icon={CalendarRange}
              title="Resource Bookings"
              description="Tentative and placeholder crew allocations"
            />
            <NavCard
              href="/operations/comms"
              icon={Radio}
              title="Communications"
              description="Radio, weather & daily reports"
            />
            <NavCard
              href="/operations/daily-reports"
              icon={FileText}
              title="Daily Reports"
              description="End-of-day summaries"
            />
            <NavCard
              href="/operations/crew-checkins/kiosk"
              icon={ClipboardList}
              title="Crew Check-In"
              description="Kiosk mode for on-site check-in"
            />
          </StaggerList>
        </div>
    </PageShell>
  );
}
