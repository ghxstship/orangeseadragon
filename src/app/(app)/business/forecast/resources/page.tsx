"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { forecastResourcesPageConfig } from "@/config/pages/forecast-resources";

interface ResourceForecast {
  id: string;
  resource: string;
  current: number;
  projected: number;
  capacity: number;
}

export default function ForecastResourcesPage() {
  const [resourceForecastsData, setResourceForecastsData] = React.useState<ResourceForecast[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchResourceForecasts() {
      try {
        const response = await fetch("/api/v1/forecast/resources");
        if (response.ok) {
          const result = await response.json();
          setResourceForecastsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch resource forecasts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResourceForecasts();
  }, []);

  const stats = React.useMemo(() => {
    const staff = resourceForecastsData.find(r => r.resource === "Staff");
    const equipment = resourceForecastsData.find(r => r.resource === "Equipment Sets");
    const venues = resourceForecastsData.find(r => r.resource === "Venues Booked");
    return [
      { id: "staff", label: "Staff", value: staff ? `${staff.current} → ${staff.projected}` : "N/A" },
      { id: "equipment", label: "Equipment", value: equipment ? `${equipment.current} → ${equipment.projected}` : "N/A" },
      { id: "venues", label: "Venues", value: venues ? `${venues.current} → ${venues.projected}` : "N/A" },
    ];
  }, [resourceForecastsData]);

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
    <DataViewPage<ResourceForecast>
      config={forecastResourcesPageConfig}
      data={resourceForecastsData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["resource"]}
      onAction={handleAction}
    />
  );
}
