"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { contentApprovalsPageConfig } from "@/config/pages/content-approvals";

interface Approval {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  submitted_at: string;
  status: string;
}

export default function ContentApprovalsPage() {
  const [approvals, setApprovals] = React.useState<Approval[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApprovals() {
      try {
        const response = await fetch("/api/v1/content/approvals");
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
    const pendingCount = approvals.filter((a) => a.status === "pending").length;
    const approvedCount = approvals.filter((a) => a.status === "approved").length;
    return [
      { id: "total", label: "Total", value: approvals.length },
      { id: "pending", label: "Pending", value: pendingCount },
      { id: "approved", label: "Approved", value: approvedCount },
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
    <DataViewPage<Approval>
      config={contentApprovalsPageConfig}
      data={approvals}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["title", "submitted_by"]}
      onAction={handleAction}
    />
  );
}
