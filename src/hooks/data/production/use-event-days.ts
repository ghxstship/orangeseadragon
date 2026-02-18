"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type EventDay = Database["public"]["Tables"]["event_days"]["Row"];
type EventDayInsert = Database["public"]["Tables"]["event_days"]["Insert"];

export function useEventDays(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["event-days", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("event_days")
        .select(`
          *,
          event:events!inner (
            id,
            name,
            organization_id
          )
        `)
        .eq("event.organization_id", organizationId)
        .order("date", { ascending: true });

      if (error) throw error;

      return data.map((day) => ({
        id: day.id,
        name: day.name || day.event?.name,
        event_name: day.event?.name,
        date: day.date,
        start_time: day.start_time,
        end_time: day.end_time,
        doors_time: day.doors_time,
        capacity: day.capacity,
        description: day.description,
        created_at: day.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateEventDay() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (day: EventDayInsert) => {
      const { data, error } = await supabase
        .from("event_days")
        .insert(day)
        .select()
        .single();

      if (error) throw error;
      return data as EventDay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-days"] });
    },
  });
}
