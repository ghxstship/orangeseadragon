"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface TaskFormData {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: Date | null;
  estimated_hours: number;
  project_id: string;
  assignee_id: string;
}

const defaultFormData: TaskFormData = {
  id: "",
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  due_date: null,
  estimated_hours: 0,
  project_id: "",
  assignee_id: "",
};

export default function TaskEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const taskId = params.id as string;

  const [formData, setFormData] = React.useState<TaskFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchTask() {
      try {
        const response = await fetch(`/api/v1/tasks/${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch task");
        const result = await response.json();
        const task = result.data;
        setFormData({
          id: task.id,
          title: task.title || "",
          description: task.description || "",
          status: task.status || "todo",
          priority: task.priority || "medium",
          due_date: task.due_date ? new Date(task.due_date) : null,
          estimated_hours: task.estimated_hours || 0,
          project_id: task.project_id || "",
          assignee_id: task.assignee_id || "",
        });
      } catch {
        toast({ title: "Error", description: "Failed to load task data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date?.toISOString(),
          estimated_hours: formData.estimated_hours,
          project_id: formData.project_id,
          assignee_id: formData.assignee_id,
        }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      toast({ title: "Task updated", description: "Your changes have been saved." });
      router.push(`/tasks/${taskId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Tasks", href: "/tasks" },
    { label: formData.title || "Task", href: `/tasks/${taskId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Task Details",
      content: (
        <div className="space-y-4">
          <FormField label="Title" required>
            <Input
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </FormField>
          <FormRow>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Priority">
              <Select value={formData.priority} onValueChange={(v) => updateField("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Due Date">
              <DatePicker
                date={formData.due_date ?? undefined}
                onDateChange={(date) => date && updateField("due_date", date)}
              />
            </FormField>
            <FormField label="Estimated Hours">
              <Input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => updateField("estimated_hours", Number(e.target.value))}
              />
            </FormField>
          </FormRow>
        </div>
      ),
    },
  ];

  const sidebarContent = (
    <Card>
      <CardHeader><CardTitle className="text-base">Assignment</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Project">
          <Select value={formData.project_id} onValueChange={(v) => updateField("project_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="proj-001">Website Redesign</SelectItem>
              <SelectItem value="proj-002">Mobile App</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Assignee">
          <Select value={formData.assignee_id} onValueChange={(v) => updateField("assignee_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user-001">Sarah Johnson</SelectItem>
              <SelectItem value="user-002">Mike Chen</SelectItem>
              <SelectItem value="user-003">Emily Davis</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </CardContent>
    </Card>
  );

  return (
    <EntityFormPage
      title={`Edit Task`}
      breadcrumbs={breadcrumbs}
      backHref={`/tasks/${taskId}`}
      sections={sections}
      sidebarContent={sidebarContent}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
