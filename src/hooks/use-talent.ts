"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type TalentProfile = Database["public"]["Tables"]["talent_profiles"]["Row"];
type TalentProfileInsert = Database["public"]["Tables"]["talent_profiles"]["Insert"];
type TalentProfileUpdate = Database["public"]["Tables"]["talent_profiles"]["Update"];

export function useTalent(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["talent", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("talent_profiles")
        .select(`*`)
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((talent) => ({
        id: talent.id,
        name: talent.name,
        email: talent.email,
        photo_url: talent.photo_url,
        talent_type: talent.talent_type,
        genres: talent.genres,
        base_fee: talent.base_fee,
        fee_currency: talent.fee_currency,
        bio: talent.bio,
        short_bio: talent.short_bio,
        booking_status: talent.booking_status,
        tags: talent.tags,
        created_at: talent.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useTalentProfile(talentId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["talent-profile", talentId],
    queryFn: async () => {
      if (!talentId) return null;

      const { data, error } = await supabase
        .from("talent_profiles")
        .select(`
          *,
          user:users (*)
        `)
        .eq("id", talentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!talentId,
  });
}

export function useCreateTalentProfile() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: TalentProfileInsert) => {
      const { data, error } = await supabase
        .from("talent_profiles")
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data as TalentProfile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["talent", data.organization_id] });
    },
  });
}

export function useUpdateTalentProfile() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TalentProfileUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("talent_profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as TalentProfile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["talent", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["talent-profile", data.id] });
    },
  });
}
