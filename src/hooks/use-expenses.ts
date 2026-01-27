"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
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
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert(expense)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", data.organization_id] });
    },
  });
}

export function useUpdateExpense() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ExpenseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["expense", data.id] });
    },
  });
}

export function useApproveExpense() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update({ 
          status: "approved",
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["expense", data.id] });
    },
  });
}

export function useRejectExpense() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update({ 
          status: "rejected",
          rejection_reason: reason
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["expense", data.id] });
    },
  });
}
