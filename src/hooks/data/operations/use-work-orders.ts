"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type WorkOrder = Database["public"]["Tables"]["work_orders"]["Row"];
type WorkOrderInsert = Database["public"]["Tables"]["work_orders"]["Insert"];
type WorkOrderUpdate = Database["public"]["Tables"]["work_orders"]["Update"];

export function useWorkOrders(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["work-orders", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useCreateWorkOrder() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workOrder: WorkOrderInsert) => {
      const { data, error } = await supabase
        .from("work_orders")
        .insert(workOrder)
        .select()
        .single();

      if (error) throw error;
      return data as WorkOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["work-orders", data.organization_id] });
    },
  });
}

export function useUpdateWorkOrder() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: WorkOrderUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("work_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WorkOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["work-orders", data.organization_id] });
    },
  });
}
