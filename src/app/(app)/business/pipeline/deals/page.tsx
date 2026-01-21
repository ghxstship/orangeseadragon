"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { pipelineDealsPageConfig } from "@/config/pages/pipeline-deals";

interface Deal {
  id: string;
  name: string;
  company: string;
  value: string;
  stage: string;
  probability: number;
}

export default function PipelineDealsPage() {
  const [dealsData, setDealsData] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch("/api/v1/pipeline/deals");
        if (response.ok) {
          const result = await response.json();
          setDealsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch deals:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  const stats = React.useMemo(() => {
    const totalPipeline = dealsData.reduce((s, d) => s + parseInt((d.value || "0").replace(/\D/g, "") || "0"), 0);
    const avgDealSize = dealsData.length > 0 ? Math.round(totalPipeline / dealsData.length) : 0;
    return [
      { id: "pipeline", label: "Total Pipeline", value: `$${(totalPipeline / 1000).toFixed(0)}K` },
      { id: "deals", label: "Active Deals", value: dealsData.length },
      { id: "avg", label: "Avg Deal Size", value: `$${(avgDealSize / 1000).toFixed(0)}K` },
    ];
  }, [dealsData]);

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
    <DataViewPage<Deal>
      config={pipelineDealsPageConfig}
      data={dealsData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["name", "company"]}
      onAction={handleAction}
    />
  );
}
