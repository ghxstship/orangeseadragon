"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow, TagInput } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function NewContactPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    type: "client",
    status: "active",
    address: "",
    notes: "",
    tags: [] as string[],
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
      toast({ title: "Contact created", description: "New contact has been added." });
      router.push("/contacts");
    } catch {
      toast({ title: "Error", description: "Failed to create contact.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Contacts", href: "/contacts" },
    { label: "New Contact" },
  ];

  const sections = [
    {
      id: "personal",
      title: "Personal Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="First Name" required>
              <Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="First name" autoFocus />
            </FormField>
            <FormField label="Last Name" required>
              <Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Last name" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Email" required>
              <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="email@example.com" />
            </FormField>
            <FormField label="Phone">
              <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </FormField>
          </FormRow>
        </div>
      ),
    },
    {
      id: "company",
      title: "Company Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Company">
              <Input value={formData.company} onChange={(e) => updateField("company", e.target.value)} placeholder="Company name" />
            </FormField>
            <FormField label="Job Title">
              <Input value={formData.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} placeholder="Job title" />
            </FormField>
          </FormRow>
          <FormField label="Address">
            <Input value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Full address" />
          </FormField>
        </div>
      ),
    },
    {
      id: "classification",
      title: "Classification",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Type">
              <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="crew">Crew</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormField label="Tags">
            <TagInput value={formData.tags} onChange={(tags) => updateField("tags", tags)} placeholder="Add tags..." />
          </FormField>
          <FormField label="Notes">
            <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} placeholder="Additional notes..." />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title="New Contact"
      breadcrumbs={breadcrumbs}
      backHref="/contacts"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
