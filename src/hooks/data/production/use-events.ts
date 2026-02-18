"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";
import type { Database } from "@/types/database";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const QUERY_STALE_TIME_MS = 2 * 60 * 1000;
const QUERY_GC_TIME_MS = 10 * 60 * 1000;

export function useEvents(organizationId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["events", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];

            const { data, error } = await supabase
                .from("events")
                .select(`
          *,
          created_by_user:users!events_created_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
                .eq("organization_id", organizationId)
                .is("deleted_at", null)
                .order("start_date", { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!organizationId,
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
    });
}

export function useEvent(eventId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["event", eventId],
        queryFn: async () => {
            if (!eventId) return null;

            const { data, error } = await supabase
                .from("events")
                .select(`
          *,
          created_by_user:users!events_created_by_fkey (
            id,
            full_name,
            avatar_url
          ),
          project:projects (
            id,
            name,
            slug
          )
        `)
                .eq("id", eventId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!eventId,
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
    });
}

export function useCreateEvent() {
    const supabase = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: EventInsert) => {
            const { data, error } = await supabase
                .from("events")
                .insert(event)
                .select()
                .single();

            if (error) throw error;
            return data as Event;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["events", data.organization_id] });
        },
    });
}

export function useUpdateEvent() {
    const supabase = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: EventUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from("events")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data as Event;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["events", data.organization_id] });
            queryClient.invalidateQueries({ queryKey: ["event", data.id] });
        },
    });
}

export function useDeleteEvent() {
    const supabase = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
            const { error } = await supabase
                .from("events")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;
            return { id, organizationId };
        },
        onSuccess: ({ organizationId }) => {
            queryClient.invalidateQueries({ queryKey: ["events", organizationId] });
        },
    });
}
