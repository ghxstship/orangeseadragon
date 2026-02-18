"use client";

/**
 * Real-Time Runsheet Hook
 * 
 * Provides real-time synchronization for runsheets and show calling.
 * Supports live cue updates, presence tracking, and show call logging.
 */

import { useEffect, useState, useCallback } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useSupabase } from "../auth/use-supabase";
import type { Database } from "@/types/database";

type Runsheet = Database["public"]["Tables"]["runsheets"]["Row"];
type RunsheetItem = Database["public"]["Tables"]["runsheet_items"]["Row"];

interface RunsheetWithItems extends Runsheet {
  items: RunsheetItem[];
}

interface ShowCallAction {
  runsheetId: string;
  itemId?: string;
  action: "go" | "standby" | "skip" | "pause" | "resume" | "reset" | "note";
  notes?: string;
}

export function useRunsheetRealtime(runsheetId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);

  // Fetch runsheet with items
  const { data: runsheet, isLoading, error } = useQuery({
    queryKey: ["runsheet", runsheetId],
    queryFn: async () => {
      if (!runsheetId) return null;

      const { data: runsheetData, error: runsheetError } = await supabase
        .from("runsheets")
        .select(`
          *,
          event:events (id, name),
          stage:stages (id, name)
        `)
        .eq("id", runsheetId)
        .single();

      if (runsheetError) throw runsheetError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("runsheet_items")
        .select("*")
        .eq("runsheet_id", runsheetId)
        .order("item_order", { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...runsheetData,
        items: itemsData ?? [],
      } as RunsheetWithItems;
    },
    enabled: !!runsheetId,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!runsheetId) return;

    // Subscribe to runsheet changes
    const runsheetChannel = supabase
      .channel(`runsheet:${runsheetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "runsheets",
          filter: `id=eq.${runsheetId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["runsheet", runsheetId] });
        }
      )
      .subscribe();

    // Subscribe to runsheet items changes
    const itemsChannel = supabase
      .channel(`runsheet_items:${runsheetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "runsheet_items",
          filter: `runsheet_id=eq.${runsheetId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["runsheet", runsheetId] });
        }
      )
      .subscribe();

    return () => {
      runsheetChannel.unsubscribe();
      itemsChannel.unsubscribe();
    };
  }, [runsheetId, supabase, queryClient]);

  // Update runsheet status
  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      if (!runsheetId) throw new Error("No runsheet ID");

      const updates: Record<string, unknown> = { status };
      
      if (status === "live") {
        updates.actual_start = new Date().toISOString();
        setIsLive(true);
      } else if (status === "completed") {
        updates.actual_end = new Date().toISOString();
        setIsLive(false);
      }

      const { error } = await supabase
        .from("runsheets")
        .update(updates)
        .eq("id", runsheetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runsheet", runsheetId] });
    },
  });

  // Update item status (for cue calling)
  const updateItemStatus = useMutation({
    mutationFn: async ({ itemId, status, actualStart, actualEnd }: {
      itemId: string;
      status: string;
      actualStart?: string;
      actualEnd?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (actualStart) updates.start_time_actual = actualStart;
      if (actualEnd) updates.end_time_actual = actualEnd;

      const { error } = await supabase
        .from("runsheet_items")
        .update(updates)
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runsheet", runsheetId] });
    },
  });

  // Log show call action
  const logShowCall = useMutation({
    mutationFn: async (action: ShowCallAction) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", userData.user.id)
        .single();

      const { error } = await supabase
        .from("show_call_logs")
        .insert({
          runsheet_id: action.runsheetId,
          runsheet_item_id: action.itemId,
          action: action.action,
          called_by: userData.user.id,
          called_by_name: profile?.full_name ?? "Unknown",
          notes: action.notes,
        });

      if (error) throw error;
    },
  });

  // Show calling actions
  const startShow = useCallback(async () => {
    await updateStatus.mutateAsync("live");
    await logShowCall.mutateAsync({
      runsheetId: runsheetId!,
      action: "go",
      notes: "Show started",
    });
  }, [runsheetId, updateStatus, logShowCall]);

  const endShow = useCallback(async () => {
    await updateStatus.mutateAsync("completed");
    await logShowCall.mutateAsync({
      runsheetId: runsheetId!,
      action: "pause",
      notes: "Show ended",
    });
  }, [runsheetId, updateStatus, logShowCall]);

  const goCue = useCallback(async (itemId: string) => {
    await updateItemStatus.mutateAsync({
      itemId,
      status: "go",
      actualStart: new Date().toISOString(),
    });
    await logShowCall.mutateAsync({
      runsheetId: runsheetId!,
      itemId,
      action: "go",
    });
  }, [runsheetId, updateItemStatus, logShowCall]);

  const standbyCue = useCallback(async (itemId: string) => {
    await updateItemStatus.mutateAsync({
      itemId,
      status: "standby",
    });
    await logShowCall.mutateAsync({
      runsheetId: runsheetId!,
      itemId,
      action: "standby",
    });
  }, [runsheetId, updateItemStatus, logShowCall]);

  const skipCue = useCallback(async (itemId: string) => {
    await updateItemStatus.mutateAsync({
      itemId,
      status: "skipped",
    });
    await logShowCall.mutateAsync({
      runsheetId: runsheetId!,
      itemId,
      action: "skip",
    });
  }, [runsheetId, updateItemStatus, logShowCall]);

  const completeCue = useCallback(async (itemId: string) => {
    await updateItemStatus.mutateAsync({
      itemId,
      status: "complete",
      actualEnd: new Date().toISOString(),
    });
  }, [updateItemStatus]);

  const resetCue = useCallback(async (itemId: string) => {
    await updateItemStatus.mutateAsync({
      itemId,
      status: "pending",
    });
    await logShowCall.mutateAsync({
      runsheetId: runsheetId!,
      itemId,
      action: "reset",
    });
  }, [runsheetId, updateItemStatus, logShowCall]);

  return {
    runsheet,
    isLoading,
    error,
    isLive,
    startShow,
    endShow,
    goCue,
    standbyCue,
    skipCue,
    completeCue,
    resetCue,
  };
}

/**
 * Hook for show call log history
 */
export function useShowCallLogs(runsheetId: string | null, limit = 50) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["show_call_logs", runsheetId],
    queryFn: async () => {
      if (!runsheetId) return [];

      const { data, error } = await supabase
        .from("show_call_logs")
        .select(`
          *,
          runsheet_item:runsheet_items (id, name)
        `)
        .eq("runsheet_id", runsheetId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!runsheetId,
  });
}
