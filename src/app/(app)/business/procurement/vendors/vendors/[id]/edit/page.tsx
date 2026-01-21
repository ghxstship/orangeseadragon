"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow, TagInput } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface VendorFormData {
  id: string;
  name: string;
  category: string;
  status: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  tax_id: string;
  payment_terms: string;
  notes: string;
  tags: string[];
}

const defaultFormData: VendorFormData = {
  id: "",
  name: "",
  category: "audio",
  status: "pending",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  tax_id: "",
  payment_terms: "net30",
  notes: "",
  tags: [],
};

export default function VendorEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const vendorId = params.id as string;

  const [formData, setFormData] = React.useState<VendorFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchVendor() {
      try {
        const response = await fetch(`/api/v1/vendors/${vendorId}`);
        if (!response.ok) throw new Error("Failed to fetch vendor");
        const result = await response.json();
        const vendor = result.data;
        setFormData({
          id: vendor.id,
          name: vendor.name || "",
          category: vendor.category || "audio",
          status: vendor.status || "pending",
          contact_name: vendor.contact_name || "",
          email: vendor.email || "",
          phone: vendor.phone || "",
          address: vendor.address || "",
          website: vendor.website || "",
          tax_id: vendor.tax_id || "",
          payment_terms: vendor.payment_terms || "net30",
          notes: vendor.notes || "",
          tags: vendor.tags || [],
        });
      } catch {
        toast({ title: "Error", description: "Failed to load vendor data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [vendorId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof VendorFormData>(field: K, value: VendorFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          status: formData.status,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          website: formData.website,
          tax_id: formData.tax_id,
          payment_terms: formData.payment_terms,
          notes: formData.notes,
          tags: formData.tags,
        }),
      });
      if (!response.ok) throw new Error("Failed to update vendor");
      toast({ title: "Vendor updated", description: "Changes saved successfully." });
      router.push(`/vendors/${vendorId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Vendors", href: "/vendors" },
    { label: formData.name || "Vendor", href: `/vendors/${vendorId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <FormField label="Company Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
          </FormField>
          <FormRow>
            <FormField label="Category">
              <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectItem value="suspended">Suspended</SelectItem>
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
            <Input value={formData.contact_name} onChange={(e) => updateField("contact_name", e.target.value)} />
          </FormField>
          <FormRow>
            <FormField label="Email">
              <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
            </FormField>
            <FormField label="Phone">
              <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </FormField>
          </FormRow>
          <FormField label="Address">
            <Input value={formData.address} onChange={(e) => updateField("address", e.target.value)} />
          </FormField>
          <FormField label="Website">
            <Input value={formData.website} onChange={(e) => updateField("website", e.target.value)} />
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
              <Input value={formData.tax_id} onChange={(e) => updateField("tax_id", e.target.value)} />
            </FormField>
            <FormField label="Payment Terms">
              <Select value={formData.payment_terms} onValueChange={(v) => updateField("payment_terms", v)}>
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
      title={`Edit Vendor`}
      breadcrumbs={breadcrumbs}
      backHref={`/vendors/${vendorId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
