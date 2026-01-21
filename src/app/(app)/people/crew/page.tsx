"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { crewPageConfig } from "@/config/pages/crew";
import { CREW_CALL_STATUS, type CrewCallStatus, type AssignmentStatus } from "@/lib/enums";

interface CrewCall {
  id: string;
  event_name: string;
  date: string;
  call_time: string;
  location: string;
  status: CrewCallStatus;
  positions_needed: number;
  positions_filled: number;
  crew: {
    id: string;
    name: string;
    role: string;
    status: AssignmentStatus;
  }[];
}

export default function CrewPage() {
  const [crewCalls, setCrewCalls] = React.useState<CrewCall[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCrewCalls() {
      try {
        const response = await fetch("/api/v1/crew-calls");
        if (response.ok) {
          const result = await response.json();
          setCrewCalls(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch crew calls:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCrewCalls();
  }, []);

  const stats = React.useMemo(() => {
    const upcoming = crewCalls.filter((c) => c.status !== CREW_CALL_STATUS.COMPLETED).length;
    const positionsNeeded = crewCalls.reduce((acc, c) => acc + (c.positions_needed || 0), 0);
    const positionsFilled = crewCalls.reduce((acc, c) => acc + (c.positions_filled || 0), 0);
    const fillRate = positionsNeeded > 0 ? Math.round((positionsFilled / positionsNeeded) * 100) : 0;
    return [
      { id: "total", label: "Total Crew Calls", value: crewCalls.length },
      { id: "upcoming", label: "Upcoming", value: upcoming },
      { id: "positions", label: "Positions Needed", value: positionsNeeded },
      { id: "fillRate", label: "Fill Rate", value: `${fillRate}%` },
    ];
  }, [crewCalls]);

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
    <DataViewPage<CrewCall>
      config={crewPageConfig}
      data={crewCalls}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["event_name", "location"]}
      onAction={handleAction}
    />
  );
}
