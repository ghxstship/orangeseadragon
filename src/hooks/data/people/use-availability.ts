"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type UserAvailability = Database["public"]["Tables"]["user_availability"]["Row"];
type UserAvailabilityInsert = Database["public"]["Tables"]["user_availability"]["Insert"];

export function useAvailability(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["availability", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("user_availability")
        .select(`
          *,
          user:users!user_availability_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("organization_id", organizationId)
        .order("date", { ascending: true });

      if (error) throw error;

      return data.map((avail) => ({
        id: avail.id,
        user_name: avail.user?.full_name,
        user_avatar: avail.user?.avatar_url,
        date: avail.date,
        availability_type: avail.availability_type,
        start_time: avail.start_time,
        end_time: avail.end_time,
        notes: avail.notes,
        created_at: avail.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateAvailability() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avail: UserAvailabilityInsert) => {
      const { data, error } = await supabase
        .from("user_availability")
        .insert(avail)
        .select()
        .single();

      if (error) throw error;
      return data as UserAvailability;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["availability", data.organization_id] });
    },
  });
}
