"use client";

import * as React from "react";
import { BoardPage } from "@/components/common";
import { workTasksPageConfig } from "@/config/pages/work-tasks";
import { Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  projectName: string;
  dueDate: string | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/v1/tasks");
        if (response.ok) {
          const result = await response.json();
          const mappedTasks = (result.data || []).map((t: Record<string, unknown>) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            projectName: (t.project as { name?: string } | null)?.name || "No Project",
            dueDate: t.due_date ? `Due ${t.due_date}` : null,
          }));
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Task action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <BoardPage
      config={workTasksPageConfig}
      data={tasks}
      getRowId={(task) => task.id}
      onAction={handleAction}
    />
  );
}
