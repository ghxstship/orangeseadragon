"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
type MilestoneInsert = Database["public"]["Tables"]["milestones"]["Insert"];

export function useMilestones(projectId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["milestones", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("milestones")
        .select(`
          *,
          project:projects (
            id,
            name,
            slug,
            color
          )
        `)
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useAllMilestones(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["all-milestones", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("milestones")
        .select(`
          *,
          project:projects (
            id,
            name,
            slug,
            color,
            organization_id
          )
        `)
        .is("deleted_at", null)
        .order("due_date", { ascending: true });

      if (error) throw error;
      
      // Filter by organization
      return data.filter((m) => m.project?.organization_id === organizationId);
    },
    enabled: !!organizationId,
  });
}

export function useCreateMilestone() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestone: MilestoneInsert) => {
      const { data, error } = await supabase
        .from("milestones")
        .insert(milestone)
        .select()
        .single();

      if (error) throw error;
      return data as Milestone;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["milestones", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["all-milestones"] });
    },
  });
}

export function useUpdateMilestone() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Milestone> & { id: string }) => {
      const { data, error } = await supabase
        .from("milestones")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Milestone;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["milestones", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["all-milestones"] });
    },
  });
}
