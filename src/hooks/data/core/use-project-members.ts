"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"];
type ProjectMemberInsert = Database["public"]["Tables"]["project_members"]["Insert"];

export function useProjectMembers(projectId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          user:users!project_members_user_id_fkey (
            id,
            full_name,
            avatar_url,
            email
          ),
          project:projects (
            id,
            name
          )
        `)
        .eq("project_id", projectId)
        .order("joined_at", { ascending: false });

      if (error) throw error;

      return data.map((member) => ({
        id: member.id,
        user_id: member.user_id,
        user_name: member.user?.full_name,
        user_avatar: member.user?.avatar_url,
        user_email: member.user?.email,
        project_name: member.project?.name,
        role: member.role,
        joined_at: member.joined_at,
        created_at: member.created_at,
      }));
    },
    enabled: !!projectId,
  });
}

export function useAllProjectMembers(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["all-project-members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          user:users!project_members_user_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          project:projects!inner (
            id,
            name,
            organization_id
          )
        `)
        .eq("project.organization_id", organizationId)
        .order("joined_at", { ascending: false });

      if (error) throw error;

      return data.map((member) => ({
        id: member.id,
        user_name: member.user?.full_name,
        user_avatar: member.user?.avatar_url,
        project_name: member.project?.name,
        role: member.role,
        joined_at: member.joined_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useAddProjectMember() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: ProjectMemberInsert) => {
      const { data, error } = await supabase
        .from("project_members")
        .insert(member)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectMember;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-members", data.project_id] });
    },
  });
}
