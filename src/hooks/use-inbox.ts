"use client";

import { useState, useEffect, useCallback } from "react";

export interface InboxItem {
  id: string;
  type: "message" | "approval" | "review" | "mention" | "assignment";
  title: string;
  description?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface InboxResponse {
  data: InboxItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

interface UseInboxOptions {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: InboxItem["type"];
}

export function useInbox(options: UseInboxOptions = {}) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [meta, setMeta] = useState<InboxResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));
      if (options.read !== undefined) params.set("read", String(options.read));
      if (options.type) params.set("type", options.type);

      const response = await fetch(`/api/v1/inbox?${params}`);
      
      if (!response.ok) {
        // API not implemented yet - return empty state gracefully
        setItems([]);
        setMeta({
          page: 1,
          limit: options.limit || 20,
          total: 0,
          totalPages: 0,
          unreadCount: 0,
        });
        return;
      }

      const data: InboxResponse = await response.json();
      setItems(data.data);
      setMeta(data.meta);
    } catch {
      // API not available - return empty state gracefully
      setItems([]);
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
    fetchInbox();
  }, [fetchInbox]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/v1/inbox/${id}/read`, { method: "POST" });
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );
      if (meta) {
        setMeta({ ...meta, unreadCount: Math.max(0, meta.unreadCount - 1) });
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [meta]);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/v1/inbox/read-all", { method: "POST" });
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      if (meta) {
        setMeta({ ...meta, unreadCount: 0 });
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, [meta]);

  return {
    items,
    meta,
    loading,
    error,
    refetch: fetchInbox,
    markAsRead,
    markAllAsRead,
    unreadCount: meta?.unreadCount ?? 0,
  };
}
