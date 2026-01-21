"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { riggingPageConfig } from "@/config/pages/rigging";

interface RiggingPoint {
  id: string;
  pointId: string;
  location: string;
  eventName: string;
  venue: string;
  capacity: number;
  currentLoad: number;
  equipment: string;
  lastInspection: string;
  nextInspection: string;
  status: string;
  certifiedBy?: string;
}

export default function RiggingPage() {
  const [pointsData, setPointsData] = React.useState<RiggingPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch("/api/v1/rigging-points");
        if (response.ok) {
          const result = await response.json();
          setPointsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch rigging points:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, []);

  const stats = React.useMemo(() => {
    const approvedCount = pointsData.filter((p) => p.status === "approved").length;
    const pendingCount = pointsData.filter((p) => p.status === "pending_inspection").length;
    const warningCount = pointsData.filter((p) => p.status === "warning" || p.status === "failed").length;
    return [
      { id: "total", label: "Total Points", value: pointsData.length },
      { id: "approved", label: "Approved", value: approvedCount },
      { id: "pending", label: "Pending Inspection", value: pendingCount },
      { id: "warnings", label: "Warnings", value: warningCount },
    ];
  }, [pointsData]);

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
    <DataViewPage<RiggingPoint>
      config={riggingPageConfig}
      data={pointsData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["pointId", "location", "venue"]}
      onAction={handleAction}
    />
  );
}
