"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Incident = Database["public"]["Tables"]["compliance_incidents"]["Row"];
type IncidentInsert = Database["public"]["Tables"]["compliance_incidents"]["Insert"];

export function useIncidents(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["incidents", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("compliance_incidents")
        .select(`
          *,
          reported_by_user:users!compliance_incidents_reported_by_fkey (
            id,
            full_name
          )
        `)
        .eq("organization_id", organizationId)
        .order("occurred_at", { ascending: false });

      if (error) throw error;

      return data.map((incident) => ({
        id: incident.id,
        title: incident.title,
        incident_number: incident.incident_number,
        incident_type: incident.incident_type,
        severity: incident.severity,
        status: incident.status,
        occurred_at: incident.occurred_at,
        reported_by_name: incident.reported_by_user?.full_name,
        description: incident.description,
        created_at: incident.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateIncident() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: IncidentInsert) => {
      const { data, error } = await supabase
        .from("compliance_incidents")
        .insert(incident)
        .select()
        .single();

      if (error) throw error;
      return data as Incident;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incidents", data.organization_id] });
    },
  });
}
