"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Stage = Database["public"]["Tables"]["stages"]["Row"];
type StageInsert = Database["public"]["Tables"]["stages"]["Insert"];

export function useStages(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["stages", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("stages")
        .select(`*`)
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((stage) => ({
        id: stage.id,
        name: stage.name,
        capacity: stage.capacity,
        description: stage.description,
        stage_plot_url: stage.stage_plot_url,
        is_active: stage.is_active,
        created_at: stage.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateStage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stage: StageInsert) => {
      const { data, error } = await supabase
        .from("stages")
        .insert(stage)
        .select()
        .single();

      if (error) throw error;
      return data as Stage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stages", data.organization_id] });
    },
  });
}
