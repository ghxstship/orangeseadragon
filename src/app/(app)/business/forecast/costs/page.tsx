"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { forecastCostsPageConfig } from "@/config/pages/forecast-costs";

interface CostForecast {
  id: string;
  category: string;
  current: number;
  projected: number;
  change: number;
}

export default function ForecastCostsPage() {
  const [costForecastsData, setCostForecastsData] = React.useState<CostForecast[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCostForecasts() {
      try {
        const response = await fetch("/api/v1/forecast/costs");
        if (response.ok) {
          const result = await response.json();
          setCostForecastsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch cost forecasts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCostForecasts();
  }, []);

  const stats = React.useMemo(() => {
    const currentCosts = costForecastsData.reduce((acc, c) => acc + (c.current || 0), 0);
    const projectedCosts = costForecastsData.reduce((acc, c) => acc + (c.projected || 0), 0);
    const changePercent = currentCosts > 0 ? ((projectedCosts - currentCosts) / currentCosts * 100).toFixed(1) : "0";
    return [
      { id: "current", label: "Current Costs", value: currentCosts, format: "currency" as const },
      { id: "projected", label: "Projected (Q3)", value: projectedCosts, format: "currency" as const },
      { id: "change", label: "Change", value: `${Number(changePercent) >= 0 ? "+" : ""}${changePercent}%` },
    ];
  }, [costForecastsData]);

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
    <DataViewPage<CostForecast>
      config={forecastCostsPageConfig}
      data={costForecastsData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["category"]}
      onAction={handleAction}
    />
  );
}
