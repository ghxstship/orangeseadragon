"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { auditTrailPageConfig } from "@/config/pages/audit-trail";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: "create" | "update" | "delete" | "view" | "export";
  resource: string;
  resource_id: string;
  details: string;
  ip_address: string;
}

export default function AuditTrailPage() {
  const [auditTrailData, setAuditTrailData] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAuditTrail() {
      try {
        const response = await fetch("/api/v1/audit-trail");
        if (response.ok) {
          const result = await response.json();
          setAuditTrailData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch audit trail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAuditTrail();
  }, []);

  const stats = React.useMemo(() => {
    const createCount = auditTrailData.filter((e) => e.action === "create").length;
    const updateCount = auditTrailData.filter((e) => e.action === "update").length;
    const deleteCount = auditTrailData.filter((e) => e.action === "delete").length;

    return [
      { id: "total", label: "Today's Activities", value: auditTrailData.length },
      { id: "creates", label: "Creates", value: createCount },
      { id: "updates", label: "Updates", value: updateCount },
      { id: "deletes", label: "Deletes", value: deleteCount },
    ];
  }, [auditTrailData]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<AuditEntry>
      config={auditTrailPageConfig}
      data={auditTrailData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["user", "resource", "details"]}
      onAction={handleAction}
    />
  );
}
