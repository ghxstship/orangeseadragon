"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { invoicesPageConfig } from "@/config/pages/invoices";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

export default function AccountBillingInvoicesPage() {
  const [invoicesData, setInvoicesData] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch("/api/v1/account/billing/invoices");
        if (response.ok) {
          const result = await response.json();
          setInvoicesData(result.data || []);
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
    const paidCount = invoicesData.filter((i) => i.status === "paid").length;
    const totalBilled = invoicesData.reduce((sum, i) => sum + (i.amount || 0), 0);

    return [
      { id: "total", label: "Total Invoices", value: invoicesData.length },
      { id: "paid", label: "Paid", value: paidCount },
      { id: "billed", label: "Total Billed", value: totalBilled, format: "currency" as const },
    ];
  }, [invoicesData]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "download":
          console.log("Download invoice PDF", payload);
          break;
        case "view":
          console.log("View invoice details", payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    []
  );

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
      data={invoicesData}
      stats={stats}
      getRowId={(invoice) => invoice.id}
      searchFields={["id"]}
      onAction={handleAction}
    />
  );
}
