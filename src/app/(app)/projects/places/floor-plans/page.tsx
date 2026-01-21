"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { floorPlansPageConfig } from "@/config/pages/floor-plans";
import { FLOOR_PLAN_STATUS, type FloorPlanStatus } from "@/lib/enums";

interface FloorPlan {
  id: string;
  name: string;
  event_name: string;
  venue: string;
  area: string;
  version: number;
  status: FloorPlanStatus;
  capacity: number;
  table_count?: number;
  last_modified: string;
  created_by: string;
}

export default function FloorPlansPage() {
  const [floorPlans, setFloorPlans] = React.useState<FloorPlan[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFloorPlans() {
      try {
        const response = await fetch("/api/v1/floor-plans");
        if (response.ok) {
          const result = await response.json();
          setFloorPlans(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch floor plans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFloorPlans();
  }, []);

  const stats = React.useMemo(() => {
    const approved = floorPlans.filter((p) => p.status === FLOOR_PLAN_STATUS.APPROVED).length;
    const inReview = floorPlans.filter((p) => p.status === FLOOR_PLAN_STATUS.REVIEW).length;
    const drafts = floorPlans.filter((p) => p.status === FLOOR_PLAN_STATUS.DRAFT).length;

    return [
      { id: "total", label: "Total Plans", value: floorPlans.length },
      { id: "approved", label: "Approved", value: approved },
      { id: "review", label: "In Review", value: inReview },
      { id: "drafts", label: "Drafts", value: drafts },
    ];
  }, [floorPlans]);

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
    <DataViewPage<FloorPlan>
      config={floorPlansPageConfig}
      data={floorPlans}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "event_name", "venue"]}
      onAction={handleAction}
    />
  );
}
