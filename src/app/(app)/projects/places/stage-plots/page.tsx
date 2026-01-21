"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { stagePlotsPageConfig } from "@/config/pages/stage-plots";
import { STAGE_PLOT_STATUS, type StagePlotStatus } from "@/lib/enums";

interface StagePlot {
  id: string;
  name: string;
  artist_name: string;
  event_name: string;
  stage: string;
  version: number;
  status: StagePlotStatus;
  input_count: number;
  monitor_count: number;
  last_modified: string;
  submitted_by?: string;
}

export default function StagePlotsPage() {
  const [stagePlotsData, setStagePlotsData] = React.useState<StagePlot[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStagePlots() {
      try {
        const response = await fetch("/api/v1/projects/places/stage-plots");
        if (response.ok) {
          const result = await response.json();
          setStagePlotsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch stage plots:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStagePlots();
  }, []);

  const stats = React.useMemo(() => {
    const approved = stagePlotsData.filter((p) => p.status === STAGE_PLOT_STATUS.APPROVED).length;
    const pending = stagePlotsData.filter((p) => p.status === STAGE_PLOT_STATUS.SUBMITTED).length;
    const drafts = stagePlotsData.filter((p) => p.status === STAGE_PLOT_STATUS.DRAFT).length;
    return [
      { id: "total", label: "Total Plots", value: stagePlotsData.length },
      { id: "approved", label: "Approved", value: approved },
      { id: "pending", label: "Pending Review", value: pending },
      { id: "drafts", label: "Drafts", value: drafts },
    ];
  }, [stagePlotsData]);

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
    <DataViewPage<StagePlot>
      config={stagePlotsPageConfig}
      data={stagePlotsData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "artist_name", "event_name", "stage"]}
      onAction={handleAction}
    />
  );
}
