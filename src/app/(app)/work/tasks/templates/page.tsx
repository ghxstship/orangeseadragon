"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { tasksTemplatesPageConfig } from "@/config/pages/tasks-templates";

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  tasks: number;
  category: string;
  used_count: number;
}

export default function TaskTemplatesPage() {
  const [taskTemplatesData, setTaskTemplatesData] = React.useState<TaskTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTaskTemplates() {
      try {
        const response = await fetch("/api/v1/work/tasks/templates");
        if (response.ok) {
          const result = await response.json();
          setTaskTemplatesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch task templates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTaskTemplates();
  }, []);

  const stats = React.useMemo(() => {
    const totalTasks = taskTemplatesData.reduce((sum, t) => sum + (t.tasks || 0), 0);
    const totalUsed = taskTemplatesData.reduce((sum, t) => sum + (t.used_count || 0), 0);
    const categories = new Set(taskTemplatesData.map((t) => t.category)).size;
    return [
      { id: "total", label: "Total Templates", value: taskTemplatesData.length },
      { id: "tasks", label: "Total Tasks", value: totalTasks },
      { id: "used", label: "Times Used", value: totalUsed },
      { id: "categories", label: "Categories", value: categories },
    ];
  }, [taskTemplatesData]);

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
    <DataViewPage<TaskTemplate>
      config={tasksTemplatesPageConfig}
      data={taskTemplatesData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["name", "description", "category"]}
      onAction={handleAction}
    />
  );
}
