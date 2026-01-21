"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { auditLogPageConfig } from "@/config/pages/audit-log";

interface AuditEntry {
  id: string;
  action: string;
  category: "auth" | "data" | "settings" | "security" | "system";
  severity: "info" | "warning" | "critical";
  user: string;
  user_email: string;
  ip_address: string;
  timestamp: string;
  details: string;
  resource?: string;
}

export default function AuditLogPage() {
  const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAuditEntries() {
      try {
        const response = await fetch("/api/v1/audit-log");
        if (response.ok) {
          const result = await response.json();
          setAuditEntries(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch audit log:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAuditEntries();
  }, []);

  const stats = React.useMemo(() => {
    const criticalEvents = auditEntries.filter((e) => e.severity === "critical").length;
    const warningEvents = auditEntries.filter((e) => e.severity === "warning").length;
    const todayEvents = auditEntries.filter((e) => {
      const date = new Date(e.timestamp);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;

    return [
      { id: "total", label: "Total Events", value: auditEntries.length },
      { id: "today", label: "Today", value: todayEvents },
      { id: "warnings", label: "Warnings", value: warningEvents },
      { id: "critical", label: "Critical", value: criticalEvents },
    ];
  }, [auditEntries]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "export":
          console.log("Export audit log");
          break;
        case "view":
          console.log("View entry details", payload);
          break;
        case "copy":
          console.log("Copy entry", payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<AuditEntry>
      config={auditLogPageConfig}
      data={auditEntries}
      stats={stats}
      getRowId={(entry) => entry.id}
      searchFields={["action", "user", "details"]}
      onAction={handleAction}
    />
  );
}
