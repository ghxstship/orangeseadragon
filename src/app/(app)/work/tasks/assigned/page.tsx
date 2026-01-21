"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { tasksAssignedPageConfig } from "@/config/pages/tasks-assigned";

interface AssignedTask {
  id: string;
  title: string;
  assignee: string;
  project: string;
  due_date: string;
  status: "todo" | "in_progress" | "completed";
}

export default function AssignedTasksPage() {
  const [assignedTasksData, setAssignedTasksData] = React.useState<AssignedTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAssignedTasks() {
      try {
        const response = await fetch("/api/v1/work/tasks/assigned");
        if (response.ok) {
          const result = await response.json();
          setAssignedTasksData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch assigned tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignedTasks();
  }, []);

  const stats = React.useMemo(() => {
    const inProgress = assignedTasksData.filter((t) => t.status === "in_progress").length;
    const completed = assignedTasksData.filter((t) => t.status === "completed").length;
    return [
      { id: "total", label: "Total Assigned", value: assignedTasksData.length },
      { id: "inProgress", label: "In Progress", value: inProgress },
      { id: "completed", label: "Completed", value: completed },
      { id: "overdue", label: "Overdue", value: 0 },
    ];
  }, [assignedTasksData]);

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
    <DataViewPage<AssignedTask>
      config={tasksAssignedPageConfig}
      data={assignedTasksData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["title", "assignee", "project"]}
      onAction={handleAction}
    />
  );
}
