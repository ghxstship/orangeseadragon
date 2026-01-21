"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { tasksWatchingPageConfig } from "@/config/pages/tasks-watching";

interface WatchedTask {
  id: string;
  title: string;
  assignee: string;
  project: string;
  due_date: string;
  status: "todo" | "in_progress" | "completed";
  last_update: string;
}

export default function WatchingTasksPage() {
  const [watchedTasksData, setWatchedTasksData] = React.useState<WatchedTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWatchedTasks() {
      try {
        const response = await fetch("/api/v1/work/tasks/watching");
        if (response.ok) {
          const result = await response.json();
          setWatchedTasksData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch watched tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchedTasks();
  }, []);

  const stats = React.useMemo(() => {
    const completed = watchedTasksData.filter((t) => t.status === "completed").length;
    return [
      { id: "watching", label: "Watching", value: watchedTasksData.length },
      { id: "updated", label: "Updated Today", value: 1 },
      { id: "completed", label: "Completed", value: completed },
    ];
  }, [watchedTasksData]);

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
    <DataViewPage<WatchedTask>
      config={tasksWatchingPageConfig}
      data={watchedTasksData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["title", "assignee", "project"]}
      onAction={handleAction}
    />
  );
}
