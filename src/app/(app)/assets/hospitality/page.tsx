"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { hospitalityPageConfig } from "@/config/pages/hospitality";

interface HospitalityRequest {
  id: string;
  type: "accommodation" | "transportation" | "catering";
  event_name: string;
  requested_for: string;
  details: string;
  date: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  cost?: number;
  notes?: string;
}

export default function HospitalityPage() {
  const [hospitalityData, setHospitalityData] = React.useState<HospitalityRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchHospitality() {
      try {
        const response = await fetch("/api/v1/hospitality");
        if (response.ok) {
          const result = await response.json();
          setHospitalityData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch hospitality:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHospitality();
  }, []);

  const stats = React.useMemo(() => {
    const pending = hospitalityData.filter((r) => r.status === "pending").length;
    const confirmed = hospitalityData.filter((r) => r.status === "confirmed").length;
    const totalCost = hospitalityData.reduce((acc, r) => acc + (r.cost || 0), 0);
    return [
      { id: "total", label: "Total Requests", value: hospitalityData.length },
      { id: "pending", label: "Pending", value: pending },
      { id: "confirmed", label: "Confirmed", value: confirmed },
      { id: "cost", label: "Total Cost", value: totalCost, format: "currency" as const },
    ];
  }, [hospitalityData]);

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
    <DataViewPage<HospitalityRequest>
      config={hospitalityPageConfig}
      data={hospitalityData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["details", "event_name", "requested_for"]}
      onAction={handleAction}
    />
  );
}
