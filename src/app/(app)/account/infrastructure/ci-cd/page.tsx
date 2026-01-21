"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { ciCdPipelinesPageConfig } from "@/config/pages/ci-cd-pipelines";

interface Pipeline {
  id: string;
  name: string;
  branch: string;
  commit: string;
  status: "success" | "failed" | "running" | "pending";
  stages: PipelineStage[];
  triggered_by: string;
  started_at: string;
  duration?: string;
}

interface PipelineStage {
  name: string;
  status: "success" | "failed" | "running" | "pending" | "skipped";
  duration?: string;
}

export default function CICDPipelinesPage() {
  const [pipelinesData, setPipelinesData] = React.useState<Pipeline[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPipelines() {
      try {
        const response = await fetch("/api/v1/ci-cd-pipelines");
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
    const successCount = pipelinesData.filter((p) => p.status === "success").length;
    const runningCount = pipelinesData.filter((p) => p.status === "running").length;
    const successRate = pipelinesData.length > 0
      ? Math.round((successCount / pipelinesData.length) * 100)
      : 0;

    return [
      { id: "total", label: "Total Pipelines", value: pipelinesData.length },
      { id: "successful", label: "Successful", value: successCount },
      { id: "running", label: "Running", value: runningCount },
      { id: "successRate", label: "Success Rate", value: `${successRate}%` },
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
      config={ciCdPipelinesPageConfig}
      data={pipelinesData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "branch", "commit"]}
      onAction={handleAction}
    />
  );
}
