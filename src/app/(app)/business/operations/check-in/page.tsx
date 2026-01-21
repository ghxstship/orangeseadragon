"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { checkInPageConfig } from "@/config/pages/check-in";

interface CheckInEntry {
  id: string;
  guest_name: string;
  ticket_type: string;
  ticket_number: string;
  event_name: string;
  check_in_time?: string;
  status: "pending" | "checked_in" | "denied" | "no_show";
  access_zones: string[];
  notes?: string;
}

export default function CheckInPage() {
  const [checkInData, setCheckInData] = React.useState<CheckInEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCheckInData() {
      try {
        const response = await fetch("/api/v1/check-in");
        if (response.ok) {
          const result = await response.json();
          setCheckInData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch check-in data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCheckInData();
  }, []);

  const stats = React.useMemo(() => {
    const checkedIn = checkInData.filter((e) => e.status === "checked_in").length;
    const pending = checkInData.filter((e) => e.status === "pending").length;
    const denied = checkInData.filter((e) => e.status === "denied").length;

    return [
      { id: "total", label: "Total Guests", value: checkInData.length },
      { id: "checkedIn", label: "Checked In", value: checkedIn },
      { id: "pending", label: "Pending", value: pending },
      { id: "denied", label: "Denied", value: denied },
    ];
  }, [checkInData]);

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
    <DataViewPage<CheckInEntry>
      config={checkInPageConfig}
      data={checkInData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["guest_name", "ticket_number", "ticket_type"]}
      onAction={handleAction}
    />
  );
}
