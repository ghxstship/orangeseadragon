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

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    clientId: "",
    eventId: "",
    issueDate: new Date(),
    dueDate: undefined as Date | undefined,
    taxRate: 8,
    notes: "",
    lineItems: [{ id: "1", description: "", quantity: 1, rate: 0 }] as LineItem[],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (itemId: string, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = { id: `new-${Date.now()}`, description: "", quantity: 1, rate: 0 };
    setFormData((prev) => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
  };

  const removeLineItem = (itemId: string) => {
    if (formData.lineItems.length > 1) {
      setFormData((prev) => ({ ...prev, lineItems: prev.lineItems.filter((item) => item.id !== itemId) }));
    }
  };

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (formData.taxRate / 100);
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!formData.clientId) {
      toast({ title: "Error", description: "Please select a client.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Invoice created", description: "New invoice has been created." });
      router.push("/invoices");
    } catch {
      toast({ title: "Error", description: "Failed to create invoice.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Invoices", href: "/invoices" },
    { label: "New Invoice" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Invoice Details",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Client" required>
              <Select value={formData.clientId} onValueChange={(v) => updateField("clientId", v)}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-001">Festival Productions Inc.</SelectItem>
                  <SelectItem value="client-002">Corporate Events Ltd.</SelectItem>
                  <SelectItem value="client-003">Private Client</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Event">
              <Select value={formData.eventId} onValueChange={(v) => updateField("eventId", v)}>
                <SelectTrigger><SelectValue placeholder="Select event (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="evt-001">Summer Music Festival 2024</SelectItem>
                  <SelectItem value="evt-002">Corporate Gala</SelectItem>
                  <SelectItem value="evt-003">Product Launch</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Issue Date">
              <DatePicker date={formData.issueDate} onDateChange={(date) => date && updateField("issueDate", date)} />
            </FormField>
            <FormField label="Due Date">
              <DatePicker date={formData.dueDate} onDateChange={(date) => updateField("dueDate", date)} />
            </FormField>
          </FormRow>
          <FormField label="Tax Rate (%)">
            <Input type="number" value={formData.taxRate} onChange={(e) => updateField("taxRate", Number(e.target.value))} className="w-32" />
          </FormField>
        </div>
      ),
    },
    {
      id: "items",
      title: "Line Items",
      content: (
        <div className="space-y-4">
          {formData.lineItems.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <FormField label={index === 0 ? "Description" : ""}>
                        <Input value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Item description" />
                      </FormField>
                    </div>
                    <FormField label={index === 0 ? "Qty" : ""}>
                      <Input type="number" value={item.quantity || ""} onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))} placeholder="1" />
                    </FormField>
                    <FormField label={index === 0 ? "Rate" : ""}>
                      <Input type="number" value={item.rate || ""} onChange={(e) => updateLineItem(item.id, "rate", Number(e.target.value))} placeholder="0" />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <span className="text-sm font-medium w-20 text-right">${(item.quantity * item.rate).toLocaleString()}</span>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeLineItem(item.id)} disabled={formData.lineItems.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addLineItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>
          <div className="border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-4"><span className="text-muted-foreground">Subtotal:</span><span className="font-medium w-24">${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-end gap-4"><span className="text-muted-foreground">Tax ({formData.taxRate}%):</span><span className="font-medium w-24">${tax.toLocaleString()}</span></div>
            <div className="flex justify-end gap-4 text-lg"><span className="font-bold">Total:</span><span className="font-bold w-24">${total.toLocaleString()}</span></div>
          </div>
        </div>
      ),
    },
    {
      id: "notes",
      title: "Notes",
      content: (
        <FormField label="Notes">
          <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} placeholder="Additional notes for the invoice..." />
        </FormField>
      ),
    },
  ];

  return (
    <EntityFormPage
      title="New Invoice"
      breadcrumbs={breadcrumbs}
      backHref="/invoices"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
