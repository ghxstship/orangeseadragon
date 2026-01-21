"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { approvalsPageConfig } from "@/config/pages/approvals";

interface ApprovalRequest {
  id: string;
  type: "expense" | "purchase" | "timeoff" | "document" | "budget" | "contract";
  title: string;
  description: string;
  requested_by: {
    name: string;
    department: string;
  };
  amount?: number;
  submitted_at: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "approved" | "rejected";
  due_date?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = React.useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApprovals() {
      try {
        const response = await fetch("/api/v1/approvals");
        if (response.ok) {
          const result = await response.json();
          setApprovals(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch approvals:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApprovals();
  }, []);

  const stats = React.useMemo(() => {
    const pendingRequests = approvals.filter((r) => r.status === "pending");
    const pendingAmount = pendingRequests.reduce((acc, r) => acc + (r.amount || 0), 0);

    return [
      { id: "pending", label: "Pending Approvals", value: pendingRequests.length },
      { id: "amount", label: "Pending Amount", value: formatCurrency(pendingAmount) },
      { id: "approved", label: "Approved This Week", value: approvals.filter((r) => r.status === "approved").length },
      { id: "urgent", label: "Urgent", value: pendingRequests.filter((r) => r.priority === "urgent").length },
    ];
  }, [approvals]);

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
    <DataViewPage<ApprovalRequest>
      config={approvalsPageConfig}
      data={approvals}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["title", "description"]}
      onAction={handleAction}
    />
  );
}
