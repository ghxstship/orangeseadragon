"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { tasksMyTasksPageConfig } from "@/config/pages/tasks-my-tasks";

interface Task {
  id: string;
  title: string;
  project: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "completed";
  completed: boolean;
}

export default function MyTasksPage() {
  const [tasksData, setTasksData] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMyTasks() {
      try {
        const response = await fetch("/api/v1/work/tasks/my-tasks");
        if (response.ok) {
          const result = await response.json();
          setTasksData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch my tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTasks();
  }, []);

  const stats = React.useMemo(() => {
    const inProgress = tasksData.filter((t) => t.status === "in_progress").length;
    const completed = tasksData.filter((t) => t.completed).length;
    const highPriority = tasksData.filter((t) => t.priority === "high" && !t.completed).length;
    return [
      { id: "total", label: "Total Tasks", value: tasksData.length },
      { id: "inProgress", label: "In Progress", value: inProgress },
      { id: "completed", label: "Completed", value: completed },
      { id: "highPriority", label: "High Priority", value: highPriority },
    ];
  }, [tasksData]);

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
    <DataViewPage<Task>
      config={tasksMyTasksPageConfig}
      data={tasksData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["title", "project"]}
      onAction={handleAction}
    />
  );
}
