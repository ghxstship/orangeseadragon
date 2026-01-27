"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type TalentBooking = Database["public"]["Tables"]["talent_bookings"]["Row"];
type TalentBookingInsert = Database["public"]["Tables"]["talent_bookings"]["Insert"];
type TalentBookingUpdate = Database["public"]["Tables"]["talent_bookings"]["Update"];

export function useBookings(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["bookings", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("talent_bookings")
        .select(`
          *,
          talent:talent_profiles (
            id,
            name
          ),
          event:events (
            id,
            name
          )
        `)
        .eq("organization_id", organizationId)
        .order("performance_date", { ascending: false });

      if (error) throw error;

      return data.map((booking) => ({
        id: booking.id,
        talent_name: booking.talent?.name || "Unknown",
        event_name: booking.event?.name,
        performance_date: booking.performance_date,
        set_time: booking.set_time,
        set_duration_minutes: booking.set_duration_minutes,
        status: booking.status,
        fee_amount: booking.fee_amount,
        fee_currency: booking.fee_currency,
        notes: booking.notes,
        created_at: booking.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateBooking() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: TalentBookingInsert) => {
      const { data, error } = await supabase
        .from("talent_bookings")
        .insert(booking)
        .select()
        .single();

      if (error) throw error;
      return data as TalentBooking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", data.organization_id] });
    },
  });
}

export function useUpdateBooking() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TalentBookingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("talent_bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as TalentBooking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", data.organization_id] });
    },
  });
}
