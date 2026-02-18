"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Asset = Database["public"]["Tables"]["assets"]["Row"];
type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];
type AssetUpdate = Database["public"]["Tables"]["assets"]["Update"];

const QUERY_STALE_TIME_MS = 2 * 60 * 1000;
const QUERY_GC_TIME_MS = 10 * 60 * 1000;

export function useAssets(organizationId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["assets", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];

            const { data, error } = await supabase
                .from("assets")
                .select(`
          *,
          platform_catalog_item:platform_catalog_items (
            id,
            slug,
            name,
            description,
            icon,
            image_url,
            default_unit_cost,
            unit_of_measure,
            is_rentable,
            is_service,
            platform_catalog_categories (
              id,
              slug,
              name,
              icon,
              color,
              platform_catalog_divisions (
                id,
                slug,
                name
              )
            )
          ),
          location:asset_locations (
            id,
            name
          ),
          created_by_user:users!assets_created_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
                .eq("organization_id", organizationId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!organizationId,
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
    });
}

export function useAsset(assetId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["asset", assetId],
        queryFn: async () => {
            if (!assetId) return null;

            const { data, error } = await supabase
                .from("assets")
                .select(`
          *,
          platform_catalog_item:platform_catalog_items (
            id,
            slug,
            name,
            description,
            icon,
            image_url,
            default_unit_cost,
            unit_of_measure,
            is_rentable,
            is_service,
            platform_catalog_categories (
              id,
              slug,
              name,
              icon,
              color,
              platform_catalog_divisions (
                id,
                slug,
                name
              )
            )
          ),
          location:asset_locations (
            id,
            name
          ),
          created_by_user:users!assets_created_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
                .eq("id", assetId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!assetId,
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
    });
}

export function useCreateAsset() {
    const supabase = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (asset: AssetInsert) => {
            const { data, error } = await supabase
                .from("assets")
                .insert(asset)
                .select()
                .single();

            if (error) throw error;
            return data as Asset;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
        },
    });
}

export function useUpdateAsset() {
    const supabase = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: AssetUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from("assets")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data as Asset;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            queryClient.invalidateQueries({ queryKey: ["asset", data.id] });
        },
    });
}

export function useDeleteAsset() {
    const supabase = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("assets")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
        },
    });
}
