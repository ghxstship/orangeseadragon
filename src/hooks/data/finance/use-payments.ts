"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Payment = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];

export function usePayments(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["payments", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          invoice:invoices (
            id,
            invoice_number
          )
        `)
        .eq("organization_id", organizationId)
        .order("payment_date", { ascending: false });

      if (error) throw error;

      return data.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        invoice_number: payment.invoice?.invoice_number,
        notes: payment.notes,
        created_at: payment.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreatePayment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: PaymentInsert) => {
      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments", data.organization_id] });
    },
  });
}
