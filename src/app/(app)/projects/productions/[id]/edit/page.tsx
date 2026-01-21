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

interface ProjectFormData {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: Date | null;
  end_date: Date | null;
  budget: number;
  client: string;
  manager_id: string;
}

const defaultFormData: ProjectFormData = {
  id: "",
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  start_date: null,
  end_date: null,
  budget: 0,
  client: "",
  manager_id: "",
};

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [formData, setFormData] = React.useState<ProjectFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`);
        if (!response.ok) throw new Error("Failed to fetch project");
        const result = await response.json();
        const project = result.data;
        setFormData({
          id: project.id,
          name: project.name || "",
          description: project.description || "",
          status: project.status || "planning",
          priority: project.priority || "medium",
          start_date: project.start_date ? new Date(project.start_date) : null,
          end_date: project.end_date ? new Date(project.end_date) : null,
          budget: project.budget || 0,
          client: project.client?.name || project.client || "",
          manager_id: project.manager_id || "",
        });
      } catch {
        toast({ title: "Error", description: "Failed to load project data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          start_date: formData.start_date?.toISOString(),
          end_date: formData.end_date?.toISOString(),
          budget: formData.budget,
          client: formData.client,
          manager_id: formData.manager_id,
        }),
      });
      if (!response.ok) throw new Error("Failed to update project");
      toast({ title: "Project updated", description: "Your changes have been saved successfully." });
      router.push(`/projects/${projectId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Projects", href: "/projects" },
    { label: formData.name || "Project", href: `/projects/${projectId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Update the project name and description",
      content: (
        <div className="space-y-4">
          <FormField label="Project Name" required>
            <Input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter project name"
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter project description"
              rows={4}
            />
          </FormField>
          <FormRow>
            <FormField label="Status" required>
              <Select
                value={formData.status}
                onValueChange={(value) => updateField("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Priority" required>
              <Select
                value={formData.priority}
                onValueChange={(value) => updateField("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
        </div>
      ),
    },
    {
      id: "timeline",
      title: "Timeline & Budget",
      description: "Set project dates and budget",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Start Date" required>
              <DatePicker
                date={formData.start_date ?? undefined}
                onDateChange={(date) => date && updateField("start_date", date)}
              />
            </FormField>
            <FormField label="End Date" required>
              <DatePicker
                date={formData.end_date ?? undefined}
                onDateChange={(date) => date && updateField("end_date", date)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Budget" description="Total project budget in USD">
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => updateField("budget", Number(e.target.value))}
                placeholder="Enter budget"
              />
            </FormField>
            <FormField label="Client">
              <Input
                value={formData.client}
                onChange={(e) => updateField("client", e.target.value)}
                placeholder="Enter client name"
              />
            </FormField>
          </FormRow>
        </div>
      ),
    },
  ];

  const sidebarContent = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Project Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Project Manager">
          <Select
            value={formData.manager_id}
            onValueChange={(value) => updateField("manager_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
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
      title={`Edit ${formData.name || "Project"}`}
      description="Update project details and settings"
      breadcrumbs={breadcrumbs}
      backHref={`/projects/${projectId}`}
      sections={sections}
      sidebarContent={sidebarContent}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
