"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type _Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export function useInvoices(organizationId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["invoices", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];

            const { data, error } = await supabase
                .from("invoices")
                .select(`
          *
        `)
                .eq("organization_id", organizationId)
                .order("issue_date", { ascending: false });

            if (error) throw error;

            return data.map(invoice => ({
                ...invoice,
            }));
        },
        enabled: !!organizationId,
    });
}
