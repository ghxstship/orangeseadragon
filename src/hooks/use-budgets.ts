"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { throwApiErrorResponse } from "@/lib/api/error-message";
import type { Database } from "@/types/database";

type _Budget = Database["public"]["Tables"]["budgets"]["Row"];
type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];

const QUERY_STALE_TIME_MS = 2 * 60 * 1000;
const QUERY_GC_TIME_MS = 10 * 60 * 1000;

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
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
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
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });
      if (!res.ok) await throwApiErrorResponse(res, 'Failed to create budget');
      const json = await res.json();
      return json.data ?? json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BudgetUpdate & { id: string }) => {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) await throwApiErrorResponse(res, 'Failed to update budget');
      const json = await res.json();
      return json.data ?? json;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["budget", id] });
      const previous = queryClient.getQueryData(["budget", id]);
      queryClient.setQueryData(["budget", id], (old: Record<string, unknown> | undefined) =>
        old ? { ...old, ...updates } : old
      );
      return { previous, id };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["budget", context.id], context.previous);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", id] });
    },
  });
}
