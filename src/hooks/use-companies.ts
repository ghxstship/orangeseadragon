"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];
type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

const QUERY_STALE_TIME_MS = 2 * 60 * 1000;
const QUERY_GC_TIME_MS = 10 * 60 * 1000;

export function useCompanies(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["companies", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          contacts (id),
          deals (id, value)
        `)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((company) => ({
        id: company.id,
        name: company.name,
        type: company.company_type || "prospect",
        industry: company.industry,
        website: company.website,
        phone: company.phone,
        status: company.is_active ? "active" : "inactive",
        contacts_count: company.contacts?.length || 0,
        deals_count: company.deals?.length || 0,
        total_value: company.deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
        created_at: company.created_at,
      }));
    },
    enabled: !!organizationId,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
}

export function useCompany(companyId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          contacts (*),
          deals (*)
        `)
        .eq("id", companyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
}

export function useCreateCompany() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company: CompanyInsert) => {
      const { data, error } = await supabase
        .from("companies")
        .insert(company)
        .select()
        .single();

      if (error) throw error;
      return data as Company;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companies", data.organization_id] });
    },
  });
}

export function useUpdateCompany() {
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
      queryClient.invalidateQueries({ queryKey: ["companies", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["company", data.id] });
    },
  });
}

export function useDeleteCompany() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from("companies")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["companies", organizationId] });
    },
  });
}
