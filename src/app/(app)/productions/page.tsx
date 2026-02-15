'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { LiveClockWidget } from '@/components/productions/widgets/LiveClockWidget';
import { ActiveProductionCard } from '@/components/productions/widgets/ActiveProductionCard';
import { WeatherWidget } from '@/components/productions/widgets/WeatherWidget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents } from '@/hooks/use-events';
import { useProjects } from '@/hooks/use-projects';
import { useBudgets } from '@/hooks/use-budgets';
import { useUser } from '@/hooks/use-supabase';
import { PageShell } from '@/components/common/page-shell';
import { FadeIn, StaggerList, StaggerItem } from '@/components/ui/motion';
import { useCopilotContext } from '@/hooks/use-copilot-context';
import { cn, formatCurrency } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/error-message';
import {
  CalendarDays,
  DollarSign,
  Users,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Plus,
  MapPin,
  Clock,
  Hammer,
} from 'lucide-react';

export default function ProductionsPage() {
  const router = useRouter();
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  useCopilotContext({ module: 'productions' });

  const { data: events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents(orgId);
  const { data: projects, isLoading: projectsLoading } = useProjects(orgId);
  const { data: budgets, isLoading: budgetsLoading } = useBudgets(orgId);

  const isLoading = eventsLoading || projectsLoading || budgetsLoading;

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date();
    return events
      .filter((e: Record<string, unknown>) => {
        const start = e.start_date ? new Date(e.start_date as string) : null;
        return start && start >= now;
      })
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        new Date(a.start_date as string).getTime() - new Date(b.start_date as string).getTime()
      )
      .slice(0, 5);
  }, [events]);

  const activeProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p: Record<string, unknown>) =>
      p.status === 'active' || p.status === 'in_progress'
    );
  }, [projects]);

  const stats = useMemo(() => {
    const eventsCount = upcomingEvents.length;
    const crewCount = activeProjects.reduce((sum: number, p: Record<string, unknown>) => {
      const members = (p as Record<string, unknown>).project_members;
      return sum + (Array.isArray(members) ? members.length : 0);
    }, 0);
    const revenueMTD = budgets
      ? budgets.reduce((sum: number, b: Record<string, unknown>) => sum + (Number(b.total_amount) || 0), 0)
      : 0;
    const incidents = 0; // Placeholder — would come from incidents API

    return { eventsCount, crewCount, revenueMTD, incidents };
  }, [upcomingEvents, activeProjects, budgets]);

  if (eventsError) {
    return (
      <PageShell
        title="Productions"
        description="Live Operations & Mission Control"
      >
        <div className="flex h-full items-center justify-center p-8">
          <ContextualEmptyState
            type="error"
            title="Failed to load productions"
            description={getErrorMessage(eventsError, 'Failed to load productions')}
            actionLabel="Try again"
            onAction={() => refetchEvents()}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Productions"
      description="Live Operations & Mission Control"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetchEvents()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button onClick={() => router.push('/productions/events')}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      }
      contentClassName="space-y-8"
    >
        {/* Mission Control Row */}
        <FadeIn>
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Mission Control</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <LiveClockWidget />
            <div className="md:col-span-2">
              <ActiveProductionCard />
            </div>
            <WeatherWidget />
          </div>
        </div>
        </FadeIn>

        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard
            title="Upcoming Events"
            value={isLoading ? '...' : String(stats.eventsCount)}
            icon={CalendarDays}
            description="scheduled"
            className="cursor-pointer"
          />
          <StatCard
            title="Revenue (MTD)"
            value={isLoading ? '...' : formatCurrency(stats.revenueMTD)}
            icon={DollarSign}
            description="month to date"
          />
          <StatCard
            title="Crew Active"
            value={isLoading ? '...' : String(stats.crewCount)}
            icon={Users}
            description="across active projects"
          />
          <StatCard
            title="Open Incidents"
            value={isLoading ? '...' : String(stats.incidents)}
            icon={AlertTriangle}
            trend={stats.incidents > 0 ? { value: stats.incidents, isPositive: false } : undefined}
          />
        </StatGrid>

        {/* Lists */}
        <FadeIn delay={0.15}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Upcoming Events */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Next scheduled productions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/productions/events')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <ContextualEmptyState
                  type="no-data"
                  title="No upcoming events"
                  description="Upcoming productions will appear here."
                  className="py-8"
                />
              ) : (
                <StaggerList className="space-y-2">
                  {upcomingEvents.map((event: Record<string, unknown>) => {
                    const startDate = event.start_date ? new Date(event.start_date as string) : null;
                    return (
                      <div
                        key={event.id as string}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors group"
                        onClick={() => router.push(`/productions/events/${event.id}`)}
                      >
                        <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary text-center">
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {startDate?.toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                          <span className="text-sm font-bold leading-none">
                            {startDate?.getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.name as string}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {typeof event.venue_name === 'string' && event.venue_name && (
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                {event.venue_name}
                              </span>
                            )}
                            {startDate && (
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] h-5 px-1.5">
                          {(event.status as string) || 'scheduled'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                      </div>
                    </StaggerItem>
                    );
                  })}
                </StaggerList>
              )}
            </CardContent>
          </Card>

          {/* Active Projects / Build & Strike */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Currently in production</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/productions/build-strike')}>
                Build & Strike
                <Hammer className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : activeProjects.length === 0 ? (
                <ContextualEmptyState
                  type="no-data"
                  title="No active projects"
                  description="Active production workstreams will appear here."
                  className="py-8"
                />
              ) : (
                <StaggerList className="space-y-2">
                  {activeProjects.slice(0, 5).map((project: Record<string, unknown>) => (
                    <StaggerItem key={project.id as string}>
                    <div
                      className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors group"
                      onClick={() => router.push(`/${project.slug || `productions/${project.id}`}`)}
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground">
                          {(project.name as string)?.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name as string}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                          {(project.status as string) || 'active'}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                    </div>
                    </StaggerItem>
                  ))}
                </StaggerList>
              )}
            </CardContent>
          </Card>
        </div>
        </FadeIn>
    </PageShell>
  );
}
