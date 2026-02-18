"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type CrewCall = Database["public"]["Tables"]["crew_calls"]["Row"];
type CrewCallInsert = Database["public"]["Tables"]["crew_calls"]["Insert"];

export function useCrewCalls(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["crew-calls", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("crew_calls")
        .select(`
          *,
          event:events (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("date", { ascending: false });

      if (error) throw error;

      return data.map((call) => ({
        id: call.id,
        name: call.name,
        event_name: call.event?.name,
        date: call.date,
        call_time: call.call_time,
        end_time: call.end_time,
        total_positions: call.total_positions,
        filled_positions: call.filled_positions,
        status: call.status,
        location_notes: call.location_notes,
        notes: call.notes,
        created_at: call.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateCrewCall() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (call: CrewCallInsert) => {
      const { data, error } = await supabase
        .from("crew_calls")
        .insert(call)
        .select()
        .single();

      if (error) throw error;
      return data as CrewCall;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew-calls", data.organization_id] });
    },
  });
}
