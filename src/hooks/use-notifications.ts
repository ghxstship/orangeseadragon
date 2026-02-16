"use client";

import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "@/lib/api/error-message";
import { useSupabase, useUser } from "@/hooks/use-supabase";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  actionUrl?: string;
  userId: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
  enabled?: boolean;
  summaryOnly?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const supabase = useSupabase();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<NotificationsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const limit = options.limit || 20;
  const page = options.page || 1;
  const enabled = options.enabled ?? true;
  const summaryOnly = options.summaryOnly ?? false;

  const fetchNotifications = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setNotifications([]);
        setMeta({ page, limit, total: 0, totalPages: 0, unreadCount: 0 });
        return;
      }

      const { count: unreadCount } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (summaryOnly) {
        setNotifications([]);
        setMeta({
          page,
          limit,
          total: 0,
          totalPages: 0,
          unreadCount: unreadCount ?? 0,
        });
        return;
      }

      let query = supabase
        .from("notifications")
        .select("id,type,title,message,is_read,data,entity_type,entity_id,user_id,created_at,read_at", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (options.read !== undefined) {
        query = query.eq("is_read", options.read);
      }
      if (options.type) {
        query = query.eq("type", options.type);
      }

      const { data, count, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const total = count ?? 0;
      const mapped: Notification[] = (data ?? []).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message ?? "",
        read: n.is_read ?? false,
        data: n.data as Record<string, unknown> | undefined,
        actionUrl: n.entity_type && n.entity_id ? `/${n.entity_type}/${n.entity_id}` : undefined,
        userId: n.user_id,
        createdAt: n.created_at ?? new Date().toISOString(),
        readAt: n.read_at ?? undefined,
      }));

      setNotifications(mapped);
      setMeta({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount: unreadCount ?? 0,
      });
    } catch (err) {
      setError(new Error(getErrorMessage(err, "Failed to fetch notifications")));
      setNotifications([]);
      setMeta({ page, limit, total: 0, totalPages: 0, unreadCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [enabled, user, page, limit, options.read, options.type, summaryOnly, supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!enabled || !user?.id) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, user?.id, fetchNotifications, supabase]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
      )
    );
    if (meta) {
      setMeta({ ...meta, unreadCount: Math.max(0, meta.unreadCount - 1) });
    }
  }, [meta, supabase]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    if (meta) {
      setMeta({ ...meta, unreadCount: 0 });
    }
  }, [meta, supabase, user]);

  return {
    notifications,
    meta,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount: meta?.unreadCount ?? 0,
  };
}
