"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { alertsPageConfig } from "@/config/pages/alerts";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("/api/v1/alerts");
        if (response.ok) {
          const result = await response.json();
          setAlerts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  const stats = React.useMemo(() => {
    const unacknowledged = alerts.filter((a) => !a.acknowledged).length;
    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const warningCount = alerts.filter((a) => a.severity === "warning").length;

    return [
      { id: "total", label: "Total Alerts", value: alerts.length },
      { id: "unacknowledged", label: "Unacknowledged", value: unacknowledged },
      { id: "critical", label: "Critical", value: criticalCount },
      { id: "warnings", label: "Warnings", value: warningCount },
    ];
  }, [alerts]);

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
    <DataViewPage<Alert>
      config={alertsPageConfig}
      data={alerts}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["title", "message", "source"]}
      onAction={handleAction}
    />
  );
}
