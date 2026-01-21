"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow, FileUpload } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/common";
import { useToast } from "@/components/ui/use-toast";

export default function NewDocumentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    folder: "",
    status: "draft",
    tags: [] as string[],
    files: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "Error", description: "Document name is required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Document created", description: "Your document has been uploaded." });
      router.push("/documents");
    } catch {
      toast({ title: "Error", description: "Failed to create document.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Documents", href: "/documents" },
    { label: "Upload Document" },
  ];

  const sections = [
    {
      id: "upload",
      title: "Upload File",
      description: "Select a file to upload",
      content: (
        <FileUpload
          onFilesChange={(files: File[]) => {
            updateField("files", files);
            if (files.length > 0 && !formData.name) {
              updateField("name", files[0].name.replace(/\.[^/.]+$/, ""));
            }
          }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          maxFiles={1}
          maxSize={50 * 1024 * 1024}
        />
      ),
    },
    {
      id: "details",
      title: "Document Details",
      content: (
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Document name" autoFocus />
          </FormField>
          <FormField label="Description">
            <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={3} placeholder="Brief description..." />
          </FormField>
          <FormRow>
            <FormField label="Folder">
              <Select value={formData.folder} onValueChange={(v) => updateField("folder", v)}>
                <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormField label="Tags">
            <TagInput value={formData.tags} onChange={(tags) => updateField("tags", tags)} placeholder="Add tags..." />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title="Upload Document"
      breadcrumbs={breadcrumbs}
      backHref="/documents"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
