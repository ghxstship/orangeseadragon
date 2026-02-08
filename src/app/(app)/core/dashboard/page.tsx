"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardGrid, DashboardGridSkeleton } from "@/components/dashboard/DashboardGrid";
import { DashboardLayout as DashboardLayoutType, defaultDashboardLayout } from "@/lib/dashboard/widget-registry";
import { DashboardLayout } from "@/lib/layouts/DashboardLayout";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { useUser } from "@/hooks/use-supabase";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useEvents } from "@/hooks/use-events";
import { useBudgets } from "@/hooks/use-budgets";
import {
  FolderOpen,
  CheckSquare,
  Calendar,
  DollarSign,
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

export default function DashboardPage() {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;

  const { data: projects, isLoading: projectsLoading } = useProjects(organizationId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(organizationId);
  const { data: events, isLoading: eventsLoading } = useEvents(organizationId);
  const { data: budgets, isLoading: budgetsLoading } = useBudgets(organizationId);

  const [layout, setLayout] = useState<DashboardLayoutType>(defaultDashboardLayout);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("month");
  const [error, setError] = useState<Error | null>(null);

  const isDataLoading = projectsLoading || tasksLoading || eventsLoading || budgetsLoading;

  const kpiStats = useMemo(() => {
    const activeProjects = projects?.filter((p) => p.status === "active").length ?? 0;
    const openTasks = tasks?.filter((t) => t.status !== "done" && t.status !== "cancelled").length ?? 0;
    const completedTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
    const totalTasks = tasks?.length ?? 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const eventsThisWeek = events?.filter((e) => {
      const dateStr = e.start_date ?? e.created_at;
      if (!dateStr) return false;
      const eventDate = new Date(dateStr);
      return eventDate >= now && eventDate <= weekEnd;
    }).length ?? 0;

    const totalBudget = budgets?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) ?? 0;
    const burnedBudget = budgets?.reduce((sum, b) => sum + (Number(b.total_amount) * 0.6 || 0), 0) ?? 0;
    const budgetHealthPct = totalBudget > 0 ? Math.round(((totalBudget - burnedBudget) / totalBudget) * 100) : 100;

    return {
      activeProjects,
      openTasks,
      eventsThisWeek,
      budgetHealthPct,
      taskCompletionRate,
      totalBudget,
    };
  }, [projects, tasks, events, budgets]);

  useEffect(() => {
    async function fetchLayout() {
      try {
        const response = await fetch("/api/dashboard-layouts");
        const result = await response.json();

        if (result.data && result.data.length > 0) {
          const defaultLayout = result.data.find((l: DashboardLayoutType) => l.isDefault) || result.data[0];
          setLayout({
            ...defaultLayout,
            widgets: defaultLayout.widgets || [],
          });
          setLayoutId(defaultLayout.id);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard layout:", err);
        setError(err instanceof Error ? err : new Error("Failed to load dashboard"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchLayout();
  }, []);

  const handleLayoutChange = useCallback((newLayout: DashboardLayoutType) => {
    setLayout(newLayout);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard-layouts");
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const defaultLayout = result.data.find((l: DashboardLayoutType) => l.isDefault) || result.data[0];
        setLayout({ ...defaultLayout, widgets: defaultLayout.widgets || [] });
        setLayoutId(defaultLayout.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEditToggle = useCallback(async () => {
    if (isEditing) {
      try {
        if (layoutId) {
          await fetch(`/api/dashboard-layouts/${layoutId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ widgets: layout.widgets, columns: layout.columns }),
          });
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
          const result = await response.json();
          if (result.data?.id) {
            setLayoutId(result.data.id);
          }
        }
      } catch (err) {
        console.error("Failed to save dashboard layout:", err);
      }
    }
    setIsEditing(!isEditing);
  }, [isEditing, layout, layoutId]);

  if (error && !isLoading) {
    return (
      <DashboardLayout
        config={dashboardConfig}
        onRefresh={handleRefresh}
      >
        <div className="col-span-full">
          <ContextualEmptyState
            type="error"
            title="Failed to load dashboard"
            description={error.message}
            actionLabel="Try again"
            onAction={handleRefresh}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      config={dashboardConfig}
      loading={isLoading && isDataLoading}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onRefresh={handleRefresh}
      onCustomize={() => setIsEditing(!isEditing)}
    >
      {/* KPI Cards Row */}
      <div className="col-span-full">
        <StatGrid columns={4}>
          <StatCard
            title="Open Tasks"
            value={isDataLoading ? "..." : String(kpiStats.openTasks)}
            icon={CheckSquare}
            trend={kpiStats.taskCompletionRate > 50 ? { value: kpiStats.taskCompletionRate, isPositive: true } : undefined}
            description="across all projects"
          />
          <StatCard
            title="Active Projects"
            value={isDataLoading ? "..." : String(kpiStats.activeProjects)}
            icon={FolderOpen}
            description="in progress"
          />
          <StatCard
            title="Events This Week"
            value={isDataLoading ? "..." : String(kpiStats.eventsThisWeek)}
            icon={Calendar}
            description="upcoming"
          />
          <StatCard
            title="Budget Health"
            value={isDataLoading ? "..." : `${kpiStats.budgetHealthPct}%`}
            icon={DollarSign}
            trend={
              kpiStats.budgetHealthPct >= 50
                ? { value: kpiStats.budgetHealthPct, isPositive: true }
                : { value: 100 - kpiStats.budgetHealthPct, isPositive: false }
            }
            description={kpiStats.budgetHealthPct >= 70 ? "on track" : kpiStats.budgetHealthPct >= 40 ? "at risk" : "over budget"}
          />
        </StatGrid>
      </div>

      {/* Widget Grid */}
      <div className="col-span-full">
        {isLoading ? (
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
