"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { procurementRfqPageConfig } from "@/config/pages/procurement-rfq";

interface Rfq {
  id: string;
  title: string;
  vendors: number;
  responses: number;
  deadline: string;
  status: string;
}

export default function ProcurementRfqPage() {
  const [rfqs, setRfqs] = React.useState<Rfq[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRfqs() {
      try {
        const response = await fetch("/api/v1/business/procurement/rfq");
        if (response.ok) {
          const result = await response.json();
          setRfqs(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch RFQs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRfqs();
  }, []);

  const stats = React.useMemo(() => {
    const openCount = rfqs.filter((r) => r.status === "open").length;
    const closedCount = rfqs.filter((r) => r.status === "closed").length;
    return [
      { id: "total", label: "Total RFQs", value: rfqs.length },
      { id: "open", label: "Open", value: openCount },
      { id: "closed", label: "Closed", value: closedCount },
    ];
  }, [rfqs]);

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
    <DataViewPage<Rfq>
      config={procurementRfqPageConfig}
      data={rfqs}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["id", "title"]}
      onAction={handleAction}
    />
  );
}
