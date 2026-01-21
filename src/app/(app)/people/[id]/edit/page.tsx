"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PersonFormData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  location: string;
  bio: string;
}

const defaultFormData: PersonFormData = {
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "",
  department: "operations",
  status: "active",
  location: "",
  bio: "",
};

export default function PersonEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const personId = params.id as string;

  const [formData, setFormData] = React.useState<PersonFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchPerson() {
      try {
        const response = await fetch(`/api/v1/people/${personId}`);
        if (!response.ok) throw new Error("Failed to fetch person");
        const result = await response.json();
        const person = result.data;
        setFormData({
          id: person.id,
          first_name: person.first_name || "",
          last_name: person.last_name || "",
          email: person.email || "",
          phone: person.phone || "",
          role: person.role || "",
          department: person.department || "operations",
          status: person.status || "active",
          location: person.location || "",
          bio: person.bio || "",
        });
      } catch {
        toast({ title: "Error", description: "Failed to load person data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchPerson();
  }, [personId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof PersonFormData>(field: K, value: PersonFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/people/${personId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          status: formData.status,
          location: formData.location,
          bio: formData.bio,
        }),
      });
      if (!response.ok) throw new Error("Failed to update person");
      toast({ title: "Person updated", description: "Changes saved successfully." });
      router.push(`/people/${personId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullName = `${formData.first_name} ${formData.last_name}`.trim() || "Person";
  const breadcrumbs = [
    { label: "People", href: "/people" },
    { label: fullName, href: `/people/${personId}` },
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
          <FormField label="Location">
            <Input value={formData.location} onChange={(e) => updateField("location", e.target.value)} />
          </FormField>
          <FormField label="Bio">
            <Textarea value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} rows={3} />
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
              <Input value={formData.role} onChange={(e) => updateField("role", e.target.value)} />
            </FormField>
            <FormField label="Department">
              <Select value={formData.department} onValueChange={(v) => updateField("department", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
          <FormField label="Status">
            <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title={`Edit ${fullName}`}
      breadcrumbs={breadcrumbs}
      backHref={`/people/${personId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
