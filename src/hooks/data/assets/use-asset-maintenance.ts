"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type AssetMaintenance = Database["public"]["Tables"]["asset_maintenance"]["Row"];
type AssetMaintenanceInsert = Database["public"]["Tables"]["asset_maintenance"]["Insert"];

export function useAssetMaintenance(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["asset-maintenance", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("asset_maintenance")
        .select(`
          *,
          asset:assets (
            id,
            name,
            asset_tag
          )
        `)
        .eq("organization_id", organizationId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;

      return data.map((maintenance) => ({
        id: maintenance.id,
        title: maintenance.title,
        asset_name: maintenance.asset?.name,
        asset_tag: maintenance.asset?.asset_tag,
        maintenance_type: maintenance.maintenance_type,
        scheduled_date: maintenance.scheduled_date,
        completed_date: maintenance.completed_date,
        status: maintenance.status,
        cost: maintenance.cost,
        description: maintenance.description,
        created_at: maintenance.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateAssetMaintenance() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maintenance: AssetMaintenanceInsert) => {
      const { data, error } = await supabase
        .from("asset_maintenance")
        .insert(maintenance)
        .select()
        .single();

      if (error) throw error;
      return data as AssetMaintenance;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["asset-maintenance", data.organization_id] });
    },
  });
}
