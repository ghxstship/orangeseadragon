"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Contract = Database["public"]["Tables"]["contracts"]["Row"];
type ContractInsert = Database["public"]["Tables"]["contracts"]["Insert"];
type ContractUpdate = Database["public"]["Tables"]["contracts"]["Update"];

export function useContracts(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["contracts", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("contracts")
        .select(`*`)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((contract) => ({
        id: contract.id,
        name: contract.title,
        contract_number: contract.contract_number,
        counterparty: contract.counterparty_name || "",
        contract_type: contract.contract_type,
        status: contract.status,
        value: contract.value,
        start_date: contract.start_date,
        end_date: contract.end_date,
        renewal_type: contract.renewal_type,
        created_at: contract.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useContract(contractId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      if (!contractId) return null;

      const { data, error } = await supabase
        .from("contracts")
        .select(`*`)
        .eq("id", contractId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });
}

export function useCreateContract() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contract: ContractInsert) => {
      const { data, error } = await supabase
        .from("contracts")
        .insert(contract)
        .select()
        .single();

      if (error) throw error;
      return data as Contract;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", data.organization_id] });
    },
  });
}

export function useUpdateContract() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ContractUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("contracts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Contract;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["contract", data.id] });
    },
  });
}

export function useDeleteContract() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from("contracts")
        .update({ status: "terminated" })
        .eq("id", id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", organizationId] });
    },
  });
}
