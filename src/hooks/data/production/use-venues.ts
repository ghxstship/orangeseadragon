"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Venue = Database["public"]["Tables"]["venues"]["Row"];
type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];
type VenueUpdate = Database["public"]["Tables"]["venues"]["Update"];

export function useVenues(organizationId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["venues", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("venues")
        .select(`*`)
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      return data.map((venue) => ({
        id: venue.id,
        name: venue.name,
        venue_type: venue.venue_type,
        capacity: venue.capacity,
        city: venue.city,
        state: venue.state,
        country: venue.country,
        address: venue.address,
        is_partner: venue.is_partner,
        website: venue.website,
        phone: venue.phone,
        email: venue.email,
        created_at: venue.created_at,
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
        .from("venues")
        .select(`*`)
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
    mutationFn: async (venue: VenueInsert) => {
      const { data, error } = await supabase
        .from("venues")
        .insert(venue)
        .select()
        .single();

      if (error) throw error;
      return data as Venue;
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
    mutationFn: async ({ id, ...updates }: VenueUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("venues")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Venue;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["venues", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["venue", data.id] });
    },
  });
}
