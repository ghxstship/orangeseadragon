"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { insightsTrendsPageConfig } from "@/config/pages/insights-trends";

interface Trend {
  id: string;
  metric: string;
  direction: "up" | "down" | "stable";
  change: string;
  period: string;
  current_value: string;
  previous_value: string;
  category: string;
}

export default function InsightsTrendsPage() {
  const [trendsData, setTrendsData] = React.useState<Trend[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch("/api/v1/insights/trends");
        if (response.ok) {
          const result = await response.json();
          setTrendsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch trends:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  const stats = React.useMemo(() => {
    const improving = trendsData.filter((t) => t.direction === "up").length;
    const declining = trendsData.filter((t) => t.direction === "down").length;
    const stable = trendsData.filter((t) => t.direction === "stable").length;
    return [
      { id: "total", label: "Total Metrics", value: trendsData.length },
      { id: "improving", label: "Improving", value: improving },
      { id: "declining", label: "Declining", value: declining },
      { id: "stable", label: "Stable", value: stable },
    ];
  }, [trendsData]);

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
    <DataViewPage<Trend>
      config={insightsTrendsPageConfig}
      data={trendsData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["metric"]}
      onAction={handleAction}
    />
  );
}
