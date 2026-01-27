"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "./use-supabase";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export function useMyTasks() {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["my-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

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
          )
        `)
        .or(`created_by.eq.${user.id},task_assignments.user_id.eq.${user.id}`)
        .is("deleted_at", null)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateMyTask() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useUser();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks", user?.id] });
    },
  });
}

export function useCompleteTask() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ 
          status: "done",
          completed_at: new Date().toISOString()
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks", user?.id] });
    },
  });
}
