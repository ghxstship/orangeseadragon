"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { insightsPredictionsPageConfig } from "@/config/pages/insights-predictions";

interface Prediction {
  id: string;
  prediction: string;
  confidence: string;
  impact: string;
  timeframe: string;
}

export default function InsightsPredictionsPage() {
  const [predictionsData, setPredictionsData] = React.useState<Prediction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPredictions() {
      try {
        const response = await fetch("/api/v1/insights/predictions");
        if (response.ok) {
          const result = await response.json();
          setPredictionsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
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
    <DataViewPage<Prediction>
      config={insightsPredictionsPageConfig}
      data={predictionsData}
      getRowId={(p) => p.id}
      searchFields={["prediction"]}
      onAction={handleAction}
    />
  );
}
