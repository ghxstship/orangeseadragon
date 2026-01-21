"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { jobsShiftsPageConfig } from "@/config/pages/jobs-shifts";

interface Shift {
  id: string;
  employee: string;
  date: string;
  time: string;
  location: string;
  status: string;
}

export default function JobsShiftsPage() {
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchShifts() {
      try {
        const response = await fetch("/api/v1/business/jobs/shifts");
        if (response.ok) {
          const result = await response.json();
          setShifts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchShifts();
  }, []);

  const stats = React.useMemo(() => {
    const confirmedCount = shifts.filter((s) => s.status === "confirmed").length;
    const pendingCount = shifts.filter((s) => s.status === "pending").length;
    return [
      { id: "total", label: "Total Shifts", value: shifts.length },
      { id: "confirmed", label: "Confirmed", value: confirmedCount },
      { id: "pending", label: "Pending", value: pendingCount },
    ];
  }, [shifts]);

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
    <DataViewPage<Shift>
      config={jobsShiftsPageConfig}
      data={shifts}
      stats={stats}
      getRowId={(s) => s.id}
      searchFields={["employee", "location"]}
      onAction={handleAction}
    />
  );
}
