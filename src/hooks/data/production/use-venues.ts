"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Location = Database["public"]["Tables"]["locations"]["Row"];
type LocationInsert = Database["public"]["Tables"]["locations"]["Insert"];
type LocationUpdate = Database["public"]["Tables"]["locations"]["Update"];

export function useVenues(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["venues", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("locations")
        .select(`*, address:addresses(street_line_1, city, state_province, country, postal_code)`)
        .eq("organization_id", organizationId)
        .eq("location_type", "venue")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((loc) => ({
        id: loc.id,
        name: loc.name,
        venue_type: loc.venue_type,
        capacity: loc.capacity,
        city: loc.address?.city ?? loc.legacy_city,
        state: loc.address?.state_province ?? loc.legacy_state,
        country: loc.address?.country ?? loc.legacy_country,
        address: loc.address?.street_line_1 ?? loc.legacy_address,
        is_partner: loc.is_partner,
        website: loc.website,
        phone: loc.phone,
        email: loc.email,
        created_at: loc.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useVenue(venueId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["venue", venueId],
    queryFn: async () => {
      if (!venueId) return null;

      const { data, error } = await supabase
        .from("locations")
        .select(`*, address:addresses(street_line_1, city, state_province, country, postal_code, latitude, longitude)`)
        .eq("id", venueId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!venueId,
  });
}

export function useCreateVenue() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venue: LocationInsert) => {
      const { data, error } = await supabase
        .from("locations")
        .insert({ ...venue, location_type: "venue" })
        .select()
        .single();

      if (error) throw error;
      return data as Location;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["venues", data.organization_id] });
    },
  });
}

export function useUpdateVenue() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: LocationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("locations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Location;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["venues", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["venue", data.id] });
    },
  });
}
