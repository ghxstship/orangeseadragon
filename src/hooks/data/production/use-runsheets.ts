"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Runsheet = Database["public"]["Tables"]["runsheets"]["Row"];
type RunsheetInsert = Database["public"]["Tables"]["runsheets"]["Insert"];
type RunsheetUpdate = Database["public"]["Tables"]["runsheets"]["Update"];

export function useRunsheets(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["runsheets", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("runsheets")
        .select(`
          *,
          event:events (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("date", { ascending: false });

      if (error) throw error;

      return data.map((runsheet) => ({
        id: runsheet.id,
        name: runsheet.name,
        event_name: runsheet.event?.name,
        date: runsheet.date,
        status: runsheet.status,
        version: runsheet.version,
        created_at: runsheet.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateRunsheet() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runsheet: RunsheetInsert) => {
      const { data, error } = await supabase
        .from("runsheets")
        .insert(runsheet)
        .select()
        .single();

      if (error) throw error;
      return data as Runsheet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["runsheets", data.organization_id] });
    },
  });
}

export function useUpdateRunsheet() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: RunsheetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("runsheets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Runsheet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["runsheets", data.organization_id] });
    },
  });
}
