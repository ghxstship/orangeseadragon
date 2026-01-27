"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

/**
 * Leads are contacts that are potential customers.
 * Uses the contacts table with company relationship.
 */
export function useLeads(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["leads", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("contacts")
        .select(`
          *,
          company:companies (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((contact) => ({
        id: contact.id,
        name: contact.full_name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown",
        company: contact.company?.name || "",
        email: contact.email,
        phone: contact.phone,
        source: "direct", // Default - schema doesn't have source field
        status: contact.is_active ? "active" : "inactive",
        value: 0, // Default - schema doesn't have lead_value field
        created_at: contact.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: ContactInsert) => {
      const { data, error } = await supabase
        .from("contacts")
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads", data.organization_id] });
    },
  });
}

export function useUpdateLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ContactUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads", data.organization_id] });
    },
  });
}
