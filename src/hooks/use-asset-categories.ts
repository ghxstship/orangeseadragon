"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type AssetCategory = Database["public"]["Tables"]["asset_categories"]["Row"];
type AssetCategoryInsert = Database["public"]["Tables"]["asset_categories"]["Insert"];

export function useAssetCategories(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["asset-categories", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("asset_categories")
        .select(`*`)
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        icon: category.icon,
        parent_id: category.parent_id,
        created_at: category.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateAssetCategory() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: AssetCategoryInsert) => {
      const { data, error } = await supabase
        .from("asset_categories")
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data as AssetCategory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["asset-categories", data.organization_id] });
    },
  });
}
