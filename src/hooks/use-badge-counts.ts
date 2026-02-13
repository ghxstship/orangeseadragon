"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase, useUser } from "./use-supabase";

interface BadgeCounts {
  inbox: number;
  tasks: number;
  approvals: number;
}

export function useBadgeCounts(): { counts: BadgeCounts; isLoading: boolean } {
  const supabase = useSupabase();
  const { user } = useUser();

  const orgId = user?.user_metadata?.organization_id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ["badge-counts", user?.id, orgId],
    queryFn: async (): Promise<BadgeCounts> => {
      if (!user?.id || !orgId) return { inbox: 0, tasks: 0, approvals: 0 };

      const [inboxResult, tasksResult] = await Promise.allSettled([
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("assignee_id", user.id)
          .eq("organization_id", orgId)
          .in("status", ["todo", "in_progress"]),
      ]);

      const inbox =
        inboxResult.status === "fulfilled" ? inboxResult.value.count ?? 0 : 0;
      const tasks =
        tasksResult.status === "fulfilled" ? tasksResult.value.count ?? 0 : 0;

      return { inbox, tasks, approvals: 0 };
    },
    enabled: !!user?.id && !!orgId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  return {
    counts: data ?? { inbox: 0, tasks: 0, approvals: 0 },
    isLoading,
  };
}
