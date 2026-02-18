"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type AssetReservation = Database["public"]["Tables"]["asset_reservations"]["Row"];
type AssetReservationInsert = Database["public"]["Tables"]["asset_reservations"]["Insert"];

export function useAssetReservations(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["asset-reservations", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("asset_reservations")
        .select(`
          *,
          asset:assets (
            id,
            name,
            asset_tag
          ),
          event:events (
            id,
            name
          ),
          reserved_by_user:users!asset_reservations_reserved_by_fkey (
            id,
            full_name
          )
        `)
        .eq("organization_id", organizationId)
        .order("start_date", { ascending: false });

      if (error) throw error;

      return data.map((reservation) => ({
        id: reservation.id,
        asset_name: reservation.asset?.name,
        asset_tag: reservation.asset?.asset_tag,
        event_name: reservation.event?.name,
        reserved_by_name: reservation.reserved_by_user?.full_name,
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        status: reservation.status,
        notes: reservation.notes,
        created_at: reservation.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCreateAssetReservation() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservation: AssetReservationInsert) => {
      const { data, error } = await supabase
        .from("asset_reservations")
        .insert(reservation)
        .select()
        .single();

      if (error) throw error;
      return data as AssetReservation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["asset-reservations", data.organization_id] });
    },
  });
}
