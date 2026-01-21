"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { costManagementPageConfig } from "@/config/pages/cost-management";

interface CostItem {
  id: string;
  service: string;
  category: "compute" | "database" | "storage" | "network" | "other";
  current_month: number;
  last_month: number;
  budget: number;
  trend: "up" | "down" | "stable";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CostManagementPage() {
  const [costItemsData, setCostItemsData] = React.useState<CostItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCostItems() {
      try {
        const response = await fetch("/api/v1/cost-management");
        if (response.ok) {
          const result = await response.json();
          setCostItemsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch cost items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCostItems();
  }, []);

  const stats = React.useMemo(() => {
    const totalCurrent = costItemsData.reduce((acc, c) => acc + (c.current_month || 0), 0);
    const totalBudget = costItemsData.reduce((acc, c) => acc + (c.budget || 0), 0);
    const budgetUsed = totalBudget > 0 ? Math.round((totalCurrent / totalBudget) * 100) : 0;

    return [
      { id: "current", label: "Current Month", value: formatCurrency(totalCurrent) },
      { id: "budget", label: "Monthly Budget", value: formatCurrency(totalBudget) },
      { id: "used", label: "Budget Used", value: `${budgetUsed}%` },
      { id: "annual", label: "Projected Annual", value: formatCurrency(totalCurrent * 12) },
    ];
  }, [costItemsData]);

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
    <DataViewPage<CostItem>
      config={costManagementPageConfig}
      data={costItemsData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["service", "category"]}
      onAction={handleAction}
    />
  );
}
