"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { tasksCompletedPageConfig } from "@/config/pages/tasks-completed";

interface CompletedTask {
  id: string;
  title: string;
  completed_by: string;
  project: string;
  completed_date: string;
  duration: string;
}

export default function CompletedTasksPage() {
  const [completedTasksData, setCompletedTasksData] = React.useState<CompletedTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCompletedTasks() {
      try {
        const response = await fetch("/api/v1/work/tasks/completed");
        if (response.ok) {
          const result = await response.json();
          setCompletedTasksData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch completed tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompletedTasks();
  }, []);

  const stats = React.useMemo(() => [
    { id: "week", label: "Completed This Week", value: completedTasksData.length },
    { id: "month", label: "Completed This Month", value: 24 },
    { id: "avgTime", label: "Avg Completion Time", value: "2.8 days" },
  ], [completedTasksData]);

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
    <DataViewPage<CompletedTask>
      config={tasksCompletedPageConfig}
      data={completedTasksData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["title", "completed_by", "project"]}
      onAction={handleAction}
    />
  );
}
