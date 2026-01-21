"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { crowdManagementPageConfig } from "@/config/pages/crowd-management";

interface CrowdZone {
  id: string;
  name: string;
  location: string;
  capacity: number;
  current_count: number;
  trend: "increasing" | "decreasing" | "stable";
  status: "normal" | "busy" | "crowded" | "critical";
  last_updated: string;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function CrowdManagementPage() {
  const [crowdZonesData, setCrowdZonesData] = React.useState<CrowdZone[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCrowdZones() {
      try {
        const response = await fetch("/api/v1/crowd-management");
        if (response.ok) {
          const result = await response.json();
          setCrowdZonesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch crowd zones:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCrowdZones();
  }, []);

  const stats = React.useMemo(() => {
    const totalCapacity = crowdZonesData.reduce((acc, z) => acc + (z.capacity || 0), 0);
    const totalCurrent = crowdZonesData.reduce((acc, z) => acc + (z.current_count || 0), 0);
    const crowdedZones = crowdZonesData.filter((z) => z.status === "crowded" || z.status === "critical").length;
    const overallPercentage = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;

    return [
      { id: "attendance", label: "Total Attendance", value: formatNumber(totalCurrent) },
      { id: "density", label: "Overall Density", value: `${overallPercentage}%` },
      { id: "zones", label: "Active Zones", value: crowdZonesData.length },
      { id: "crowded", label: "Crowded Zones", value: crowdedZones },
    ];
  }, [crowdZonesData]);

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
    <DataViewPage<CrowdZone>
      config={crowdManagementPageConfig}
      data={crowdZonesData}
      stats={stats}
      getRowId={(z) => z.id}
      searchFields={["name", "location"]}
      onAction={handleAction}
    />
  );
}
