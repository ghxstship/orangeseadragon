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

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceFormData {
  id: string;
  invoice_number: string;
  status: string;
  client_id: string;
  event_id: string;
  issue_date: Date | null;
  due_date: Date | null;
  tax_rate: number;
  notes: string;
  line_items: LineItem[];
}

const defaultFormData: InvoiceFormData = {
  id: "",
  invoice_number: "",
  status: "draft",
  client_id: "",
  event_id: "",
  issue_date: null,
  due_date: null,
  tax_rate: 0,
  notes: "",
  line_items: [{ id: "1", description: "", quantity: 1, rate: 0 }],
};

export default function InvoiceEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const invoiceId = params.id as string;

  const [formData, setFormData] = React.useState<InvoiceFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/v1/invoices/${invoiceId}`);
        if (!response.ok) throw new Error("Failed to fetch invoice");
        const result = await response.json();
        const invoice = result.data;
        setFormData({
          id: invoice.id,
          invoice_number: invoice.invoice_number || "",
          status: invoice.status || "draft",
          client_id: invoice.client_id || "",
          event_id: invoice.event_id || "",
          issue_date: invoice.issue_date ? new Date(invoice.issue_date) : null,
          due_date: invoice.due_date ? new Date(invoice.due_date) : null,
          tax_rate: invoice.tax_rate || 0,
          notes: invoice.notes || "",
          line_items: invoice.line_items?.length > 0 ? invoice.line_items : [{ id: "1", description: "", quantity: 1, rate: 0 }],
        });
      } catch {
        toast({ title: "Error", description: "Failed to load invoice data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof InvoiceFormData>(field: K, value: InvoiceFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const updateLineItem = (itemId: string, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
    setIsDirty(true);
  };

  const addLineItem = () => {
    const newItem: LineItem = { id: `new-${Date.now()}`, description: "", quantity: 1, rate: 0 };
    setFormData((prev) => ({ ...prev, line_items: [...prev.line_items, newItem] }));
    setIsDirty(true);
  };

  const removeLineItem = (itemId: string) => {
    if (formData.line_items.length > 1) {
      setFormData((prev) => ({ ...prev, line_items: prev.line_items.filter((item) => item.id !== itemId) }));
      setIsDirty(true);
    }
  };

  const subtotal = formData.line_items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (formData.tax_rate / 100);
  const total = subtotal + tax;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formData.status,
          client_id: formData.client_id,
          event_id: formData.event_id,
          issue_date: formData.issue_date?.toISOString(),
          due_date: formData.due_date?.toISOString(),
          tax_rate: formData.tax_rate,
          notes: formData.notes,
          line_items: formData.line_items,
        }),
      });
      if (!response.ok) throw new Error("Failed to update invoice");
      toast({ title: "Invoice updated", description: "Changes saved successfully." });
      router.push(`/invoices/${invoiceId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Invoices", href: "/invoices" },
    { label: formData.invoice_number || "Invoice", href: `/invoices/${invoiceId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Invoice Details",
      content: (
        <div className="space-y-4">
          <FormRow>
            <FormField label="Client">
              <Select value={formData.client_id} onValueChange={(v) => updateField("client_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-001">Festival Productions Inc.</SelectItem>
                  <SelectItem value="client-002">Corporate Events Ltd.</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Event">
              <Select value={formData.event_id} onValueChange={(v) => updateField("event_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="evt-001">Summer Music Festival 2024</SelectItem>
                  <SelectItem value="evt-002">Corporate Gala</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Issue Date">
              <DatePicker date={formData.issue_date ?? undefined} onDateChange={(date) => date && updateField("issue_date", date)} />
            </FormField>
            <FormField label="Due Date">
              <DatePicker date={formData.due_date ?? undefined} onDateChange={(date) => date && updateField("due_date", date)} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Tax Rate (%)">
              <Input type="number" value={formData.tax_rate} onChange={(e) => updateField("tax_rate", Number(e.target.value))} />
            </FormField>
          </FormRow>
        </div>
      ),
    },
    {
      id: "items",
      title: "Line Items",
      content: (
        <div className="space-y-4">
          {formData.line_items.map((item: LineItem, index: number) => (
            <Card key={item.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <FormField label={index === 0 ? "Description" : ""}>
                        <Input value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Description" />
                      </FormField>
                    </div>
                    <FormField label={index === 0 ? "Qty" : ""}>
                      <Input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))} />
                    </FormField>
                    <FormField label={index === 0 ? "Rate" : ""}>
                      <Input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, "rate", Number(e.target.value))} />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <span className="text-sm font-medium w-20 text-right">${(item.quantity * item.rate).toLocaleString()}</span>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeLineItem(item.id)} disabled={formData.line_items.length === 1}>
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
            <div className="flex justify-end gap-4"><span className="text-muted-foreground">Tax ({formData.tax_rate}%):</span><span className="font-medium w-24">${tax.toLocaleString()}</span></div>
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
          <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} />
        </FormField>
      ),
    },
  ];

  return (
    <EntityFormPage
      title={`Edit Invoice`}
      breadcrumbs={breadcrumbs}
      backHref={`/invoices/${invoiceId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
