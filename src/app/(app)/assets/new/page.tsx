"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";

export default function NewAssetPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: "",
    assetTag: "",
    category: "",
    status: "available",
    condition: "excellent",
    location: "",
    serialNumber: "",
    manufacturer: "",
    model: "",
    purchaseDate: new Date(),
    purchasePrice: 0,
    warrantyExpires: undefined as Date | undefined,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.assetTag) {
      toast({ title: "Error", description: "Name and Asset Tag are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Asset created", description: "New asset has been added to inventory." });
      router.push("/assets");
    } catch {
      toast({ title: "Error", description: "Failed to create asset.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Assets", href: "/assets" },
    { label: "Add Asset" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Name" required>
              <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Asset name" autoFocus />
            </FormField>
            <FormField label="Asset Tag" required>
              <Input value={formData.assetTag} onChange={(e) => updateField("assetTag", e.target.value)} placeholder="AST-XXX" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Category" required>
              <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="rigging">Rigging</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Location">
              <Input value={formData.location} onChange={(e) => updateField("location", e.target.value)} placeholder="Warehouse, venue, etc." />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Condition">
              <Select value={formData.condition} onValueChange={(v) => updateField("condition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
        </div>
      ),
    },
    {
      id: "specs",
      title: "Specifications",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Manufacturer">
              <Input value={formData.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
            </FormField>
            <FormField label="Model">
              <Input value={formData.model} onChange={(e) => updateField("model", e.target.value)} />
            </FormField>
          </FormRow>
          <FormField label="Serial Number">
            <Input value={formData.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} />
          </FormField>
        </div>
      ),
    },
    {
      id: "financial",
      title: "Financial Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Purchase Date">
              <DatePicker date={formData.purchaseDate} onDateChange={(date) => date && updateField("purchaseDate", date)} />
            </FormField>
            <FormField label="Warranty Expires">
              <DatePicker date={formData.warrantyExpires} onDateChange={(date) => updateField("warrantyExpires", date)} />
            </FormField>
          </FormRow>
          <FormField label="Purchase Price">
            <Input type="number" value={formData.purchasePrice || ""} onChange={(e) => updateField("purchasePrice", Number(e.target.value))} placeholder="0.00" />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title="Add Asset"
      breadcrumbs={breadcrumbs}
      backHref="/assets"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
