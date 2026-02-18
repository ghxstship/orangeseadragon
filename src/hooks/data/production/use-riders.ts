"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Rider = Database["public"]["Tables"]["riders"]["Row"];
type RiderInsert = Database["public"]["Tables"]["riders"]["Insert"];

export function useRiders(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["riders", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("riders")
        .select(`
          *,
          talent:talent_profiles (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((rider) => ({
        id: rider.id,
        name: rider.name,
        talent_name: rider.talent?.name,
        rider_type: rider.rider_type,
        status: rider.status,
        version: rider.version,
        document_url: rider.document_url,
        created_at: rider.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateRider() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rider: RiderInsert) => {
      const { data, error } = await supabase
        .from("riders")
        .insert(rider)
        .select()
        .single();

      if (error) throw error;
      return data as Rider;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["riders", data.organization_id] });
    },
  });
}
