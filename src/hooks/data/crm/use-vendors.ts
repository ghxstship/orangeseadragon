"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];
type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

/**
 * Vendors are companies with company_type = 'vendor'.
 * This hook filters companies to show only vendors.
 */
export function useVendors(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["vendors", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          vendor_contacts (
            id,
            contact:contacts (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq("organization_id", organizationId)
        .eq("company_type", "vendor")
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.industry,
        website: vendor.website,
        phone: vendor.phone,
        email: vendor.email,
        status: vendor.is_active ? "active" : "inactive",
        contacts_count: vendor.vendor_contacts?.length || 0,
        created_at: vendor.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateVendor() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: CompanyInsert) => {
      const { data, error } = await supabase
        .from("companies")
        .insert({ ...vendor, company_type: "vendor" })
        .select()
        .single();

      if (error) throw error;
      return data as Company;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vendors", data.organization_id] });
    },
  });
}

export function useUpdateVendor() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CompanyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Company;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vendors", data.organization_id] });
    },
  });
}
