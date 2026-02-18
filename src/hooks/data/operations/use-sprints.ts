"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";

/**
 * Sprints hook - uses task_lists as the underlying data model.
 * 
 * NOTE: The current database schema doesn't have dedicated sprint fields
 * (status, start_date, end_date). For full sprint functionality, the
 * task_lists table would need to be extended with these fields.
 * 
 * This hook provides a foundation that can be enhanced when the schema is updated.
 */
export function useSprints(projectId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("task_lists")
        .select(`
          *,
          project:projects (
            id,
            name,
            slug
          ),
          tasks (
            id,
            status
          )
        `)
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("position", { ascending: true });

      if (error) throw error;
      
      // Transform to sprint format with computed fields
      return data.map((list) => {
        const tasks = list.tasks || [];
        const completedTasks = tasks.filter((t) => t.status === "done").length;
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          id: list.id,
          name: list.name,
          project: list.project?.name || "",
          status: "active", // Default status until schema supports it
          start_date: list.created_at, // Use created_at as fallback
          end_date: null, // Not available in current schema
          progress,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
        };
      });
    },
    enabled: !!projectId,
  });
}

export function useAllSprints(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["all-sprints", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("task_lists")
        .select(`
          *,
          project:projects (
            id,
            name,
            slug,
            organization_id
          ),
          tasks (
            id,
            status
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Filter by organization and transform
      return data
        .filter((list) => list.project?.organization_id === organizationId)
        .map((list) => {
          const tasks = list.tasks || [];
          const completedTasks = tasks.filter((t) => t.status === "done").length;
          const totalTasks = tasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          return {
            id: list.id,
            name: list.name,
            project: list.project?.name || "",
            status: "active", // Default status until schema supports it
            start_date: list.created_at, // Use created_at as fallback
            end_date: null, // Not available in current schema
            progress,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
          };
        });
    },
    enabled: !!organizationId,
  });
}
