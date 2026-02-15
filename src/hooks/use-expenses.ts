"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { throwApiErrorResponse } from "@/lib/api/error-message";
import type { Database } from "@/types/database";

type _Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

export function useExpenses(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["expenses", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("expenses")
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
        .order("expense_date", { ascending: false });

      if (error) throw error;

      return data.map((expense) => ({
        id: expense.id,
        description: expense.description,
        expense_number: expense.expense_number,
        amount: expense.amount,
        currency: expense.currency,
        category_id: expense.category_id,
        status: expense.status,
        expense_date: expense.expense_date,
        vendor_name: expense.vendor_name,
        project_name: expense.project?.name,
        event_name: expense.event?.name,
        receipt_url: expense.receipt_url,
        is_billable: expense.is_billable,
        is_reimbursable: expense.is_reimbursable,
        created_at: expense.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useExpense(expenseId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["expense", expenseId],
    queryFn: async () => {
      if (!expenseId) return null;

      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          project:projects (*),
          event:events (*)
        `)
        .eq("id", expenseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!expenseId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!res.ok) await throwApiErrorResponse(res, 'Failed to create expense');
      const json = await res.json();
      return json.data ?? json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ExpenseUpdate & { id: string }) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) await throwApiErrorResponse(res, 'Failed to update expense');
      const json = await res.json();
      return json.data ?? json;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["expense", id] });
      const previous = queryClient.getQueryData(["expense", id]);
      queryClient.setQueryData(["expense", id], (old: Record<string, unknown> | undefined) =>
        old ? { ...old, ...updates } : old
      );
      return { previous, id };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["expense", context.id], context.previous);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; approvedBy: string }) => {
      const res = await fetch(`/api/expenses/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) await throwApiErrorResponse(res, 'Failed to approve expense');
      const json = await res.json();
      return json.data ?? json;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
      });
      if (!res.ok) await throwApiErrorResponse(res, 'Failed to reject expense');
      const json = await res.json();
      return json.data ?? json;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
    },
  });
}
