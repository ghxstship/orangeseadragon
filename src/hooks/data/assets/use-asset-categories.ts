"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";

/**
 * Fetches platform catalog categories (SSOT) for asset workflows.
 * Replaces the legacy org-scoped asset_categories hook.
 * Categories are platform-wide — no organizationId filter needed.
 * The param is kept for call-site compatibility but is ignored.
 */
export function useAssetCategories(_organizationId?: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["platform-catalog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_catalog_categories")
        .select(`
          id,
          slug,
          name,
          description,
          color,
          icon,
          sort_order,
          is_active,
          division_id,
          platform_catalog_divisions (
            id,
            slug,
            name
          )
        `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        icon: category.icon,
        parent_id: null,
        division_id: category.division_id,
        division: category.platform_catalog_divisions,
        created_at: null,
      }));
    },
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * @deprecated Platform catalog categories are read-only seed data.
 * This stub is kept so existing call-sites don't break at import time.
 * Creating categories should be done via migration / admin tooling.
 */
export function useCreateAssetCategory() {
  throw new Error(
    "useCreateAssetCategory is deprecated. Platform catalog categories are managed via migrations."
  );
}
