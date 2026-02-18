"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "../../auth/use-supabase";

export interface WeeklyTimeEntry {
  id: string;
  project_id: string;
  project_name: string;
  task_id: string | null;
  task_name: string | null;
  date: string;
  hours: number;
  description: string | null;
  billable: boolean;
  status: string;
}

export function useMyTimeEntries(weekStart: string, weekEnd: string) {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["my-time-entries", user?.id, weekStart, weekEnd],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          id,
          project_id,
          task_id,
          date,
          hours,
          description,
          billable,
          status,
          project:projects!time_entries_project_id_fkey (
            id, name
          ),
          task:tasks!time_entries_task_id_fkey (
            id, title
          )
        `)
        .eq("user_id", user.id)
        .gte("date", weekStart)
        .lte("date", weekEnd)
        .order("date", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((entry) => ({
        id: entry.id,
        project_id: entry.project_id,
        project_name: (entry.project as { name?: string } | null)?.name ?? "Unknown Project",
        task_id: entry.task_id,
        task_name: (entry.task as { title?: string } | null)?.title ?? null,
        date: entry.date,
        hours: entry.hours ?? 0,
        description: entry.description,
        billable: entry.billable ?? true,
        status: entry.status ?? "draft",
      })) as WeeklyTimeEntry[];
    },
    enabled: !!user?.id && !!weekStart && !!weekEnd,
  });
}

export function useUpsertTimeEntry() {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      id?: string;
      project_id: string;
      task_id?: string | null;
      date: string;
      hours: number;
      description?: string;
      billable?: boolean;
    }) => {
      const organizationId = user?.user_metadata?.organization_id;

      if (entry.id) {
        const { data, error } = await supabase
          .from("time_entries")
          .update({ hours: entry.hours, description: entry.description })
          .eq("id", entry.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
          project_id: entry.project_id,
          task_id: entry.task_id ?? null,
          user_id: user!.id,
          date: entry.date,
          hours: entry.hours,
          description: entry.description ?? "",
          billable: entry.billable ?? true,
          status: "draft",
          organization_id: organizationId,
        };
        const { data, error } = await supabase
          .from("time_entries")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-time-entries"] });
    },
  });
}

export function useSubmitWeekTimeEntries() {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ weekStart, weekEnd }: { weekStart: string; weekEnd: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("time_entries")
        .update({ status: "submitted" })
        .eq("user_id", user.id)
        .eq("status", "draft")
        .gte("date", weekStart)
        .lte("date", weekEnd)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-time-entries"] });
    },
  });
}
