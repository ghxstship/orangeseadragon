"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { securityAlertsPageConfig } from "@/config/pages/security-alerts";

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved";
  type: string;
  source: string;
  timestamp: string;
  resolvedAt?: string;
}

export default function SecurityAlertsPage() {
  const [alertsData, setAlertsData] = React.useState<SecurityAlert[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("/api/v1/security-alerts");
        if (response.ok) {
          const result = await response.json();
          setAlertsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch security alerts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  const stats = React.useMemo(() => {
    const openCount = alertsData.filter((a) => a.status === "open").length;
    const investigatingCount = alertsData.filter((a) => a.status === "investigating").length;
    const criticalCount = alertsData.filter((a) => a.severity === "critical" && a.status !== "resolved").length;

    return [
      { id: "total", label: "Total Alerts", value: alertsData.length },
      { id: "open", label: "Open", value: openCount },
      { id: "investigating", label: "Investigating", value: investigatingCount },
      { id: "critical", label: "Critical", value: criticalCount },
    ];
  }, [alertsData]);

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
    <DataViewPage<SecurityAlert>
      config={securityAlertsPageConfig}
      data={alertsData}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["title", "description", "type", "source"]}
      onAction={handleAction}
    />
  );
}
