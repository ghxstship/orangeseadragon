"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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
  hourlyRate: number;
  dailyRate: number;
  overtimeMultiplier: number;
}

export default function NewRateCardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    effectiveDate: new Date(),
    expiryDate: undefined as Date | undefined,
    status: "draft",
    clientType: "standard",
    currency: "USD",
    notes: "",
    items: [
      { id: "1", role: "", hourlyRate: 0, dailyRate: 0, overtimeMultiplier: 1.5 },
    ] as RateCardItem[],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (itemId: string, field: keyof RateCardItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    const newItem: RateCardItem = {
      id: `new-${Date.now()}`,
      role: "",
      hourlyRate: 0,
      dailyRate: 0,
      overtimeMultiplier: 1.5,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (itemId: string) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "Error", description: "Rate card name is required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Rate card created", description: "Your new rate card has been created." });
      router.push("/rate-cards");
    } catch {
      toast({ title: "Error", description: "Failed to create rate card.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Rate Cards", href: "/rate-cards" },
    { label: "New Rate Card" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Rate card name" autoFocus />
          </FormField>
          <FormField label="Description">
            <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={2} placeholder="Brief description..." />
          </FormField>
          <FormRow>
            <FormField label="Client Type">
              <Select value={formData.clientType} onValueChange={(v) => updateField("clientType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Currency">
              <Select value={formData.currency} onValueChange={(v) => updateField("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Effective Date">
              <DatePicker date={formData.effectiveDate} onDateChange={(date) => date && updateField("effectiveDate", date)} />
            </FormField>
            <FormField label="Expiry Date">
              <DatePicker date={formData.expiryDate} onDateChange={(date) => updateField("expiryDate", date)} />
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
          {formData.items.map((item, index) => (
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
                        value={item.hourlyRate || ""}
                        onChange={(e) => updateItem(item.id, "hourlyRate", Number(e.target.value))}
                        placeholder="0"
                      />
                    </FormField>
                    <FormField label={index === 0 ? "Daily Rate" : ""}>
                      <Input
                        type="number"
                        value={item.dailyRate || ""}
                        onChange={(e) => updateItem(item.id, "dailyRate", Number(e.target.value))}
                        placeholder="0"
                      />
                    </FormField>
                    <FormField label={index === 0 ? "OT Multiplier" : ""}>
                      <Input
                        type="number"
                        step="0.1"
                        value={item.overtimeMultiplier}
                        onChange={(e) => updateItem(item.id, "overtimeMultiplier", Number(e.target.value))}
                        placeholder="1.5"
                      />
                    </FormField>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive mt-6"
                    onClick={() => removeItem(item.id)}
                    disabled={formData.items.length === 1}
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
      title="New Rate Card"
      breadcrumbs={breadcrumbs}
      backHref="/rate-cards"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
