"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { reconciliationPageConfig } from "@/config/pages/reconciliation";

interface ReconciliationItem {
  id: string;
  transaction_id: string;
  bank_reference: string;
  amount: number;
  date: string;
  description: string;
  status: "matched" | "unmatched" | "partial" | "disputed";
  matched_to?: string;
  difference?: number;
  source: "bank" | "system";
}

export default function ReconciliationPage() {
  const [reconciliationData, setReconciliationData] = React.useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchReconciliation() {
      try {
        const response = await fetch("/api/v1/reconciliation");
        if (response.ok) {
          const result = await response.json();
          setReconciliationData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch reconciliation:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReconciliation();
  }, []);

  const stats = React.useMemo(() => {
    const matchedCount = reconciliationData.filter((i) => i.status === "matched").length;
    const unmatchedCount = reconciliationData.filter((i) => i.status === "unmatched").length;
    const partialCount = reconciliationData.filter((i) => i.status === "partial" || i.status === "disputed").length;
    const unmatchedAmount = reconciliationData.filter((i) => i.status === "unmatched").reduce((acc, i) => acc + (i.amount || 0), 0);
    return [
      { id: "total", label: "Total Transactions", value: reconciliationData.length },
      { id: "matched", label: "Matched", value: matchedCount },
      { id: "unmatched", label: "Unmatched", value: unmatchedCount },
      { id: "partial", label: "Partial / Disputed", value: partialCount },
      { id: "amount", label: "Unmatched Amount", value: unmatchedAmount, format: "currency" as const },
    ];
  }, [reconciliationData]);

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
    <DataViewPage<ReconciliationItem>
      config={reconciliationPageConfig}
      data={reconciliationData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["transaction_id", "description", "bank_reference"]}
      onAction={handleAction}
    />
  );
}
