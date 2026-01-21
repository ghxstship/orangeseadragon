"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { forecastScenariosPageConfig } from "@/config/pages/forecast-scenarios";

interface Scenario {
  id: string;
  name: string;
  description: string;
  revenue: string;
  probability: string;
}

export default function ForecastScenariosPage() {
  const [scenariosData, setScenariosData] = React.useState<Scenario[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchScenarios() {
      try {
        const response = await fetch("/api/v1/forecast/scenarios");
        if (response.ok) {
          const result = await response.json();
          setScenariosData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch scenarios:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchScenarios();
  }, []);

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
    <DataViewPage<Scenario>
      config={forecastScenariosPageConfig}
      data={scenariosData}
      getRowId={(s) => s.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
