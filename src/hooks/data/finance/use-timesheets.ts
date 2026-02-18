"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Timesheet = Database["public"]["Tables"]["timesheets"]["Row"];
type TimesheetInsert = Database["public"]["Tables"]["timesheets"]["Insert"];

export function useTimesheets(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["timesheets", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("timesheets")
        .select(`
          *,
          user:users!timesheets_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("organization_id", organizationId)
        .order("period_start", { ascending: false });

      if (error) throw error;

      return data.map((ts) => ({
        id: ts.id,
        user_name: ts.user?.full_name || "Unknown",
        user_avatar: ts.user?.avatar_url,
        period_start: ts.period_start,
        period_end: ts.period_end,
        total_regular_hours: ts.total_regular_hours,
        total_overtime_hours: ts.total_overtime_hours,
        total_amount: ts.total_amount,
        status: ts.status,
        submitted_at: ts.submitted_at,
        approved_at: ts.approved_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateTimesheet() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timesheet: TimesheetInsert) => {
      const { data, error } = await supabase
        .from("timesheets")
        .insert(timesheet)
        .select()
        .single();

      if (error) throw error;
      return data as Timesheet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["timesheets", data.organization_id] });
    },
  });
}

export function useApproveTimesheet() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
      const { data, error } = await supabase
        .from("timesheets")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Timesheet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["timesheets", data.organization_id] });
    },
  });
}
