"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { commissionsPageConfig } from "@/config/pages/commissions";

interface CommissionRecord {
  id: string;
  sales_person: string;
  period: string;
  sales_amount: number;
  commission_rate: number;
  commission_earned: number;
  target: number;
  status: "pending" | "approved" | "paid";
  deals: number;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = React.useState<CommissionRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCommissions() {
      try {
        const response = await fetch("/api/v1/commissions");
        if (response.ok) {
          const result = await response.json();
          setCommissions(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch commissions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCommissions();
  }, []);

  const stats = React.useMemo(() => {
    const totalCommissions = commissions.reduce((acc, c) => acc + (c.commission_earned || 0), 0);
    const pendingCommissions = commissions.filter((c) => c.status === "pending").reduce((acc, c) => acc + (c.commission_earned || 0), 0);
    const paidCommissions = commissions.filter((c) => c.status === "paid").reduce((acc, c) => acc + (c.commission_earned || 0), 0);
    const totalSales = commissions.reduce((acc, c) => acc + (c.sales_amount || 0), 0);
    return [
      { id: "total", label: "Total Commissions", value: totalCommissions, format: "currency" as const },
      { id: "pending", label: "Pending Payout", value: pendingCommissions, format: "currency" as const },
      { id: "paid", label: "Paid Out", value: paidCommissions, format: "currency" as const },
      { id: "sales", label: "Total Sales", value: totalSales, format: "currency" as const },
    ];
  }, [commissions]);

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
    <DataViewPage<CommissionRecord>
      config={commissionsPageConfig}
      data={commissions}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["sales_person", "period"]}
      onAction={handleAction}
    />
  );
}
