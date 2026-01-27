"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type UserSkill = Database["public"]["Tables"]["user_skills"]["Row"];
type UserSkillInsert = Database["public"]["Tables"]["user_skills"]["Insert"];

export function useUserSkills(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["user-skills", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("user_skills")
        .select(`
          *,
          user:users!user_skills_user_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          skill:skills (
            id,
            name,
            category
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((userSkill) => ({
        id: userSkill.id,
        user_name: userSkill.user?.full_name,
        user_avatar: userSkill.user?.avatar_url,
        skill_name: userSkill.skill?.name,
        skill_category: userSkill.skill?.category,
        proficiency_level: userSkill.proficiency_level,
        years_experience: userSkill.years_experience,
        is_verified: userSkill.is_verified,
        verified_at: userSkill.verified_at,
        created_at: userSkill.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useAddUserSkill() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skill: UserSkillInsert) => {
      const { data, error } = await supabase
        .from("user_skills")
        .insert(skill)
        .select()
        .single();

      if (error) throw error;
      return data as UserSkill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills"] });
    },
  });
}
