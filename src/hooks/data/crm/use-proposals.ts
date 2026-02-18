"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Proposal = Database["public"]["Tables"]["proposals"]["Row"];
type ProposalInsert = Database["public"]["Tables"]["proposals"]["Insert"];
type ProposalUpdate = Database["public"]["Tables"]["proposals"]["Update"];

export function useProposals(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["proposals", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          company:companies (
            id,
            name
          ),
          contact:contacts (
            id,
            full_name
          )
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((proposal) => ({
        id: proposal.id,
        proposal_number: proposal.proposal_number,
        title: proposal.title,
        company_name: proposal.company?.name,
        contact_name: proposal.contact?.full_name,
        total_amount: proposal.total_amount,
        status: proposal.status,
        valid_until: proposal.valid_until,
        sent_at: proposal.sent_at,
        created_at: proposal.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useProposal(proposalId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: async () => {
      if (!proposalId) return null;

      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          company:companies (
            id,
            name
          ),
          contact:contacts (
            id,
            full_name,
            email
          )
        `)
        .eq("id", proposalId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });
}

export function useCreateProposal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: ProposalInsert) => {
      const { data, error } = await supabase
        .from("proposals")
        .insert(proposal)
        .select()
        .single();

      if (error) throw error;
      return data as Proposal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proposals", data.organization_id] });
    },
  });
}

export function useUpdateProposal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProposalUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("proposals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Proposal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proposals", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["proposal", data.id] });
    },
  });
}
