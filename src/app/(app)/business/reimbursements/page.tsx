"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { reimbursementsPageConfig } from "@/config/pages/reimbursements";

interface ReimbursementRequest {
  id: string;
  requestNumber: string;
  employeeName: string;
  department: string;
  category: "travel" | "meals" | "supplies" | "equipment" | "other";
  amount: number;
  submittedDate: string;
  status: "pending" | "approved" | "rejected" | "paid";
  description: string;
  receiptsCount: number;
  eventName?: string;
}

export default function ReimbursementsPage() {
  const [reimbursementsData, setReimbursementsData] = React.useState<ReimbursementRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchReimbursements() {
      try {
        const response = await fetch("/api/v1/reimbursements");
        if (response.ok) {
          const result = await response.json();
          setReimbursementsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch reimbursements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReimbursements();
  }, []);

  const stats = React.useMemo(() => {
    const totalAmount = reimbursementsData.reduce((acc, r) => acc + (r.amount || 0), 0);
    const pendingAmount = reimbursementsData.filter((r) => r.status === "pending").reduce((acc, r) => acc + (r.amount || 0), 0);
    const approvedAmount = reimbursementsData.filter((r) => r.status === "approved").reduce((acc, r) => acc + (r.amount || 0), 0);
    const paidAmount = reimbursementsData.filter((r) => r.status === "paid").reduce((acc, r) => acc + (r.amount || 0), 0);

    return [
      { id: "total", label: "Total Requests", value: totalAmount, format: "currency" as const },
      { id: "pending", label: "Pending Review", value: pendingAmount, format: "currency" as const },
      { id: "approved", label: "Approved", value: approvedAmount, format: "currency" as const },
      { id: "paid", label: "Paid", value: paidAmount, format: "currency" as const },
    ];
  }, [reimbursementsData]);

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
    <DataViewPage<ReimbursementRequest>
      config={reimbursementsPageConfig}
      data={reimbursementsData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["requestNumber", "employeeName", "description", "department"]}
      onAction={handleAction}
    />
  );
}
