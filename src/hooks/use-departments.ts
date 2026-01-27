"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Department = Database["public"]["Tables"]["departments"]["Row"];
type DepartmentInsert = Database["public"]["Tables"]["departments"]["Insert"];

export function useDepartments(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["departments", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("departments")
        .select(`
          *,
          manager:users!departments_manager_id_fkey (
            id,
            full_name
          )
        `)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((dept) => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        color: dept.color,
        icon: dept.icon,
        manager_name: dept.manager?.full_name,
        parent_id: dept.parent_id,
        created_at: dept.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateDepartment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dept: DepartmentInsert) => {
      const { data, error } = await supabase
        .from("departments")
        .insert(dept)
        .select()
        .single();

      if (error) throw error;
      return data as Department;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departments", data.organization_id] });
    },
  });
}
