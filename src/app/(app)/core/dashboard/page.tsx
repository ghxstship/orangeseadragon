"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardGrid, DashboardGridSkeleton } from "@/components/dashboard/DashboardGrid";
import { DashboardLayout as DashboardLayoutType, defaultDashboardLayout } from "@/lib/dashboard/widget-registry";
import { DashboardLayout } from "@/lib/layouts/DashboardLayout";
import { PageErrorState } from "@/components/common/contextual-empty-state";
import { useUser } from "@/hooks/use-supabase";
import { useDashboardSnapshot } from "@/hooks/use-dashboard-snapshot";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoGrid, BentoItem, BentoItemHeader, BentoItemTitle, BentoItemContent, BentoItemValue } from "@/components/ui/bento-grid";
import { FadeIn, StaggerList, StaggerItem, AnimatedCounter } from "@/components/ui/motion";
import { GlassCard } from "@/components/ui/glass-card";
import { useCopilotContext } from "@/hooks/use-copilot-context";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE } from "@/lib/config";
import { getErrorMessage, throwApiErrorResponse } from "@/lib/api/error-message";
import {
  FolderOpen,
  CheckSquare,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  FileText,
  Briefcase,
  ChevronRight,
  Timer,
  Circle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import type { DashboardLayoutConfig } from "@/lib/layouts/types";

const dashboardConfig: DashboardLayoutConfig = {
  title: "Command Center",
  description: "Your operational overview across all modules",
  widgets: [],
  layout: { columns: 12, gap: 16, responsive: true },
  personalization: { enabled: true, allowReorder: true, allowResize: true, allowHide: true },
  refresh: { enabled: true, intervalMs: 300000 },
  dateRange: { enabled: true, default: "month", presets: ["Last 7 Days", "Last 30 Days", "Last 90 Days"] },
};

const statusColors: Record<string, string> = {
  active: "bg-semantic-success/10 text-semantic-success border-semantic-success/20",
  planning: "bg-semantic-info/10 text-semantic-info border-semantic-info/20",
  on_hold: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const priorityIndicators: Record<string, string> = {
  urgent: "text-destructive",
  high: "text-semantic-warning",
  medium: "text-primary",
  low: "text-muted-foreground",
};

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  description: string;
}

const quickActions: QuickActionItem[] = [
  { id: "task", label: "Create Task", icon: CheckSquare, href: "/core/tasks/new", description: "Add a new task to any project" },
  { id: "time", label: "Log Time", icon: Clock, href: "/core/tasks/my-timesheet", description: "Record time against a project" },
  { id: "expense", label: "Submit Expense", icon: FileText, href: "/finance/expenses/new", description: "Submit a new expense report" },
  { id: "deal", label: "Create Deal", icon: Briefcase, href: "/business/pipeline/new", description: "Start a new deal in the pipeline" },
];

interface DashboardLayoutsResponse {
  data?: Record<string, unknown>[];
}

function normalizeDashboardLayout(rawLayout: Record<string, unknown>): DashboardLayoutType {
  return {
    id: String(rawLayout.id ?? "default"),
    name: typeof rawLayout.name === "string" ? rawLayout.name : "Dashboard",
    description: typeof rawLayout.description === "string" ? rawLayout.description : undefined,
    widgets: Array.isArray(rawLayout.widgets) ? (rawLayout.widgets as DashboardLayoutType["widgets"]) : [],
    columns: typeof rawLayout.columns === "number" ? rawLayout.columns : 12,
    isDefault: typeof rawLayout.isDefault === "boolean"
      ? rawLayout.isDefault
      : rawLayout.is_default === true,
    isShared: typeof rawLayout.isShared === "boolean"
      ? rawLayout.isShared
      : rawLayout.is_shared === true,
    userId: typeof rawLayout.userId === "string"
      ? rawLayout.userId
      : typeof rawLayout.user_id === "string"
        ? rawLayout.user_id
        : undefined,
    organizationId: typeof rawLayout.organizationId === "string"
      ? rawLayout.organizationId
      : typeof rawLayout.organization_id === "string"
        ? rawLayout.organization_id
        : undefined,
    createdAt: typeof rawLayout.createdAt === "string"
      ? rawLayout.createdAt
      : typeof rawLayout.created_at === "string"
        ? rawLayout.created_at
        : undefined,
    updatedAt: typeof rawLayout.updatedAt === "string"
      ? rawLayout.updatedAt
      : typeof rawLayout.updated_at === "string"
        ? rawLayout.updated_at
        : undefined,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  useCopilotContext({ module: 'dashboard' });
  const organizationId = user?.user_metadata?.organization_id || null;

  const { data: snapshot, isLoading: snapshotLoading, refetch: refetchSnapshot } = useDashboardSnapshot(organizationId);
  const kpi = snapshot?.kpi;
  const projectStatusDistribution = snapshot?.projectStatusDistribution ?? [];
  const myTasksDueToday = snapshot?.myTasksDueToday ?? [];
  const overdueTasks = snapshot?.overdueTasks ?? [];
  const upcomingEvents = snapshot?.upcomingEvents ?? [];
  const budgets = snapshot?.budgets ?? [];

  const {
    data: dashboardLayouts = [],
    isLoading: layoutLoading,
    error: layoutQueryError,
    refetch: refetchLayouts,
  } = useQuery({
    queryKey: ["dashboard-layouts", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<DashboardLayoutType[]> => {
      const response = await fetch("/api/dashboard-layouts");
      if (!response.ok) {
        await throwApiErrorResponse(response, "Failed to load dashboard");
      }

      const result = (await response.json()) as DashboardLayoutsResponse;
      const payload = Array.isArray(result.data) ? result.data : [];
      return payload.map(normalizeDashboardLayout);
    },
  });

  const [layout, setLayout] = useState<DashboardLayoutType>(defaultDashboardLayout);
  const [isEditing, setIsEditing] = useState(false);
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("month");
  const [error, setError] = useState<Error | null>(null);

  const isDataLoading = userLoading || snapshotLoading;
  const effectiveError = error ?? (layoutQueryError ? new Error(getErrorMessage(layoutQueryError, "Failed to load dashboard")) : null);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    if (dashboardLayouts.length === 0) {
      setLayout(defaultDashboardLayout);
      setLayoutId(null);
      return;
    }

    const preferredLayout = dashboardLayouts.find((candidate) => candidate.isDefault) ?? dashboardLayouts[0];
    setLayout({
      ...preferredLayout,
      widgets: preferredLayout.widgets || [],
    });
    setLayoutId(preferredLayout.id);
  }, [dashboardLayouts, isEditing]);

  const kpiStats = useMemo(() => {
    const totalProjects = kpi?.totalProjects ?? 0;
    const activeProjects = kpi?.activeProjects ?? 0;
    const totalTasks = kpi?.totalTasks ?? 0;
    const openTasks = kpi?.openTasks ?? 0;
    const completedTasks = kpi?.completedTasks ?? 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalBudget = kpi?.totalBudget ?? 0;
    const budgetSpent = kpi?.budgetSpent ?? 0;
    const budgetHealthPct = totalBudget > 0 ? Math.round(((totalBudget - budgetSpent) / totalBudget) * 100) : 100;

    return {
      activeProjects,
      openTasks,
      eventsThisWeek: kpi?.eventsThisWeek ?? 0,
      budgetHealthPct,
      taskCompletionRate,
      totalBudget,
      teamUtilization: kpi?.teamUtilization ?? (totalProjects > 0 ? Math.min(100, Math.round((activeProjects / totalProjects) * 100)) : 0),
      revenueMTD: kpi?.revenueMTD ?? 0,
      totalProjects,
    };
  }, [kpi]);

  const handleLayoutChange = useCallback((newLayout: DashboardLayoutType) => {
    setLayout(newLayout);
  }, []);

  const handleRefresh = useCallback(async () => {
    setError(null);
    try {
      const [layoutResult, snapshotResult] = await Promise.all([
        refetchLayouts(),
        refetchSnapshot(),
      ]);

      if (layoutResult.error) {
        throw layoutResult.error;
      }

      if (snapshotResult.error) {
        throw snapshotResult.error;
      }
    } catch (err) {
      setError(new Error(getErrorMessage(err, "Failed to refresh")));
    }
  }, [refetchLayouts, refetchSnapshot]);

  const handleEditToggle = useCallback(async () => {
    if (isEditing) {
      try {
        if (layoutId) {
          const response = await fetch(`/api/dashboard-layouts/${layoutId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ widgets: layout.widgets, columns: layout.columns }),
          });
          if (!response.ok) {
            await throwApiErrorResponse(response, "Failed to save dashboard layout");
          }
        } else {
          const response = await fetch("/api/dashboard-layouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "My Dashboard",
              widgets: layout.widgets,
              columns: layout.columns,
              is_default: true,
            }),
          });
          if (!response.ok) {
            await throwApiErrorResponse(response, "Failed to create dashboard layout");
          }

          const result = await response.json();
          if (result.data?.id) {
            setLayoutId(result.data.id);
          }
        }

        await refetchLayouts();
      } catch (err) {
        console.error("Failed to save dashboard layout:", err);
        setError(new Error(getErrorMessage(err, "Failed to save dashboard layout")));
      }
    }
    setIsEditing(!isEditing);
  }, [isEditing, layout, layoutId, refetchLayouts]);

  if (effectiveError && !layoutLoading) {
    return (
      <DashboardLayout
        config={dashboardConfig}
        onRefresh={handleRefresh}
      >
        <div className="col-span-full">
          <PageErrorState
            title="Failed to load dashboard"
            description={getErrorMessage(effectiveError, "Failed to load dashboard")}
            error={effectiveError}
            onRetry={handleRefresh}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      config={dashboardConfig}
      loading={layoutLoading || isDataLoading}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onRefresh={handleRefresh}
      onCustomize={() => setIsEditing(!isEditing)}
    >
      {/* ── Bento KPI Grid ─────────────────────────────────── */}
      <div className="col-span-full">
        <FadeIn>
          <BentoGrid columns={6} gap="md">
            {/* Large hero KPI — Open Tasks */}
            <BentoItem colSpan={2} rowSpan={2} variant="glass" interactive onClick={() => router.push("/core/tasks/my-tasks")}>
              <BentoItemHeader>
                <BentoItemTitle>Open Tasks</BentoItemTitle>
                <div className="p-2 rounded-xl bg-muted border border-border text-muted-foreground">
                  <CheckSquare className="h-4 w-4" />
                </div>
              </BentoItemHeader>
              <BentoItemContent>
                <BentoItemValue>
                  {isDataLoading ? "..." : <AnimatedCounter value={kpiStats.openTasks} />}
                </BentoItemValue>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-2">across all projects</p>
                {kpiStats.taskCompletionRate > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Completion</span>
                      <span className="text-xs font-mono font-bold">{kpiStats.taskCompletionRate}%</span>
                    </div>
                    <Progress value={kpiStats.taskCompletionRate} className="h-2" />
                  </div>
                )}
              </BentoItemContent>
            </BentoItem>

            {/* Active Projects */}
            <BentoItem colSpan={1} variant="default" interactive onClick={() => router.push("/productions")}>
              <BentoItemHeader>
                <BentoItemTitle>Active Projects</BentoItemTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </BentoItemHeader>
              <BentoItemContent>
                <BentoItemValue>
                  {isDataLoading ? "..." : <AnimatedCounter value={kpiStats.activeProjects} />}
                </BentoItemValue>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1">in progress</p>
              </BentoItemContent>
            </BentoItem>

            {/* Events This Week */}
            <BentoItem colSpan={1} variant="default" interactive onClick={() => router.push("/core/calendar")}>
              <BentoItemHeader>
                <BentoItemTitle>Events This Week</BentoItemTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </BentoItemHeader>
              <BentoItemContent>
                <BentoItemValue>
                  {isDataLoading ? "..." : <AnimatedCounter value={kpiStats.eventsThisWeek} />}
                </BentoItemValue>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1">upcoming</p>
              </BentoItemContent>
            </BentoItem>

            {/* Revenue MTD — wide */}
            <BentoItem colSpan={2} variant="gradient" interactive onClick={() => router.push("/finance")}>
              <BentoItemHeader>
                <BentoItemTitle>Revenue MTD</BentoItemTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </BentoItemHeader>
              <BentoItemContent>
                <BentoItemValue className="text-2xl">
                  {isDataLoading ? "..." : (
                    <AnimatedCounter
                      value={kpiStats.revenueMTD}
                      formatFn={(n) => new Intl.NumberFormat(DEFAULT_LOCALE, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)}
                    />
                  )}
                </BentoItemValue>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1">month to date</p>
              </BentoItemContent>
            </BentoItem>

            {/* Budget Health */}
            <BentoItem colSpan={1} variant="default" interactive onClick={() => router.push("/finance/budgets")}>
              <BentoItemHeader>
                <BentoItemTitle>Budget Health</BentoItemTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </BentoItemHeader>
              <BentoItemContent>
                <BentoItemValue>
                  {isDataLoading ? "..." : <><AnimatedCounter value={kpiStats.budgetHealthPct} suffix="%" /></>}
                </BentoItemValue>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1">
                  {kpiStats.budgetHealthPct >= 70 ? "on track" : kpiStats.budgetHealthPct >= 40 ? "at risk" : "over budget"}
                </p>
              </BentoItemContent>
            </BentoItem>

            {/* Team Utilization */}
            <BentoItem colSpan={1} variant="default" interactive onClick={() => router.push("/people")}>
              <BentoItemHeader>
                <BentoItemTitle>Team Utilization</BentoItemTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </BentoItemHeader>
              <BentoItemContent>
                <BentoItemValue>
                  {isDataLoading ? "..." : <AnimatedCounter value={kpiStats.teamUtilization} suffix="%" />}
                </BentoItemValue>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1">capacity used</p>
              </BentoItemContent>
            </BentoItem>
          </BentoGrid>
        </FadeIn>
      </div>

      {/* ── My Day + Quick Actions (Bento) ────────────────── */}
      <div className="col-span-full">
        <FadeIn delay={0.1}>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {/* My Day — Tasks Due Today */}
            <GlassCard variant="default" hover={false} padding="none" className="lg:col-span-2">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">My Day</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/core/tasks/my-tasks")} className="text-xs">
                    View All <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                {/* Overdue Alert */}
                {overdueTasks.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <span className="text-xs font-medium text-destructive">
                      {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? "s" : ""} need attention
                    </span>
                    <Button variant="ghost" size="sm" className="ml-auto text-xs text-destructive h-6 px-2" onClick={() => router.push("/core/tasks/my-tasks")}>
                      Review
                    </Button>
                  </div>
                )}

                {/* Tasks Due Today */}
                {isDataLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : myTasksDueToday.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <CheckSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">No tasks due today</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Tasks due today will appear here</p>
                  </div>
                ) : (
                  <StaggerList className="space-y-1">
                    {myTasksDueToday.map((task) => (
                      <StaggerItem key={task.id as string}>
                        <div
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                          onClick={() => router.push(`/core/tasks/${task.id}`)}
                        >
                          <Circle className={cn("h-3 w-3 flex-shrink-0", priorityIndicators[(task.priority as string) || "medium"])} />
                          <span className="text-sm font-medium truncate flex-1">{task.title as string}</span>
                          {task.status === "in_progress" && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                              <Timer className="h-2.5 w-2.5 mr-0.5" />
                              In Progress
                            </Badge>
                          )}
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                )}

                {/* Upcoming Events Mini */}
                {upcomingEvents.length > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Upcoming Events</span>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => router.push("/core/calendar")}>
                          Calendar <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {upcomingEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id as string}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                            onClick={() => router.push(`/core/calendar`)}
                          >
                            <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="text-sm truncate flex-1">{event.name as string}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                              {(event.start_date as string) ? new Date(event.start_date as string).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "TBD"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard variant="default" hover={false} padding="none">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5">
                <StaggerList className="space-y-2" initialDelay={0.15}>
                  {quickActions.map((action) => (
                    <StaggerItem key={action.id}>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3 px-4 group"
                        onClick={() => router.push(action.href)}
                      >
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <action.icon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{action.label}</div>
                          <div className="text-[10px] text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    </StaggerItem>
                  ))}
                </StaggerList>
              </CardContent>
            </GlassCard>
          </div>
        </FadeIn>
      </div>

      {/* ── Charts Row (Bento) ────────────────────────────── */}
      <div className="col-span-full">
        <FadeIn delay={0.2}>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Project Status Distribution */}
            <GlassCard variant="default" hover={false} padding="none">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Project Status</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push("/productions")}>
                    View All <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {isDataLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : projectStatusDistribution.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <FolderOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No projects yet</p>
                  </div>
                ) : (
                  <StaggerList className="space-y-3">
                    {projectStatusDistribution.map(({ status, count }) => {
                      const total = kpiStats.totalProjects || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <StaggerItem key={status}>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-[9px] h-5 px-1.5 capitalize", statusColors[status])}>
                                  {status.replace(/_/g, " ")}
                                </Badge>
                              </div>
                              <span className="text-xs font-mono font-bold">{count}</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerList>
                )}
              </CardContent>
            </GlassCard>

            {/* Budget Health Overview */}
            <GlassCard variant="default" hover={false} padding="none">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Budget Health</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push("/finance/budgets")}>
                    View All <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {isDataLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : !budgets || budgets.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <DollarSign className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No budgets yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Budget burn rates will appear here</p>
                  </div>
                ) : (
                  <StaggerList className="space-y-3">
                    {(budgets as Record<string, unknown>[]).slice(0, 5).map((budget) => {
                      const total = Number(budget.total_amount) || 0;
                      const burned = Number((budget as Record<string, unknown>).spent_amount) || 0;
                      const burnPct = total > 0 ? Math.round((burned / total) * 100) : 0;
                      const isAtRisk = burnPct > 80;
                      const isOverBudget = burnPct > 100;
                      return (
                        <StaggerItem key={budget.id as string}>
                          <div
                            className="space-y-1.5 cursor-pointer hover:bg-accent/30 rounded-lg p-2 -mx-2 transition-colors"
                            onClick={() => router.push(`/finance/budgets/${budget.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{budget.name as string}</span>
                              <span className={cn(
                                "text-xs font-mono font-bold",
                                isOverBudget ? "text-destructive" : isAtRisk ? "text-semantic-warning" : "text-semantic-success"
                              )}>
                                {burnPct}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(burnPct, 100)}
                              className={cn(
                                "h-1.5",
                                isOverBudget && "[&>div]:bg-destructive",
                                isAtRisk && !isOverBudget && "[&>div]:bg-semantic-warning"
                              )}
                            />
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-40">
                              <span>{new Intl.NumberFormat(DEFAULT_LOCALE, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(burned)} burned</span>
                              <span>{new Intl.NumberFormat(DEFAULT_LOCALE, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(total)} total</span>
                            </div>
                          </div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerList>
                )}
              </CardContent>
            </GlassCard>
          </div>
        </FadeIn>
      </div>

      {/* Widget Grid */}
      <div className="col-span-full">
        {layoutLoading ? (
          <DashboardGridSkeleton />
        ) : (
          <DashboardGrid
            layout={layout}
            onLayoutChange={handleLayoutChange}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
