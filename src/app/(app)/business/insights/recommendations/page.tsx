"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { insightsRecommendationsPageConfig } from "@/config/pages/insights-recommendations";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: string;
}

export default function InsightsRecommendationsPage() {
  const [recommendationsData, setRecommendationsData] = React.useState<Recommendation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/v1/insights/recommendations");
        if (response.ok) {
          const result = await response.json();
          setRecommendationsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
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
    <DataViewPage<Recommendation>
      config={insightsRecommendationsPageConfig}
      data={recommendationsData}
      getRowId={(r) => r.id}
      searchFields={["title", "description"]}
      onAction={handleAction}
    />
  );
}
