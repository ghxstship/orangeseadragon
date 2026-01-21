"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { procurementRequisitionsPageConfig } from "@/config/pages/procurement-requisitions";

interface Requisition {
  id: string;
  title: string;
  requested_by: string;
  amount: string;
  date: string;
  status: string;
}

export default function ProcurementRequisitionsPage() {
  const [requisitions, setRequisitions] = React.useState<Requisition[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRequisitions() {
      try {
        const response = await fetch("/api/v1/business/procurement/requisitions");
        if (response.ok) {
          const result = await response.json();
          setRequisitions(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch requisitions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequisitions();
  }, []);

  const stats = React.useMemo(() => {
    const pendingCount = requisitions.filter((r) => r.status === "pending").length;
    const approvedCount = requisitions.filter((r) => r.status === "approved").length;
    return [
      { id: "total", label: "Total Requisitions", value: requisitions.length },
      { id: "pending", label: "Pending", value: pendingCount },
      { id: "approved", label: "Approved", value: approvedCount },
    ];
  }, [requisitions]);

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
    <DataViewPage<Requisition>
      config={procurementRequisitionsPageConfig}
      data={requisitions}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["id", "title", "requested_by"]}
      onAction={handleAction}
    />
  );
}
