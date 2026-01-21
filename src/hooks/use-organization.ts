"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export function useOrganization(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      if (error) throw error;
      return data as Organization;
    },
    enabled: !!organizationId,
  });
}

export function useOrganizations() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          role_id,
          is_owner,
          status,
          organizations (
            id,
            name,
            slug,
            logo_url,
            subscription_tier
          )
        `)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
  });
}

export function useOrganizationMembers(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          *,
          users (
            id,
            email,
            full_name,
            avatar_url
          ),
          roles (
            id,
            name,
            slug,
            level
          ),
          departments (
            id,
            name,
            slug
          ),
          positions (
            id,
            name,
            slug
          )
        `)
        .eq("organization_id", organizationId)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}
