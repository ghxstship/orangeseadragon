"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { receiptsPageConfig } from "@/config/pages/receipts";

interface ReceiptRecord {
  id: string;
  receipt_number: string;
  vendor_name: string;
  category: "equipment" | "supplies" | "services" | "travel" | "catering" | "other";
  amount: number;
  date: string;
  event_name?: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "reimbursed";
  submitted_by: string;
  has_attachment: boolean;
}

export default function ReceiptsPage() {
  const [receiptsData, setReceiptsData] = React.useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchReceipts() {
      try {
        const response = await fetch("/api/v1/receipts");
        if (response.ok) {
          const result = await response.json();
          setReceiptsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch receipts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReceipts();
  }, []);

  const stats = React.useMemo(() => {
    const totalAmount = receiptsData.reduce((acc, r) => acc + (r.amount || 0), 0);
    const pendingAmount = receiptsData.filter((r) => r.status === "pending").reduce((acc, r) => acc + (r.amount || 0), 0);
    const approvedAmount = receiptsData.filter((r) => r.status === "approved" || r.status === "reimbursed").reduce((acc, r) => acc + (r.amount || 0), 0);
    return [
      { id: "total", label: "Total Receipts", value: receiptsData.length },
      { id: "amount", label: "Total Amount", value: totalAmount, format: "currency" as const },
      { id: "pending", label: "Pending Review", value: pendingAmount, format: "currency" as const },
      { id: "approved", label: "Approved", value: approvedAmount, format: "currency" as const },
    ];
  }, [receiptsData]);

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
    <DataViewPage<ReceiptRecord>
      config={receiptsPageConfig}
      data={receiptsData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["receipt_number", "vendor_name", "description"]}
      onAction={handleAction}
    />
  );
}
