"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

const QUERY_STALE_TIME_MS = 2 * 60 * 1000;
const QUERY_GC_TIME_MS = 10 * 60 * 1000;

export function useContacts(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["contacts", organizationId],
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
        .order("last_name", { ascending: true });

      if (error) throw error;

      return data.map((contact) => ({
        id: contact.id,
        name: contact.full_name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown",
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company?.name || "",
        company_id: contact.company_id,
        job_title: contact.job_title,
        department: contact.department,
        status: contact.is_active ? "active" : "inactive",
        tags: contact.tags,
        created_at: contact.created_at,
      }));
    },
    enabled: !!organizationId,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
}

export function useContact(contactId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["contact", contactId],
    queryFn: async () => {
      if (!contactId) return null;

      const { data, error } = await supabase
        .from("contacts")
        .select(`
          *,
          company:companies (*)
        `)
        .eq("id", contactId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
}

export function useCreateContact() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: ContactInsert) => {
      const { data, error } = await supabase
        .from("contacts")
        .insert(contact)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts", data.organization_id] });
    },
  });
}

export function useUpdateContact() {
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
      queryClient.invalidateQueries({ queryKey: ["contacts", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["contact", data.id] });
    },
  });
}

export function useDeleteContact() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from("contacts")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["contacts", organizationId] });
    },
  });
}
