"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const defaultProjectId = searchParams.get("project") || "";

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: undefined as Date | undefined,
    estimatedHours: 0,
    projectId: defaultProjectId,
    assigneeId: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({ title: "Error", description: "Title is required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Task created", description: "Your task has been created." });
      router.push("/tasks");
    } catch {
      toast({ title: "Error", description: "Failed to create task.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Tasks", href: "/tasks" },
    { label: "New Task" },
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
              placeholder="Enter task title"
              autoFocus
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter task description"
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
                date={formData.dueDate}
                onDateChange={(date) => updateField("dueDate", date)}
              />
            </FormField>
            <FormField label="Estimated Hours">
              <Input
                type="number"
                value={formData.estimatedHours || ""}
                onChange={(e) => updateField("estimatedHours", Number(e.target.value))}
                placeholder="0"
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
          <Select value={formData.projectId} onValueChange={(v) => updateField("projectId", v)}>
            <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="proj-001">Website Redesign</SelectItem>
              <SelectItem value="proj-002">Mobile App</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Assignee">
          <Select value={formData.assigneeId} onValueChange={(v) => updateField("assigneeId", v)}>
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
      title="New Task"
      breadcrumbs={breadcrumbs}
      backHref="/tasks"
      isNew
      sections={sections}
      sidebarContent={sidebarContent}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
