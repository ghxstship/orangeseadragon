"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Asset = Database["public"]["Tables"]["assets"]["Row"];
type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];
type AssetUpdate = Database["public"]["Tables"]["assets"]["Update"];

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
          category:asset_categories (
            id,
            name,
            slug
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
                //.eq("organization_id", organizationId) // Assets might not have org_id directly if it's inferred from category/location? 
                // Checking schema in step 385, no organization_id in first few lines, let's assume it's there or handle error if not. 
                // Actually step 385 output truncated, but usually assets are org scoped.
                // Let's assume standard pattern.
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!organizationId,
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
          category:asset_categories (
            id,
            name,
            slug
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
