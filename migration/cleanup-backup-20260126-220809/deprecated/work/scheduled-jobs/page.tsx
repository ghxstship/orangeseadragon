"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { scheduledJobsPageConfig } from "@/config/pages/scheduled-jobs";

interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  next_run: string;
  last_run?: string;
  status: "active" | "paused" | "error";
  last_status: "success" | "failed" | "running" | "pending";
  duration?: number;
}

export default function ScheduledJobsPage() {
  const [scheduledJobsData, setScheduledJobsData] = React.useState<ScheduledJob[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchScheduledJobs() {
      try {
        const response = await fetch("/api/v1/scheduled-jobs");
        if (response.ok) {
          const result = await response.json();
          setScheduledJobsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch scheduled jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchScheduledJobs();
  }, []);

  const stats = React.useMemo(() => {
    const activeJobs = scheduledJobsData.filter((j) => j.status === "active").length;
    const errorJobs = scheduledJobsData.filter((j) => j.status === "error").length;
    const nextRun = scheduledJobsData.filter((j) => j.status === "active").sort((a, b) => new Date(a.next_run).getTime() - new Date(b.next_run).getTime())[0]?.next_run || "";
    return [
      { id: "total", label: "Total Jobs", value: scheduledJobsData.length },
      { id: "active", label: "Active", value: activeJobs },
      { id: "errors", label: "Errors", value: errorJobs },
      { id: "nextRun", label: "Next Run", value: nextRun ? new Date(nextRun).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-" },
    ];
  }, [scheduledJobsData]);

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
    <DataViewPage<ScheduledJob>
      config={scheduledJobsPageConfig}
      data={scheduledJobsData}
      stats={stats}
      getRowId={(j) => j.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
