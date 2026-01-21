"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { budgetsPageConfig } from "@/config/pages/budgets";

interface Budget {
  id: string;
  name: string;
  project: string;
  total_budget: number;
  spent: number;
  committed: number;
  remaining: number;
  status: "on_track" | "at_risk" | "over_budget" | "under_budget";
  categories: { name: string; allocated: number; spent: number }[];
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBudgets() {
      try {
        const response = await fetch("/api/v1/budgets");
        if (response.ok) {
          const result = await response.json();
          setBudgets(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch budgets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBudgets();
  }, []);

  const stats = React.useMemo(() => {
    const totalBudget = budgets.reduce((acc, b) => acc + (b.total_budget || 0), 0);
    const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
    const totalCommitted = budgets.reduce((acc, b) => acc + (b.committed || 0), 0);
    const atRisk = budgets.filter((b) => b.status === "at_risk" || b.status === "over_budget").length;
    return [
      { id: "total", label: "Total Budget", value: totalBudget, format: "currency" as const },
      { id: "spent", label: "Total Spent", value: totalSpent, format: "currency" as const },
      { id: "committed", label: "Committed", value: totalCommitted, format: "currency" as const },
      { id: "atRisk", label: "At Risk", value: atRisk },
    ];
  }, [budgets]);

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
    <DataViewPage<Budget>
      config={budgetsPageConfig}
      data={budgets}
      stats={stats}
      getRowId={(b) => b.id}
      searchFields={["name", "project"]}
      onAction={handleAction}
    />
  );
}
