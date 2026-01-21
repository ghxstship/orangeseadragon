"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { FileText, Calendar, Building2, Download, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Invoice {
  id: string;
  invoice_number?: string;
  status: string;
  client?: { id: string; name: string };
  event?: { id: string; name: string };
  issue_date?: string;
  due_date?: string;
  paid_date?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  line_items?: Array<{ id: string; description: string; quantity: number; rate: number; amount: number }>;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/v1/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch invoice");
        }
        const result = await response.json();
        setInvoice(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Invoice not found"}</p>
      </div>
    );
  }

  const status = statusConfig[invoice.status] || statusConfig.draft;
  const lineItems = invoice.line_items || [];
  const subtotal = invoice.subtotal || 0;
  const tax = invoice.tax || 0;
  const total = invoice.total || 0;
  const displayId = invoice.invoice_number || invoice.id;

  const breadcrumbs = [
    { label: "Invoices", href: "/invoices" },
    { label: invoice.id },
  ];

  const tabs = [
    {
      id: "details",
      label: "Details",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 text-sm">
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Rate</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length > 0 ? lineItems.map((item: { id: string; description: string; quantity: number; rate: number; amount: number }) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">${item.rate.toLocaleString()}</td>
                        <td className="p-3 text-right font-medium">${item.amount.toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-muted-foreground">No line items</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr className="border-t">
                      <td colSpan={3} className="p-3 text-right">Subtotal</td>
                      <td className="p-3 text-right font-medium">${subtotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-3 text-right">Tax</td>
                      <td className="p-3 text-right font-medium">${tax.toLocaleString()}</td>
                    </tr>
                    <tr className="border-t font-bold">
                      <td colSpan={3} className="p-3 text-right">Total</td>
                      <td className="p-3 text-right">${total.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">${total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{invoice.client?.name || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{invoice.event?.name || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Issue Date</p>
              <p className="text-sm">{invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-sm">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
          {invoice.paid_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Paid Date</p>
                <p className="text-sm text-green-600">{new Date(invoice.paid_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={displayId}
      subtitle={`${invoice.client?.name || "Unknown Client"} • ${invoice.event?.name || "Unknown Event"}`}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/invoices"
      editHref={`/invoices/${invoiceId}/edit`}
      onDelete={() => console.log("Delete invoice")}
      tabs={tabs}
      defaultTab="details"
      sidebarContent={sidebarContent}
      actions={[
        { id: "download", label: "Download PDF", onClick: () => console.log("Download") },
        { id: "send", label: "Send to Client", onClick: () => console.log("Send") },
        { id: "duplicate", label: "Duplicate", onClick: () => console.log("Duplicate") },
      ]}
    />
  );
}
