"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { insightsAnomaliesPageConfig } from "@/config/pages/insights-anomalies";

interface Anomaly {
  id: string;
  metric: string;
  change: string;
  expected: string;
  severity: "high" | "medium" | "low";
  detected: string;
}

export default function InsightsAnomaliesPage() {
  const [anomaliesData, setAnomaliesData] = React.useState<Anomaly[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAnomalies() {
      try {
        const response = await fetch("/api/v1/insights/anomalies");
        if (response.ok) {
          const result = await response.json();
          setAnomaliesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch anomalies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnomalies();
  }, []);

  const stats = React.useMemo(() => {
    const highCount = anomaliesData.filter((a) => a.severity === "high").length;
    return [
      { id: "total", label: "Total Anomalies", value: anomaliesData.length },
      { id: "high", label: "High Severity", value: highCount },
      { id: "resolved", label: "Resolved", value: 0 },
    ];
  }, [anomaliesData]);

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
    <DataViewPage<Anomaly>
      config={insightsAnomaliesPageConfig}
      data={anomaliesData}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["metric"]}
      onAction={handleAction}
    />
  );
}
