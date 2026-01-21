"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  budget_amount?: number;
  organization?: { id: string; name: string };
  members?: Array<{ id: string; role: string; user: { id: string; full_name: string; email: string; avatar_url?: string } }>;
  metadata?: Record<string, unknown>;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  planning: { label: "Planning", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  in_progress: { label: "In Progress", variant: "default" },
  on_hold: { label: "On Hold", variant: "outline" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }
        const result = await response.json();
        setProject(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Project not found"}</p>
      </div>
    );
  }

  const status = statusConfig[project.status] || statusConfig.draft;
  const budget = project.budget_amount || 0;
  const spent = (project.metadata?.spent as number) || 0;
  const progress = (project.metadata?.progress as number) || 0;
  const tasksTotal = (project.metadata?.tasks_total as number) || 0;
  const tasksCompleted = (project.metadata?.tasks_completed as number) || 0;
  const tasksInProgress = (project.metadata?.tasks_in_progress as number) || 0;
  const tasksPending = tasksTotal - tasksCompleted - tasksInProgress;
  const team = project.members || [];
  const recentActivity = (project.metadata?.recent_activity as Array<{ id: string; action: string; user: string; time: string }>) || [];

  const breadcrumbs = [
    { label: "Projects", href: "/projects" },
    { label: project.name },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{project.description || "No description available"}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "TBD"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : "TBD"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">${budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="font-medium">${spent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{tasksInProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{tasksPending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "tasks",
      label: "Tasks",
      badge: tasksTotal,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Project Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Task list would be displayed here using DataTable component.</p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "files",
      label: "Files",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Project Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">File browser would be displayed here.</p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity: { id: string; action: string; user: string; time: string }) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action.toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{project.organization?.name || "N/A"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {team.length > 0 ? team.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {member.user?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.user?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-sm">No team members assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Priority</span>
            <Badge variant="outline" className="capitalize">{project.priority || "medium"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Budget</span>
            <span className="text-sm font-medium">${budget.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={project.name}
      subtitle={project.organization?.name || ""}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/projects"
      editHref={`/projects/${projectId}/edit`}
      onDelete={() => console.log("Delete project")}
      onShare={() => console.log("Share project")}
      tabs={tabs}
      defaultTab="overview"
      sidebarContent={sidebarContent}
      actions={[
        { id: "duplicate", label: "Duplicate", onClick: () => console.log("Duplicate") },
        { id: "archive", label: "Archive", onClick: () => console.log("Archive") },
      ]}
    />
  );
}
