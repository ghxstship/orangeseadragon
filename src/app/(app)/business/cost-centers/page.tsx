"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { costCentersPageConfig } from "@/config/pages/cost-centers";

interface CostCenter {
  id: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
  spent: number;
  committed: number;
  status: "active" | "inactive" | "over_budget";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CostCentersPage() {
  const [costCentersData, setCostCentersData] = React.useState<CostCenter[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCostCenters() {
      try {
        const response = await fetch("/api/v1/cost-centers");
        if (response.ok) {
          const result = await response.json();
          setCostCentersData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch cost centers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCostCenters();
  }, []);

  const stats = React.useMemo(() => {
    const totalBudget = costCentersData.reduce((acc, c) => acc + (c.budget || 0), 0);
    const totalSpent = costCentersData.reduce((acc, c) => acc + (c.spent || 0), 0);
    const totalCommitted = costCentersData.reduce((acc, c) => acc + (c.committed || 0), 0);
    const totalAvailable = totalBudget - totalSpent - totalCommitted;
    const overBudgetCount = costCentersData.filter((c) => c.status === "over_budget").length;

    return [
      { id: "budget", label: "Total Budget", value: formatCurrency(totalBudget) },
      { id: "spent", label: "Spent / Committed", value: `${formatCurrency(totalSpent)} / ${formatCurrency(totalCommitted)}` },
      { id: "available", label: "Available", value: formatCurrency(totalAvailable) },
      { id: "overBudget", label: "Over Budget", value: overBudgetCount },
    ];
  }, [costCentersData]);

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
    <DataViewPage<CostCenter>
      config={costCentersPageConfig}
      data={costCentersData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["code", "name", "department", "manager"]}
      onAction={handleAction}
    />
  );
}
