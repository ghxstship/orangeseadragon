"use client";

import { useState, useEffect, useCallback } from "react";

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

interface NotificationsResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<NotificationsResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));
      if (options.read !== undefined) params.set("read", String(options.read));
      if (options.type) params.set("type", options.type);

      const response = await fetch(`/api/v1/notifications?${params}`);
      
      if (!response.ok) {
        // API not implemented yet - return empty state gracefully
        setNotifications([]);
        setMeta({
          page: 1,
          limit: options.limit || 20,
          total: 0,
          totalPages: 0,
          unreadCount: 0,
        });
        return;
      }

      const data: NotificationsResponse = await response.json();
      setNotifications(data.data);
      setMeta(data.meta);
    } catch {
      // API not available - return empty state gracefully
      setNotifications([]);
      setMeta({
        page: 1,
        limit: options.limit || 20,
        total: 0,
        totalPages: 0,
        unreadCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.read, options.type]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
      )
    );
    if (meta) {
      setMeta({ ...meta, unreadCount: Math.max(0, meta.unreadCount - 1) });
    }
  }, [meta]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    if (meta) {
      setMeta({ ...meta, unreadCount: 0 });
    }
  }, [meta]);

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
