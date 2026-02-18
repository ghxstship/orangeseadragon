"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Position = Database["public"]["Tables"]["positions"]["Row"];
type PositionInsert = Database["public"]["Tables"]["positions"]["Insert"];

export function usePositions(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["positions", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("positions")
        .select(`
          *,
          department:departments (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((position) => ({
        id: position.id,
        name: position.name,
        department_name: position.department?.name,
        description: position.description,
        level: position.level,
        is_active: position.is_active,
        created_at: position.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreatePosition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (position: PositionInsert) => {
      const { data, error } = await supabase
        .from("positions")
        .insert(position)
        .select()
        .single();

      if (error) throw error;
      return data as Position;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["positions", data.organization_id] });
    },
  });
}
