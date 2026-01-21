"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { invoicesPageConfig } from "@/config/pages/invoices";
import { INVOICE_STATUS, type InvoiceStatus } from "@/lib/enums";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/config";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_company: string;
  event_name?: string;
  amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  items: number;
}

function formatAmount(amount: number): string {
  return formatCurrency(amount, DEFAULT_CURRENCY);
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch("/api/v1/invoices");
        if (response.ok) {
          const result = await response.json();
          setInvoices(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const stats = React.useMemo(() => {
    const totalAmount = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
    const paidAmount = invoices.filter((i) => i.status === INVOICE_STATUS.PAID).reduce((acc, i) => acc + (i.amount || 0), 0);
    const pendingAmount = invoices.filter((i) => i.status === INVOICE_STATUS.SENT).reduce((acc, i) => acc + (i.amount || 0), 0);
    const overdueAmount = invoices.filter((i) => i.status === INVOICE_STATUS.OVERDUE).reduce((acc, i) => acc + (i.amount || 0), 0);

    return [
      { id: "total", label: "Total Invoiced", value: formatAmount(totalAmount) },
      { id: "paid", label: "Paid", value: formatAmount(paidAmount) },
      { id: "pending", label: "Pending", value: formatAmount(pendingAmount) },
      { id: "overdue", label: "Overdue", value: formatAmount(overdueAmount) },
    ];
  }, [invoices]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<Invoice>
      config={invoicesPageConfig}
      data={invoices}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["invoice_number", "client_name", "client_company"]}
      onAction={handleAction}
    />
  );
}
