"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { cateringPageConfig } from "@/config/pages/catering";

interface CateringOrder {
  id: string;
  order_number: string;
  event_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snacks" | "beverages";
  service_time: string;
  date: string;
  location: string;
  headcount: number;
  dietary_notes: string[];
  vendor: string;
  status: "pending" | "confirmed" | "preparing" | "delivered" | "completed";
  total_cost: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CateringPage() {
  const [cateringData, setCateringData] = React.useState<CateringOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCateringData() {
      try {
        const response = await fetch("/api/v1/catering");
        if (response.ok) {
          const result = await response.json();
          setCateringData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch catering data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCateringData();
  }, []);

  const stats = React.useMemo(() => {
    const pending = cateringData.filter((o) => o.status === "pending" || o.status === "confirmed").length;
    const totalHeadcount = cateringData.filter((o) => o.status !== "completed").reduce((acc, o) => acc + (o.headcount || 0), 0);
    const totalCost = cateringData.reduce((acc, o) => acc + (o.total_cost || 0), 0);

    return [
      { id: "total", label: "Total Orders", value: cateringData.length },
      { id: "pending", label: "Pending/Confirmed", value: pending },
      { id: "headcount", label: "Total Headcount", value: totalHeadcount },
      { id: "cost", label: "Total Cost", value: formatCurrency(totalCost) },
    ];
  }, [cateringData]);

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
    <DataViewPage<CateringOrder>
      config={cateringPageConfig}
      data={cateringData}
      stats={stats}
      getRowId={(o) => o.id}
      searchFields={["order_number", "event_name", "vendor"]}
      onAction={handleAction}
    />
  );
}
