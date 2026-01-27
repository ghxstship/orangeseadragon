"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];

export function useBudgets(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["budgets", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          project:projects (
            id,
            name
          ),
          event:events (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((budget) => ({
        id: budget.id,
        name: budget.name,
        project_name: budget.project?.name,
        event_name: budget.event?.name,
        total_amount: budget.total_amount,
        currency: budget.currency,
        status: budget.status,
        period_type: budget.period_type,
        start_date: budget.start_date,
        end_date: budget.end_date,
        created_at: budget.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useBudget(budgetId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["budget", budgetId],
    queryFn: async () => {
      if (!budgetId) return null;

      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          project:projects (*),
          event:events (*),
          budget_line_items (*)
        `)
        .eq("id", budgetId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!budgetId,
  });
}

export function useCreateBudget() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const { data, error } = await supabase
        .from("budgets")
        .insert(budget)
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", data.organization_id] });
    },
  });
}

export function useUpdateBudget() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BudgetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["budget", data.id] });
    },
  });
}
