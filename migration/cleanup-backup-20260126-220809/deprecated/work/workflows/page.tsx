"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { workflowsPageConfig } from "@/config/pages/workflows";

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  is_active: boolean;
  runs_total: number;
  runs_success: number;
  runs_failed: number;
  last_run: string | null;
}

export default function WorkflowsPage() {
  const [workflowsData, setWorkflowsData] = React.useState<Workflow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWorkflows() {
      try {
        const response = await fetch("/api/v1/work/workflows");
        if (response.ok) {
          const result = await response.json();
          setWorkflowsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflows();
  }, []);

  const stats = React.useMemo(() => {
    const active = workflowsData.filter((w) => w.is_active).length;
    const totalRuns = workflowsData.reduce((acc, w) => acc + (w.runs_total || 0), 0);
    const totalSuccess = workflowsData.reduce((acc, w) => acc + (w.runs_success || 0), 0);
    const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0;
    return [
      { id: "total", label: "Total Workflows", value: workflowsData.length },
      { id: "active", label: "Active", value: active },
      { id: "runs", label: "Total Runs", value: totalRuns },
      { id: "success", label: "Success Rate", value: `${successRate}%` },
    ];
  }, [workflowsData]);

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
    <DataViewPage<Workflow>
      config={workflowsPageConfig}
      data={workflowsData}
      stats={stats}
      getRowId={(w) => w.id}
      searchFields={["name", "description", "category"]}
      onAction={handleAction}
    />
  );
}
