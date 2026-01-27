"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type UserCertification = Database["public"]["Tables"]["user_certifications"]["Row"];
type UserCertificationInsert = Database["public"]["Tables"]["user_certifications"]["Insert"];

export function useCertifications(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["certifications", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("user_certifications")
        .select(`
          *,
          user:users!user_certifications_user_id_fkey (
            id,
            full_name
          ),
          certification_type:certification_types (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      return data.map((cert) => ({
        id: cert.id,
        user_name: cert.user?.full_name,
        certification_name: cert.certification_type?.name,
        certification_number: cert.certification_number,
        issued_date: cert.issued_date,
        expiry_date: cert.expiry_date,
        status: cert.status,
        issuing_authority: cert.issuing_authority,
        created_at: cert.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateCertification() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cert: UserCertificationInsert) => {
      const { data, error } = await supabase
        .from("user_certifications")
        .insert(cert)
        .select()
        .single();

      if (error) throw error;
      return data as UserCertification;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["certifications", data.organization_id] });
    },
  });
}
