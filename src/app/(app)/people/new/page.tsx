"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function NewPersonPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    status: "active",
    location: "",
    bio: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({ title: "Error", description: "First name, last name, and email are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Person added", description: "New team member has been added." });
      router.push("/people");
    } catch {
      toast({ title: "Error", description: "Failed to add person.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "People", href: "/people" },
    { label: "Add Person" },
  ];

  const sections = [
    {
      id: "personal",
      title: "Personal Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="First Name" required>
              <Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} autoFocus />
            </FormField>
            <FormField label="Last Name" required>
              <Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Email" required>
              <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
            </FormField>
            <FormField label="Phone">
              <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </FormField>
          </FormRow>
          <FormField label="Location">
            <Input value={formData.location} onChange={(e) => updateField("location", e.target.value)} placeholder="City, State" />
          </FormField>
          <FormField label="Bio">
            <Textarea value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} rows={3} placeholder="Brief description..." />
          </FormField>
        </div>
      ),
    },
    {
      id: "work",
      title: "Work Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Role">
              <Input value={formData.role} onChange={(e) => updateField("role", e.target.value)} placeholder="Job title" />
            </FormField>
            <FormField label="Department">
              <Select value={formData.department} onValueChange={(v) => updateField("department", v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title="Add Person"
      breadcrumbs={breadcrumbs}
      backHref="/people"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
