"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { procurementInvoicesPageConfig } from "@/config/pages/procurement-invoices";

interface Invoice {
  id: string;
  vendor: string;
  amount: string;
  due_date: string;
  status: string;
}

export default function ProcurementInvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch("/api/v1/business/procurement/invoices");
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
    const pendingCount = invoices.filter((i) => i.status === "pending").length;
    const overdueCount = invoices.filter((i) => i.status === "overdue").length;
    return [
      { id: "total", label: "Total Invoices", value: invoices.length },
      { id: "pending", label: "Pending", value: pendingCount },
      { id: "overdue", label: "Overdue", value: overdueCount },
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
      config={procurementInvoicesPageConfig}
      data={invoices}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["id", "vendor"]}
      onAction={handleAction}
    />
  );
}
