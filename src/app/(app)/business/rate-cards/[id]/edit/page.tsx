"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";

interface RateCardItem {
  id: string;
  role: string;
  hourly_rate: number;
  daily_rate: number;
  overtime_multiplier: number;
}

interface RateCardFormData {
  id: string;
  name: string;
  description: string;
  effective_date: Date | null;
  expiry_date: Date | null;
  status: string;
  client_type: string;
  currency: string;
  notes: string;
  items: RateCardItem[];
}

const defaultFormData: RateCardFormData = {
  id: "",
  name: "",
  description: "",
  effective_date: null,
  expiry_date: null,
  status: "draft",
  client_type: "standard",
  currency: "USD",
  notes: "",
  items: [{ id: "1", role: "", hourly_rate: 0, daily_rate: 0, overtime_multiplier: 1.5 }],
};

export default function RateCardEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const rateCardId = params.id as string;

  const [formData, setFormData] = React.useState<RateCardFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchRateCard() {
      try {
        const response = await fetch(`/api/v1/rate-cards/${rateCardId}`);
        if (!response.ok) throw new Error("Failed to fetch rate card");
        const result = await response.json();
        const rateCard = result.data;
        setFormData({
          id: rateCard.id,
          name: rateCard.name || "",
          description: rateCard.description || "",
          effective_date: rateCard.effective_date ? new Date(rateCard.effective_date) : null,
          expiry_date: rateCard.expiry_date ? new Date(rateCard.expiry_date) : null,
          status: rateCard.status || "draft",
          client_type: rateCard.client_type || "standard",
          currency: rateCard.currency || "USD",
          notes: rateCard.notes || "",
          items: rateCard.items?.length > 0 ? rateCard.items : [{ id: "1", role: "", hourly_rate: 0, daily_rate: 0, overtime_multiplier: 1.5 }],
        });
      } catch {
        toast({ title: "Error", description: "Failed to load rate card data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchRateCard();
  }, [rateCardId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof RateCardFormData>(field: K, value: RateCardFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const updateItem = (itemId: string, field: keyof RateCardItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
    setIsDirty(true);
  };

  const addItem = () => {
    const newItem: RateCardItem = {
      id: `new-${Date.now()}`,
      role: "",
      hourly_rate: 0,
      daily_rate: 0,
      overtime_multiplier: 1.5,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setIsDirty(true);
  };

  const removeItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/rate-cards/${rateCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          effective_date: formData.effective_date?.toISOString(),
          expiry_date: formData.expiry_date?.toISOString(),
          status: formData.status,
          client_type: formData.client_type,
          currency: formData.currency,
          notes: formData.notes,
          items: formData.items,
        }),
      });
      if (!response.ok) throw new Error("Failed to update rate card");
      toast({ title: "Rate card updated", description: "Changes saved successfully." });
      router.push(`/rate-cards/${rateCardId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Rate Cards", href: "/rate-cards" },
    { label: formData.name || "Rate Card", href: `/rate-cards/${rateCardId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
          </FormField>
          <FormField label="Description">
            <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={2} />
          </FormField>
          <FormRow>
            <FormField label="Client Type">
              <Select value={formData.client_type} onValueChange={(v) => updateField("client_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Effective Date">
              <DatePicker date={formData.effective_date ?? undefined} onDateChange={(date) => date && updateField("effective_date", date)} />
            </FormField>
            <FormField label="Expiry Date">
              <DatePicker date={formData.expiry_date ?? undefined} onDateChange={(date) => date && updateField("expiry_date", date)} />
            </FormField>
          </FormRow>
        </div>
      ),
    },
    {
      id: "rates",
      title: "Role Rates",
      description: "Define hourly and daily rates for each role",
      content: (
        <div className="space-y-4">
          {formData.items.map((item: RateCardItem, index: number) => (
            <Card key={item.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <FormField label={index === 0 ? "Role" : ""}>
                      <Input
                        value={item.role}
                        onChange={(e) => updateItem(item.id, "role", e.target.value)}
                        placeholder="Role name"
                      />
                    </FormField>
                    <FormField label={index === 0 ? "Hourly Rate" : ""}>
                      <Input
                        type="number"
                        value={item.hourly_rate}
                        onChange={(e) => updateItem(item.id, "hourly_rate", Number(e.target.value))}
                        placeholder="0"
                      />
                    </FormField>
                    <FormField label={index === 0 ? "Daily Rate" : ""}>
                      <Input
                        type="number"
                        value={item.daily_rate}
                        onChange={(e) => updateItem(item.id, "daily_rate", Number(e.target.value))}
                        placeholder="0"
                      />
                    </FormField>
                    <FormField label={index === 0 ? "OT Multiplier" : ""}>
                      <Input
                        type="number"
                        step="0.1"
                        value={item.overtime_multiplier}
                        onChange={(e) => updateItem(item.id, "overtime_multiplier", Number(e.target.value))}
                        placeholder="1.5"
                      />
                    </FormField>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive mt-6"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      ),
    },
    {
      id: "notes",
      title: "Notes & Terms",
      content: (
        <FormField label="Notes">
          <Textarea
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={4}
            placeholder="Add any notes or terms..."
          />
        </FormField>
      ),
    },
  ];

  return (
    <EntityFormPage
      title={`Edit Rate Card`}
      breadcrumbs={breadcrumbs}
      backHref={`/rate-cards/${rateCardId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
