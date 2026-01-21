"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataPipelinesPageConfig } from "@/config/pages/data-pipelines";

interface Pipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: "active" | "paused" | "error" | "running";
  schedule: string;
  last_run: string;
  records_processed: number;
}

export default function DataPipelinesPage() {
  const [pipelinesData, setPipelinesData] = React.useState<Pipeline[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPipelines() {
      try {
        const response = await fetch("/api/v1/data-pipelines");
        if (response.ok) {
          const result = await response.json();
          setPipelinesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch pipelines:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPipelines();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = pipelinesData.filter((p) => p.status === "active" || p.status === "running").length;
    const errorCount = pipelinesData.filter((p) => p.status === "error").length;
    const totalProcessed = pipelinesData.reduce((acc, p) => acc + (p.records_processed || 0), 0);

    return [
      { id: "total", label: "Total Pipelines", value: pipelinesData.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "errors", label: "Errors", value: errorCount },
      { id: "records", label: "Records Today", value: totalProcessed.toLocaleString() },
    ];
  }, [pipelinesData]);

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
    <DataViewPage<Pipeline>
      config={dataPipelinesPageConfig}
      data={pipelinesData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "source", "destination"]}
      onAction={handleAction}
    />
  );
}
