"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { cueSheetsPageConfig } from "@/config/pages/cue-sheets";
import { CUE_SHEET_STATUS, type CueSheetStatus, type CueStatus, type CueDepartment } from "@/lib/enums";

interface Cue {
  id: string;
  cue_number: string;
  description: string;
  department: CueDepartment;
  action: string;
  duration?: number;
  status: CueStatus;
}

interface CueSheet {
  id: string;
  name: string;
  event_name: string;
  event_date: string;
  stage: string;
  status: CueSheetStatus;
  cues: Cue[];
}

export default function CueSheetsPage() {
  const [cueSheetsData, setCueSheetsData] = React.useState<CueSheet[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCueSheets() {
      try {
        const response = await fetch("/api/v1/cue-sheets");
        if (response.ok) {
          const result = await response.json();
          setCueSheetsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch cue sheets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCueSheets();
  }, []);

  const stats = React.useMemo(() => {
    const totalCues = cueSheetsData.reduce((acc, s) => acc + (s.cues?.length || 0), 0);
    const inRehearsal = cueSheetsData.filter((s) => s.status === CUE_SHEET_STATUS.REHEARSAL).length;
    const liveCount = cueSheetsData.filter((s) => s.status === CUE_SHEET_STATUS.LIVE).length;

    return [
      { id: "sheets", label: "Total Sheets", value: cueSheetsData.length },
      { id: "cues", label: "Total Cues", value: totalCues },
      { id: "rehearsal", label: "In Rehearsal", value: inRehearsal },
      { id: "live", label: "Live Now", value: liveCount },
    ];
  }, [cueSheetsData]);

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
    <DataViewPage<CueSheet>
      config={cueSheetsPageConfig}
      data={cueSheetsData}
      stats={stats}
      getRowId={(s) => s.id}
      searchFields={["name", "event_name", "stage"]}
      onAction={handleAction}
    />
  );
}
