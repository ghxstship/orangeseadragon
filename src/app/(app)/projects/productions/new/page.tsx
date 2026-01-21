"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    budget: 0,
    client: "",
    managerId: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
      router.push("/projects");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Projects", href: "/projects" },
    { label: "New Project" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Enter the project name and description",
      content: (
        <div className="space-y-4">
          <FormField label="Project Name" required>
            <Input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter project name"
              autoFocus
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
            <FormField label="Start Date">
              <DatePicker
                date={formData.startDate}
                onDateChange={(date) => date && updateField("startDate", date)}
              />
            </FormField>
            <FormField label="End Date">
              <DatePicker
                date={formData.endDate}
                onDateChange={(date) => updateField("endDate", date)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Budget" description="Total project budget in USD">
              <Input
                type="number"
                value={formData.budget || ""}
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
            value={formData.managerId}
            onValueChange={(value) => updateField("managerId", value)}
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
      title="New Project"
      description="Create a new project"
      breadcrumbs={breadcrumbs}
      backHref="/projects"
      isNew
      sections={sections}
      sidebarContent={sidebarContent}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
