"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type EmployeeCertification = Database["public"]["Tables"]["employee_certifications"]["Row"];
type EmployeeCertificationInsert = Database["public"]["Tables"]["employee_certifications"]["Insert"];

export function useCertifications(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["certifications", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("employee_certifications")
        .select(`
          *,
          certification_type:certification_types!employee_certifications_certification_type_id_fkey (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((cert) => ({
        id: cert.id,
        employee_id: cert.employee_id,
        certification_name: (cert.certification_type as { id: string; name: string } | null)?.name,
        certificate_number: cert.certificate_number,
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
    mutationFn: async (cert: EmployeeCertificationInsert) => {
      const { data, error } = await supabase
        .from("employee_certifications")
        .insert(cert)
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeCertification;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["certifications", data.organization_id] });
    },
  });
}
