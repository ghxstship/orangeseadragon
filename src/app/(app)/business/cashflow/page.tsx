"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { cashflowPageConfig } from "@/config/pages/cashflow";

interface CashflowEntry {
  id: string;
  category: string;
  type: "inflow" | "outflow";
  amount: number;
  period: string;
  change: number;
}

export default function CashflowPage() {
  const [cashflowData, setCashflowData] = React.useState<CashflowEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCashflow() {
      try {
        const response = await fetch("/api/v1/cashflow");
        if (response.ok) {
          const result = await response.json();
          setCashflowData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch cashflow:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCashflow();
  }, []);

  const stats = React.useMemo(() => {
    const totalInflow = cashflowData.filter((e) => e.type === "inflow").reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalOutflow = cashflowData.filter((e) => e.type === "outflow").reduce((acc, e) => acc + (e.amount || 0), 0);
    const netCashflow = totalInflow - totalOutflow;
    const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

    return [
      { id: "inflow", label: "Total Inflow", value: formatCurrency(totalInflow) },
      { id: "outflow", label: "Total Outflow", value: formatCurrency(totalOutflow) },
      { id: "net", label: "Net Cash Flow", value: formatCurrency(netCashflow) },
      { id: "entries", label: "Entries", value: cashflowData.length },
    ];
  }, [cashflowData]);

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
    <DataViewPage<CashflowEntry>
      config={cashflowPageConfig}
      data={cashflowData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["category", "period"]}
      onAction={handleAction}
    />
  );
}
