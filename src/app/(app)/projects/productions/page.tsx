"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { projectsPageConfig } from "@/config/pages/projects";
import { PROJECT_STATUS, type ProjectStatus, type PriorityLevel } from "@/lib/enums";

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  team_size: number;
  tasks_completed: number;
  tasks_total: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/v1/projects");
        if (response.ok) {
          const result = await response.json();
          setProjects(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const stats = React.useMemo(() => {
    const active = projects.filter((p) => p.status === PROJECT_STATUS.ACTIVE).length;
    const planning = projects.filter((p) => p.status === PROJECT_STATUS.PLANNING).length;
    const completed = projects.filter((p) => p.status === PROJECT_STATUS.COMPLETED).length;

    return [
      { id: "total", label: "Total Projects", value: projects.length },
      { id: "active", label: "Active", value: active },
      { id: "planning", label: "Planning", value: planning },
      { id: "completed", label: "Completed", value: completed },
    ];
  }, [projects]);

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
    <DataViewPage<Project>
      config={projectsPageConfig}
      data={projects}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
