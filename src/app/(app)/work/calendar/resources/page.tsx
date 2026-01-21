"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { calendarResourcesPageConfig } from "@/config/pages/calendar-resources";

interface Resource {
  id: string;
  name: string;
  type: "room" | "vehicle" | "equipment";
  capacity: number;
  status: "available" | "booked";
  location: string;
  amenities: string[];
}

export default function CalendarResourcesPage() {
  const [resourcesData, setResourcesData] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch("/api/v1/work/calendar/resources");
        if (response.ok) {
          const result = await response.json();
          setResourcesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const stats = React.useMemo(() => {
    const available = resourcesData.filter((r) => r.status === "available").length;
    const booked = resourcesData.filter((r) => r.status === "booked").length;
    const totalCapacity = resourcesData.reduce((sum, r) => sum + (r.capacity || 0), 0);
    return [
      { id: "total", label: "Total Resources", value: resourcesData.length },
      { id: "available", label: "Available Now", value: available },
      { id: "booked", label: "Currently Booked", value: booked },
      { id: "capacity", label: "Total Capacity", value: totalCapacity },
    ];
  }, [resourcesData]);

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
    <DataViewPage<Resource>
      config={calendarResourcesPageConfig}
      data={resourcesData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "location", "type"]}
      onAction={handleAction}
    />
  );
}
