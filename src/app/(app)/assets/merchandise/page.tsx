"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { merchandisePageConfig } from "@/config/pages/merchandise";

interface MerchandiseItem {
  id: string;
  name: string;
  category: "apparel" | "accessories" | "collectibles" | "media" | "other";
  sku: string;
  price: number;
  cost: number;
  stock_quantity: number;
  low_stock_threshold: number;
  event_name: string;
  status: "active" | "low_stock" | "out_of_stock" | "discontinued";
  sold_quantity: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function MerchandisePage() {
  const [merchandise, setMerchandise] = React.useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMerchandise() {
      try {
        const response = await fetch("/api/v1/merchandise");
        if (response.ok) {
          const result = await response.json();
          setMerchandise(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch merchandise:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMerchandise();
  }, []);

  const stats = React.useMemo(() => {
    const totalRevenue = merchandise.reduce((acc, m) => acc + (m.sold_quantity || 0) * (m.price || 0), 0);
    const totalProfit = merchandise.reduce((acc, m) => acc + (m.sold_quantity || 0) * ((m.price || 0) - (m.cost || 0)), 0);
    const lowStockCount = merchandise.filter((m) => m.status === "low_stock" || m.status === "out_of_stock").length;

    return [
      { id: "total", label: "Total Products", value: merchandise.length },
      { id: "revenue", label: "Total Revenue", value: formatCurrency(totalRevenue) },
      { id: "profit", label: "Total Profit", value: formatCurrency(totalProfit) },
      { id: "lowStock", label: "Low Stock Alerts", value: lowStockCount },
    ];
  }, [merchandise]);

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
    <DataViewPage<MerchandiseItem>
      config={merchandisePageConfig}
      data={merchandise}
      stats={stats}
      getRowId={(m) => m.id}
      searchFields={["name", "sku", "category", "event_name"]}
      onAction={handleAction}
    />
  );
}
