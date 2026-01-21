"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow, TagInput } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function NewVendorPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: "",
    category: "",
    status: "pending",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    taxId: "",
    paymentTerms: "net30",
    notes: "",
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "Error", description: "Company name is required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Vendor created", description: "New vendor has been added." });
      router.push("/vendors");
    } catch {
      toast({ title: "Error", description: "Failed to create vendor.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Vendors", href: "/vendors" },
    { label: "New Vendor" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <FormField label="Company Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Company name" autoFocus />
          </FormField>
          <FormRow>
            <FormField label="Category" required>
              <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
        </div>
      ),
    },
    {
      id: "contact",
      title: "Contact Information",
      content: (
        <div className="space-y-4">
          <FormField label="Contact Name">
            <Input value={formData.contactName} onChange={(e) => updateField("contactName", e.target.value)} placeholder="Primary contact" />
          </FormField>
          <FormRow>
            <FormField label="Email">
              <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="email@company.com" />
            </FormField>
            <FormField label="Phone">
              <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </FormField>
          </FormRow>
          <FormField label="Address">
            <Input value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Full address" />
          </FormField>
          <FormField label="Website">
            <Input value={formData.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://" />
          </FormField>
        </div>
      ),
    },
    {
      id: "financial",
      title: "Financial & Terms",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Tax ID">
              <Input value={formData.taxId} onChange={(e) => updateField("taxId", e.target.value)} placeholder="XX-XXXXXXX" />
            </FormField>
            <FormField label="Payment Terms">
              <Select value={formData.paymentTerms} onValueChange={(v) => updateField("paymentTerms", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="net15">Net 15</SelectItem>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net45">Net 45</SelectItem>
                  <SelectItem value="net60">Net 60</SelectItem>
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
      title="New Vendor"
      breadcrumbs={breadcrumbs}
      backHref="/vendors"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
