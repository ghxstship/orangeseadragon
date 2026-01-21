"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Paperclip, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  due_date?: string;
  estimated_hours?: number;
  project?: { id: string; name: string };
  assignee?: { id: string; full_name: string; avatar_url?: string };
  metadata?: Record<string, unknown>;
  created_at?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  todo: { label: "To Do", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  in_review: { label: "In Review", variant: "outline" },
  done: { label: "Done", variant: "default" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-800" },
  high: { label: "High", className: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800" },
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const [task, setTask] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTask() {
      try {
        const response = await fetch(`/api/v1/tasks/${taskId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task");
        }
        const result = await response.json();
        setTask(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Task not found"}</p>
      </div>
    );
  }

  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority || "medium"] || priorityConfig.medium;
  const estimatedHours = task.estimated_hours || 0;
  const loggedHours = (task.metadata?.logged_hours as number) || 0;
  const subtasks = (task.metadata?.subtasks as Array<{ id: string; title: string; completed: boolean }>) || [];
  const comments = (task.metadata?.comments as Array<{ id: string; user: string; text: string; time: string }>) || [];
  const attachments = (task.metadata?.attachments as Array<{ id: string; name: string; size: string }>) || [];
  const labels = (task.metadata?.labels as string[]) || [];
  const reporter = task.metadata?.reporter as { id: string; name: string; avatar?: string } | undefined;
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const breadcrumbs = [
    { label: "Tasks", href: "/tasks" },
    ...(task.project ? [{ label: task.project.name, href: `/projects/${task.project.id}` }] : []),
    { label: task.title },
  ];

  const tabs = [
    {
      id: "details",
      label: "Details",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{task.description || "No description available"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subtasks ({completedSubtasks}/{subtasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subtasks.length > 0 ? subtasks.map((subtask: { id: string; title: string; completed: boolean }) => (
                  <div key={subtask.id} className="flex items-center gap-3">
                    <Checkbox checked={subtask.completed} />
                    <span className={subtask.completed ? "line-through text-muted-foreground" : ""}>
                      {subtask.title}
                    </span>
                  </div>
                )) : (
                  <p className="text-muted-foreground">No subtasks</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated</p>
                  <p className="text-xl font-semibold">{estimatedHours}h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Logged</p>
                  <p className="text-xl font-semibold">{loggedHours}h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-xl font-semibold">{Math.max(0, estimatedHours - loggedHours)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "comments",
      label: "Comments",
      badge: comments.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.length > 0 ? comments.map((comment: { id: string; user: string; text: string; time: string }) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.user.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground">No comments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "attachments",
      label: "Attachments",
      badge: attachments.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attachments.length > 0 ? attachments.map((file: { id: string; name: string; size: string }) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{file.size}</span>
                </div>
              )) : (
                <p className="text-muted-foreground">No attachments</p>
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
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Priority</span>
            <Badge className={priority.className}>{priority.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Due Date</span>
            <span className="text-sm font-medium">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "Not set"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">People</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Assignee</p>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{task.assignee.full_name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unassigned</span>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Reporter</p>
            {reporter ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reporter.avatar} />
                  <AvatarFallback className="text-xs">
                    {reporter.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{reporter.name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unknown</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Labels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {labels.length > 0 ? labels.map((label: string) => (
              <Badge key={label} variant="outline">{label}</Badge>
            )) : (
              <p className="text-sm text-muted-foreground">No labels</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={task.title}
      subtitle={task.project ? `Project: ${task.project.name}` : ""}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/tasks"
      editHref={`/tasks/${taskId}/edit`}
      onDelete={() => console.log("Delete task")}
      tabs={tabs}
      defaultTab="details"
      sidebarContent={sidebarContent}
      actions={[
        { id: "duplicate", label: "Duplicate", onClick: () => console.log("Duplicate") },
        { id: "move", label: "Move to Project", onClick: () => console.log("Move") },
      ]}
    />
  );
}
