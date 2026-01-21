"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { purchaseOrdersPageConfig } from "@/config/pages/purchase-orders";
import { PURCHASE_ORDER_STATUS, type PurchaseOrderStatus } from "@/lib/enums";

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor: string;
  project: string;
  items: { description: string; quantity: number; unit_price: number }[];
  total_amount: number;
  status: PurchaseOrderStatus;
  created_date: string;
  expected_delivery?: string;
  created_by: string;
}

export default function PurchaseOrdersPage() {
  const [purchaseOrdersData, setPurchaseOrdersData] = React.useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPurchaseOrders() {
      try {
        const response = await fetch("/api/v1/purchase-orders");
        if (response.ok) {
          const result = await response.json();
          setPurchaseOrdersData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchaseOrders();
  }, []);

  const stats = React.useMemo(() => {
    const pendingApproval = purchaseOrdersData.filter((po) => po.status === PURCHASE_ORDER_STATUS.PENDING_APPROVAL).length;
    const totalValue = purchaseOrdersData.filter((po) => po.status !== PURCHASE_ORDER_STATUS.CANCELLED && po.status !== PURCHASE_ORDER_STATUS.DRAFT).reduce((acc, po) => acc + (po.total_amount || 0), 0);
    const ordered = purchaseOrdersData.filter((po) => po.status === PURCHASE_ORDER_STATUS.ORDERED).length;

    return [
      { id: "total", label: "Total POs", value: purchaseOrdersData.length },
      { id: "pending", label: "Pending Approval", value: pendingApproval },
      { id: "value", label: "Total Value", value: totalValue, format: "currency" as const },
      { id: "ordered", label: "In Transit", value: ordered },
    ];
  }, [purchaseOrdersData]);

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
    <DataViewPage<PurchaseOrder>
      config={purchaseOrdersPageConfig}
      data={purchaseOrdersData}
      stats={stats}
      getRowId={(po) => po.id}
      searchFields={["po_number", "vendor", "project"]}
      onAction={handleAction}
    />
  );
}
