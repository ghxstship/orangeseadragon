"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type AssetKit = Database["public"]["Tables"]["asset_kits"]["Row"];
type AssetKitInsert = Database["public"]["Tables"]["asset_kits"]["Insert"];

export function useAssetKits(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["asset-kits", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("asset_kits")
        .select(`
          *,
          platform_catalog_category:platform_catalog_categories (
            id,
            slug,
            name,
            icon,
            color
          )
        `)
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((kit) => ({
        id: kit.id,
        name: kit.name,
        kit_number: kit.kit_number,
        category_name: kit.platform_catalog_category?.name,
        status: kit.status,
        description: kit.description,
        created_at: kit.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateAssetKit() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kit: AssetKitInsert) => {
      const { data, error } = await supabase
        .from("asset_kits")
        .insert(kit)
        .select()
        .single();

      if (error) throw error;
      return data as AssetKit;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["asset-kits", data.organization_id] });
    },
  });
}
