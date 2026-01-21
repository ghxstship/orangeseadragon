"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { healthChecksPageConfig } from "@/config/pages/health-checks";

interface HealthCheck {
  id: string;
  name: string;
  endpoint: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  lastChecked: string;
  uptime: number;
}

export default function HealthChecksPage() {
  const [checksData, setChecksData] = React.useState<HealthCheck[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchChecks() {
      try {
        const response = await fetch("/api/v1/health-checks");
        if (response.ok) {
          const result = await response.json();
          setChecksData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch health checks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChecks();
  }, []);

  const stats = React.useMemo(() => {
    const healthyCount = checksData.filter((h) => h.status === "healthy").length;
    const degradedCount = checksData.filter((h) => h.status === "degraded").length;
    const avgResponse = checksData.length > 0
      ? Math.round(checksData.reduce((acc, h) => acc + (h.responseTime || 0), 0) / checksData.length)
      : 0;
    return [
      { id: "total", label: "Total Services", value: checksData.length },
      { id: "healthy", label: "Healthy", value: healthyCount },
      { id: "degraded", label: "Degraded", value: degradedCount },
      { id: "avgResponse", label: "Avg Response", value: `${avgResponse}ms` },
    ];
  }, [checksData]);

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
    <DataViewPage<HealthCheck>
      config={healthChecksPageConfig}
      data={checksData}
      stats={stats}
      getRowId={(h) => h.id}
      searchFields={["name", "endpoint"]}
      onAction={handleAction}
    />
  );
}
