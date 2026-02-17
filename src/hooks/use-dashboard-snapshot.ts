"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

type TaskSnapshot = Pick<
  Database["public"]["Tables"]["tasks"]["Row"],
  "id" | "title" | "status" | "priority" | "due_date"
>;

type EventSnapshot = Pick<
  Database["public"]["Tables"]["events"]["Row"],
  "id" | "name" | "start_date" | "created_at"
>;

type BudgetSnapshot = Pick<
  Database["public"]["Tables"]["budgets"]["Row"],
  "id" | "name" | "status" | "total_amount" | "created_at"
> & { spent_amount?: number };

interface DashboardSnapshot {
  kpi: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    eventsThisWeek: number;
    totalBudget: number;
    activeBudgetTotal: number;
    budgetSpent: number;
    revenueMTD: number;
    teamUtilization: number;
  };
  projectStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  myTasksDueToday: TaskSnapshot[];
  overdueTasks: TaskSnapshot[];
  upcomingEvents: EventSnapshot[];
  budgets: BudgetSnapshot[];
}

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  kpi: {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    openTasks: 0,
    completedTasks: 0,
    eventsThisWeek: 0,
    totalBudget: 0,
    activeBudgetTotal: 0,
    budgetSpent: 0,
    revenueMTD: 0,
    teamUtilization: 0,
  },
  projectStatusDistribution: [],
  myTasksDueToday: [],
  overdueTasks: [],
  upcomingEvents: [],
  budgets: [],
};

