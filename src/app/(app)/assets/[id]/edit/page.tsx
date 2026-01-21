"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AssetFormData {
  id: string;
  name: string;
  asset_tag: string;
  category: string;
  status: string;
  condition: string;
  location: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  purchase_date: Date | null;
  purchase_price: number;
  current_value: number;
  warranty_expires: Date | null;
  notes: string;
}

const defaultFormData: AssetFormData = {
  id: "",
  name: "",
  asset_tag: "",
  category: "video",
  status: "available",
  condition: "good",
  location: "",
  serial_number: "",
  manufacturer: "",
  model: "",
  purchase_date: null,
  purchase_price: 0,
  current_value: 0,
  warranty_expires: null,
  notes: "",
};

export default function AssetEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const assetId = params.id as string;

  const [formData, setFormData] = React.useState<AssetFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchAsset() {
      try {
        const response = await fetch(`/api/v1/assets/${assetId}`);
        if (!response.ok) throw new Error("Failed to fetch asset");
        const result = await response.json();
        const asset = result.data;
        setFormData({
          id: asset.id,
          name: asset.name || "",
          asset_tag: asset.asset_tag || "",
          category: asset.category || "video",
          status: asset.status || "available",
          condition: asset.condition || "good",
          location: asset.location || "",
          serial_number: asset.serial_number || "",
          manufacturer: asset.manufacturer || "",
          model: asset.model || "",
          purchase_date: asset.purchase_date ? new Date(asset.purchase_date) : null,
          purchase_price: asset.purchase_price || 0,
          current_value: asset.current_value || 0,
          warranty_expires: asset.warranty_expires ? new Date(asset.warranty_expires) : null,
          notes: asset.notes || "",
        });
      } catch {
        toast({ title: "Error", description: "Failed to load asset data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [assetId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof AssetFormData>(field: K, value: AssetFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          asset_tag: formData.asset_tag,
          category: formData.category,
          status: formData.status,
          condition: formData.condition,
          location: formData.location,
          serial_number: formData.serial_number,
          manufacturer: formData.manufacturer,
          model: formData.model,
          purchase_date: formData.purchase_date?.toISOString(),
          purchase_price: formData.purchase_price,
          current_value: formData.current_value,
          warranty_expires: formData.warranty_expires?.toISOString(),
          notes: formData.notes,
        }),
      });
      if (!response.ok) throw new Error("Failed to update asset");
      toast({ title: "Asset updated", description: "Changes saved successfully." });
      router.push(`/assets/${assetId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Assets", href: "/assets" },
    { label: formData.name || "Asset", href: `/assets/${assetId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Name" required>
              <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
            </FormField>
            <FormField label="Asset Tag" required>
              <Input value={formData.asset_tag} onChange={(e) => updateField("asset_tag", e.target.value)} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Category">
              <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Input value={formData.location} onChange={(e) => updateField("location", e.target.value)} />
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
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
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
                  <SelectItem value="poor">Poor</SelectItem>
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
            <Input value={formData.serial_number} onChange={(e) => updateField("serial_number", e.target.value)} />
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
              <DatePicker date={formData.purchase_date ?? undefined} onDateChange={(date) => date && updateField("purchase_date", date)} />
            </FormField>
            <FormField label="Warranty Expires">
              <DatePicker date={formData.warranty_expires ?? undefined} onDateChange={(date) => date && updateField("warranty_expires", date)} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Purchase Price">
              <Input type="number" value={formData.purchase_price} onChange={(e) => updateField("purchase_price", Number(e.target.value))} />
            </FormField>
            <FormField label="Current Value">
              <Input type="number" value={formData.current_value} onChange={(e) => updateField("current_value", Number(e.target.value))} />
            </FormField>
          </FormRow>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title={`Edit Asset`}
      breadcrumbs={breadcrumbs}
      backHref={`/assets/${assetId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
