"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export function useTasks(projectId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          task_list:task_lists (
            id,
            name
          ),
          created_by_user:users!tasks_created_by_fkey (
            id,
            full_name,
            avatar_url
          ),
          task_assignments (
            id,
            user_id,
            users (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("position", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useTask(taskId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          project:projects (
            id,
            name,
            slug
          ),
          task_list:task_lists (
            id,
            name
          ),
          parent:tasks!tasks_parent_id_fkey (
            id,
            title
          ),
          created_by_user:users!tasks_created_by_fkey (
            id,
            full_name,
            avatar_url
          ),
          task_assignments (
            id,
            user_id,
            assigned_at,
            users (
              id,
              full_name,
              avatar_url,
              email
            )
          ),
          task_dependencies!task_dependencies_task_id_fkey (
            id,
            depends_on_task_id,
            dependency_type,
            depends_on:tasks!task_dependencies_depends_on_task_id_fkey (
              id,
              title,
              status
            )
          )
        `)
        .eq("id", taskId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.project_id] });
    },
  });
}

export function useUpdateTask() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["task", data.id] });
    },
  });
}

export function useDeleteTask() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return { id, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

