"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { forecastRevenuePageConfig } from "@/config/pages/forecast-revenue";

interface RevenueForecast {
  id: string;
  month: string;
  projected: number;
  confidence: "high" | "medium" | "low";
}

export default function ForecastRevenuePage() {
  const [revenueForecastsData, setRevenueForecastsData] = React.useState<RevenueForecast[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRevenueForecasts() {
      try {
        const response = await fetch("/api/v1/forecast/revenue");
        if (response.ok) {
          const result = await response.json();
          setRevenueForecastsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch revenue forecasts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRevenueForecasts();
  }, []);

  const stats = React.useMemo(() => {
    const q3Forecast = revenueForecastsData.reduce((acc, r) => acc + (r.projected || 0), 0);
    return [
      { id: "q3", label: "Q3 Forecast", value: q3Forecast, format: "currency" as const },
      { id: "ytd", label: "YTD Actual", value: 425000, format: "currency" as const },
      { id: "annual", label: "Annual Target", value: 1200000, format: "currency" as const },
    ];
  }, [revenueForecastsData]);

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
    <DataViewPage<RevenueForecast>
      config={forecastRevenuePageConfig}
      data={revenueForecastsData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["month"]}
      onAction={handleAction}
    />
  );
}