export function useDashboardSnapshot(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["dashboard-snapshot", organizationId],
    enabled: !!organizationId,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<DashboardSnapshot> => {
      if (!organizationId) return EMPTY_SNAPSHOT;

      const now = new Date();
      const nowIso = now.toISOString();
      const weekEndIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        projectsRes,
        totalTasksCountRes,
        openTasksCountRes,
        completedTasksCountRes,
        tasksDueTodayRes,
        overdueTasksRes,
        eventsThisWeekCountRes,
        eventsThisWeekFallbackCountRes,
        upcomingEventsRes,
        upcomingEventsFallbackRes,
        budgetsSummaryRes,
        budgetsListRes,
        budgetLineItemsRes,
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("status")
          .eq("organization_id", organizationId)
          .is("deleted_at", null),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .is("deleted_at", null),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .not("status", "in", "(done,cancelled)"),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .eq("status", "done"),
        supabase
          .from("tasks")
          .select("id, title, status, priority, due_date")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .gte("due_date", todayStart.toISOString())
          .lt("due_date", tomorrowStart.toISOString())
          .not("status", "in", "(done,cancelled)")
          .order("due_date", { ascending: true })
          .limit(5),
        supabase
          .from("tasks")
          .select("id, title, status, priority, due_date")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .lt("due_date", nowIso)
          .not("status", "in", "(done,cancelled)")
          .order("due_date", { ascending: true })
          .limit(5),
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .gte("start_date", nowIso)
          .lte("start_date", weekEndIso),
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .is("start_date", null)
          .gte("created_at", nowIso)
          .lte("created_at", weekEndIso),
        supabase
          .from("events")
          .select("id, name, start_date, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .gte("start_date", nowIso)
          .order("start_date", { ascending: true })
          .limit(8),
        supabase
          .from("events")
          .select("id, name, start_date, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .is("start_date", null)
          .gte("created_at", nowIso)
          .order("created_at", { ascending: true })
          .limit(8),
        supabase
          .from("budgets")
          .select("status, total_amount, created_at")
          .eq("organization_id", organizationId),
        supabase
          .from("budgets")
          .select("id, name, status, total_amount, created_at")
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("budget_line_items")
          .select("budget_id, actual_amount"),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (totalTasksCountRes.error) throw totalTasksCountRes.error;
      if (openTasksCountRes.error) throw openTasksCountRes.error;
      if (completedTasksCountRes.error) throw completedTasksCountRes.error;
      if (tasksDueTodayRes.error) throw tasksDueTodayRes.error;
      if (overdueTasksRes.error) throw overdueTasksRes.error;
      if (eventsThisWeekCountRes.error) throw eventsThisWeekCountRes.error;
      if (eventsThisWeekFallbackCountRes.error) throw eventsThisWeekFallbackCountRes.error;
      if (upcomingEventsRes.error) throw upcomingEventsRes.error;
      if (upcomingEventsFallbackRes.error) throw upcomingEventsFallbackRes.error;
      if (budgetsSummaryRes.error) throw budgetsSummaryRes.error;
      if (budgetsListRes.error) throw budgetsListRes.error;
      // budget_line_items may not exist yet — non-fatal
      const budgetLineItems = budgetLineItemsRes.error ? [] : (budgetLineItemsRes.data ?? []);

      const projectStatuses = projectsRes.data ?? [];
      const totalProjects = projectStatuses.length;
      const activeProjects = projectStatuses.filter((project) => project.status === "active").length;

      const statusCounts = new Map<string, number>();
      projectStatuses.forEach((project) => {
        const status = project.status ?? "unknown";
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
      });

      const projectStatusDistribution = Array.from(statusCounts.entries())
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

      const totalTasks = totalTasksCountRes.count ?? 0;
      const openTasks = openTasksCountRes.count ?? 0;
      const completedTasks = completedTasksCountRes.count ?? 0;
      const eventsThisWeek =
        (eventsThisWeekCountRes.count ?? 0) + (eventsThisWeekFallbackCountRes.count ?? 0);

      const budgetsSummary = budgetsSummaryRes.data ?? [];
      const totalBudget = budgetsSummary.reduce(
        (sum, budget) => sum + (Number(budget.total_amount) || 0),
        0
      );
      const activeBudgetTotal = budgetsSummary
        .filter((budget) => budget.status === "active")
        .reduce((sum, budget) => sum + (Number(budget.total_amount) || 0), 0);

      // Aggregate actual spend from budget_line_items per budget
      const spentByBudget = new Map<string, number>();
      budgetLineItems.forEach((item: { budget_id: string; actual_amount: number | null }) => {
        const prev = spentByBudget.get(item.budget_id) ?? 0;
        spentByBudget.set(item.budget_id, prev + (Number(item.actual_amount) || 0));
      });
      const budgetSpent = Array.from(spentByBudget.values()).reduce((s, v) => s + v, 0);
      const revenueMTD = budgetsSummary
        .filter((budget) => {
          if (!budget.created_at) return false;
          return new Date(budget.created_at) >= monthStart;
        })
        .reduce((sum, budget) => sum + (Number(budget.total_amount) || 0), 0);

      const teamUtilization = totalProjects > 0
        ? Math.min(100, Math.round((activeProjects / totalProjects) * 100))
        : 0;

      const upcomingEvents = [
        ...(upcomingEventsRes.data ?? []),
        ...(upcomingEventsFallbackRes.data ?? []),
      ]
        .sort((a, b) => {
          const aDate = new Date(a.start_date ?? a.created_at ?? 0).getTime();
          const bDate = new Date(b.start_date ?? b.created_at ?? 0).getTime();
          return aDate - bDate;
        })
        .slice(0, 4);

      return {
        kpi: {
          totalProjects,
          activeProjects,
          totalTasks,
          openTasks,
          completedTasks,
          eventsThisWeek,
          totalBudget,
          activeBudgetTotal,
          budgetSpent,
          revenueMTD,
          teamUtilization,
        },
        projectStatusDistribution,
        myTasksDueToday: tasksDueTodayRes.data ?? [],
        overdueTasks: overdueTasksRes.data ?? [],
        upcomingEvents,
        budgets: (budgetsListRes.data ?? []).map((b) => ({
          ...b,
          spent_amount: spentByBudget.get(b.id) ?? 0,
        })),
      };
    },
  });
}
