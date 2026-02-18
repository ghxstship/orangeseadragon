"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/auth/use-supabase";
import { useProjects } from "@/hooks/data/core/use-projects";
import { useTasks } from "@/hooks/data/core/use-tasks";
import { FolderKanban, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProjectWithProgress {
  id: string;
  name: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export function ProjectProgressWidget() {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: projects, isLoading: projectsLoading } = useProjects(organizationId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(organizationId);

  const isLoading = projectsLoading || tasksLoading;

  const projectsWithProgress = React.useMemo<ProjectWithProgress[]>(() => {
    if (!projects || !tasks) return [];

    return projects
      .filter((p) => p.status === "active")
      .slice(0, 5)
      .map((project) => {
        const projectTasks = tasks.filter((t) => t.project_id === project.id);
        const completedTasks = projectTasks.filter((t) => t.status === "done").length;
        const totalTasks = projectTasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          id: project.id,
          name: project.name,
          status: (project.status ?? "unknown") as string,
          totalTasks,
          completedTasks,
          progress,
        };
      });
  }, [projects, tasks]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projectsWithProgress.length === 0) {
    return (
      <Card className="spatial-card bg-card/50 backdrop-blur-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-50">
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active projects</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="spatial-card bg-card/50 backdrop-blur-xl border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-50">
            Project Progress
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {projectsWithProgress.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectsWithProgress.map((project) => (
          <Link
            key={project.id}
            href={`/core/projects/${project.id}`}
            className="block group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {project.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {project.completedTasks}/{project.totalTasks}
                  </span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={project.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium w-8 text-right">
                  {project.progress}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
