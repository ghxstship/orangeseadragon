"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type _Deal = Database["public"]["Tables"]["deals"]["Row"];

export function useDeals(organizationId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["deals", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];

            const { data, error } = await supabase
                .from("deals")
                .select(`
          *,
          company:companies (
            id,
            name
          ),
          owner:users!deals_owner_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
                .eq("organization_id", organizationId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return data.map(deal => ({
                ...deal,
                company_name: deal.company?.name,
                owner_name: deal.owner?.full_name,
                owner_avatar: deal.owner?.avatar_url
            }));
        },
        enabled: !!organizationId,
    });
}
