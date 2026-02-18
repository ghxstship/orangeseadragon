"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

const QUERY_STALE_TIME_MS = 2 * 60 * 1000;
const QUERY_GC_TIME_MS = 10 * 60 * 1000;

export function useDocuments(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["documents", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          folder:document_folders (
            id,
            name
          ),
          created_by_user:users!documents_created_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
}

export function useDocument(documentId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      if (!documentId) return null;

      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          folder:document_folders (
            id,
            name
          ),
          created_by_user:users!documents_created_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("id", documentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!documentId,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
}

export function useCreateDocument() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: DocumentInsert) => {
      const { data, error } = await supabase
        .from("documents")
        .insert(document)
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents", data.organization_id] });
    },
  });
}

export function useUpdateDocument() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DocumentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["document", data.id] });
    },
  });
}

export function useDeleteDocument() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from("documents")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["documents", organizationId] });
    },
  });
}
