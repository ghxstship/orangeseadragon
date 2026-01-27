"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"];
type CalendarEventInsert = Database["public"]["Tables"]["calendar_events"]["Insert"];
type CalendarEventUpdate = Database["public"]["Tables"]["calendar_events"]["Update"];

export function useCalendarEvents(organizationId: string | null, startDate?: string, endDate?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["calendar-events", organizationId, startDate, endDate],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from("calendar_events")
        .select(`
          *,
          created_by_user:users!calendar_events_created_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("organization_id", organizationId);

      if (startDate) {
        query = query.gte("start_time", startDate);
      }
      if (endDate) {
        query = query.lte("end_time", endDate);
      }

      const { data, error } = await query.order("start_time", { ascending: true });

      if (error) throw error;

      return data.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        all_day: event.all_day,
        location: event.location,
        color: event.color,
        created_by_name: event.created_by_user?.full_name,
        recurrence_rule: event.recurrence_rule,
        visibility: event.visibility,
        created_at: event.created_at,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useCalendarEvent(eventId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["calendar-event", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from("calendar_events")
        .select(`
          *,
          calendar_event_attendees (
            *,
            user:users (
              id,
              full_name,
              email,
              avatar_url
            )
          )
        `)
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

export function useCreateCalendarEvent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: CalendarEventInsert) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events", data.organization_id] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CalendarEventUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events", data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["calendar-event", data.id] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events", organizationId] });
    },
  });
}
