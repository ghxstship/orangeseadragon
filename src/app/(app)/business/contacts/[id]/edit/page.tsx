"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow, TagInput } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ContactFormData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  type: string;
  status: string;
  address: string;
  notes: string;
  tags: string[];
}

const defaultFormData: ContactFormData = {
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company: "",
  job_title: "",
  type: "client",
  status: "active",
  address: "",
  notes: "",
  tags: [],
};

export default function ContactEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const contactId = params.id as string;

  const [formData, setFormData] = React.useState<ContactFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchContact() {
      try {
        const response = await fetch(`/api/v1/contacts/${contactId}`);
        if (!response.ok) throw new Error("Failed to fetch contact");
        const result = await response.json();
        const contact = result.data;
        setFormData({
          id: contact.id,
          first_name: contact.first_name || "",
          last_name: contact.last_name || "",
          email: contact.email || "",
          phone: contact.phone || "",
          company: contact.company?.name || contact.company || "",
          job_title: contact.job_title || "",
          type: contact.type || "client",
          status: contact.status || "active",
          address: contact.address || "",
          notes: contact.notes || "",
          tags: contact.tags || [],
        });
      } catch {
        toast({ title: "Error", description: "Failed to load contact data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, [contactId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          job_title: formData.job_title,
          type: formData.type,
          status: formData.status,
          address: formData.address,
          notes: formData.notes,
          tags: formData.tags,
        }),
      });
      if (!response.ok) throw new Error("Failed to update contact");
      toast({ title: "Contact updated", description: "Changes saved successfully." });
      router.push(`/contacts/${contactId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullName = `${formData.first_name} ${formData.last_name}`.trim() || "Contact";
  const breadcrumbs = [
    { label: "Contacts", href: "/contacts" },
    { label: fullName, href: `/contacts/${contactId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "personal",
      title: "Personal Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="First Name" required>
              <Input value={formData.first_name} onChange={(e) => updateField("first_name", e.target.value)} />
            </FormField>
            <FormField label="Last Name" required>
              <Input value={formData.last_name} onChange={(e) => updateField("last_name", e.target.value)} />
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
              <Input value={formData.company} onChange={(e) => updateField("company", e.target.value)} />
            </FormField>
            <FormField label="Job Title">
              <Input value={formData.job_title} onChange={(e) => updateField("job_title", e.target.value)} />
            </FormField>
          </FormRow>
          <FormField label="Address">
            <Input value={formData.address} onChange={(e) => updateField("address", e.target.value)} />
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
            <TagInput value={formData.tags} onChange={(tags) => updateField("tags", tags)} />
          </FormField>
          <FormField label="Notes">
            <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title={`Edit Contact`}
      breadcrumbs={breadcrumbs}
      backHref={`/contacts/${contactId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
