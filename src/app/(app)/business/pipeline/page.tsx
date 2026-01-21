"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { pipelinePageConfig } from "@/config/pages/pipeline";

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  expected_close: string;
  owner: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PipelinePage() {
  const [dealsData, setDealsData] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch("/api/v1/pipeline");
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
    const totalValue = dealsData.reduce((acc, d) => acc + (d.value || 0), 0);
    const weightedValue = dealsData.reduce((acc, d) => acc + ((d.value || 0) * (d.probability || 0) / 100), 0);
    const wonDeals = dealsData.filter((d) => d.stage === "closed_won");
    const activeDeals = dealsData.filter((d) => !d.stage?.startsWith("closed_"));
    return [
      { id: "total", label: "Total Pipeline", value: formatCurrency(totalValue) },
      { id: "weighted", label: "Weighted Value", value: formatCurrency(weightedValue) },
      { id: "active", label: "Active Deals", value: activeDeals.length },
      { id: "won", label: "Won This Month", value: formatCurrency(wonDeals.reduce((acc, d) => acc + (d.value || 0), 0)) },
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
      config={pipelinePageConfig}
      data={dealsData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["name", "company", "owner"]}
      onAction={handleAction}
    />
  );
}
