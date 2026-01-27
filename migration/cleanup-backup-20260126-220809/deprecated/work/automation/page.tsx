"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { automationPageConfig } from "@/config/pages/automation";

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: "active" | "paused" | "error";
  last_run?: string;
  run_count: number;
  success_rate: number;
}

export default function AutomationPage() {
  const [automationData, setAutomationData] = React.useState<Automation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAutomation() {
      try {
        const response = await fetch("/api/v1/automation");
        if (response.ok) {
          const result = await response.json();
          setAutomationData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch automation:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAutomation();
  }, []);

  const stats = React.useMemo(() => {
    const active = automationData.filter((a) => a.status === "active").length;
    const totalRuns = automationData.reduce((acc, a) => acc + (a.run_count || 0), 0);
    const errors = automationData.filter((a) => a.status === "error").length;
    return [
      { id: "total", label: "Total Automations", value: automationData.length },
      { id: "active", label: "Active", value: active },
      { id: "runs", label: "Total Runs", value: totalRuns },
      { id: "errors", label: "Errors", value: errors },
    ];
  }, [automationData]);

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
    <DataViewPage<Automation>
      config={automationPageConfig}
      data={automationData}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["name", "description", "trigger"]}
      onAction={handleAction}
    />
  );
}
