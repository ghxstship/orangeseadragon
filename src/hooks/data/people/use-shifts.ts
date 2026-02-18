"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Shift = Database["public"]["Tables"]["shifts"]["Row"];
type ShiftInsert = Database["public"]["Tables"]["shifts"]["Insert"];
type ShiftUpdate = Database["public"]["Tables"]["shifts"]["Update"];

export function useShifts(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["shifts", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("shifts")
        .select(`
          *,
          user:users!shifts_user_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          event:events (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("date", { ascending: false });

      if (error) throw error;

      return data.map((shift) => ({
        id: shift.id,
        user_name: shift.user?.full_name || "Unknown",
        user_avatar: shift.user?.avatar_url,
        event_name: shift.event?.name,
        date: shift.date,
        scheduled_start: shift.scheduled_start,
        scheduled_end: shift.scheduled_end,
        actual_start: shift.actual_start,
        actual_end: shift.actual_end,
        status: shift.status,
        break_minutes: shift.break_minutes,
        notes: shift.notes,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateShift() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shift: ShiftInsert) => {
      const { data, error } = await supabase
        .from("shifts")
        .insert(shift)
        .select()
        .single();

      if (error) throw error;
      return data as Shift;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shifts", data.organization_id] });
    },
  });
}

export function useUpdateShift() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ShiftUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("shifts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Shift;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shifts", data.organization_id] });
    },
  });
}
