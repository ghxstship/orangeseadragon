"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { procurementOrdersPageConfig } from "@/config/pages/procurement-orders";

interface Order {
  id: string;
  vendor: string;
  items: number;
  total: string;
  order_date: string;
  status: string;
}

export default function ProcurementOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/v1/business/procurement/orders");
        if (response.ok) {
          const result = await response.json();
          setOrders(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const stats = React.useMemo(() => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    return [
      { id: "total", label: "Total Orders", value: orders.length },
      { id: "pending", label: "Pending", value: pendingCount },
      { id: "delivered", label: "Delivered", value: deliveredCount },
    ];
  }, [orders]);

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
    <DataViewPage<Order>
      config={procurementOrdersPageConfig}
      data={orders}
      stats={stats}
      getRowId={(o) => o.id}
      searchFields={["id", "vendor"]}
      onAction={handleAction}
    />
  );
}
