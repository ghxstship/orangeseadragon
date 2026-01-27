"use client";

import { useState, useEffect, useCallback } from "react";

interface AuditLogEntry {
  id: string;
  action: string;
  category: string;
  severity: string;
  actor: {
    id: string;
    type: string;
    name?: string;
    email?: string;
  };
  target?: {
    type: string;
    id: string;
    name?: string;
  };
  description: string;
  success: boolean;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface AuditLogsResponse {
  data: AuditLogEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseAuditLogsOptions {
  page?: number;
  limit?: number;
  action?: string;
  category?: string;
  severity?: string;
  actorId?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<AuditLogsResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));
      if (options.action) params.set("action", options.action);
      if (options.category) params.set("category", options.category);
      if (options.severity) params.set("severity", options.severity);
      if (options.actorId) params.set("actorId", options.actorId);
      if (options.targetType) params.set("targetType", options.targetType);
      if (options.startDate) params.set("startDate", options.startDate);
      if (options.endDate) params.set("endDate", options.endDate);

      const response = await fetch(`/api/v1/audit?${params}`);
      
      if (!response.ok) {
        // API not implemented yet - return empty state gracefully
        setLogs([]);
        setMeta({
          page: 1,
          limit: options.limit || 50,
          total: 0,
          totalPages: 0,
        });
        return;
      }

      const data: AuditLogsResponse = await response.json();
      setLogs(data.data);
      setMeta(data.meta);
    } catch {
      // API not available - return empty state gracefully
      setLogs([]);
      setMeta({
        page: 1,
        limit: options.limit || 50,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [
    options.page,
    options.limit,
    options.action,
    options.category,
    options.severity,
    options.actorId,
    options.targetType,
    options.startDate,
    options.endDate,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    meta,
    loading,
    error,
    refetch: fetchLogs,
  };
}
