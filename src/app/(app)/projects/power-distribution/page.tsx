"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { powerDistributionPageConfig } from "@/config/pages/power-distribution";

interface PowerDistribution {
  id: string;
  name: string;
  location: string;
  eventName: string;
  totalCapacity: number;
  currentLoad: number;
  status: string;
}

export default function PowerDistributionPage() {
  const [distroData, setDistroData] = React.useState<PowerDistribution[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDistributions() {
      try {
        const response = await fetch("/api/v1/power-distributions");
        if (response.ok) {
          const result = await response.json();
          setDistroData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch power distributions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDistributions();
  }, []);

  const stats = React.useMemo(() => {
    const totalCapacity = distroData.reduce((acc, d) => acc + (d.totalCapacity || 0), 0);
    const totalLoad = distroData.reduce((acc, d) => acc + (d.currentLoad || 0), 0);
    const overloadCount = distroData.filter((d) => d.status === "overload").length;
    return [
      { id: "capacity", label: "Total Capacity", value: `${totalCapacity}A` },
      { id: "load", label: "Current Load", value: `${totalLoad}A` },
      { id: "distributions", label: "Distributions", value: distroData.length },
      { id: "overloads", label: "Overload Warnings", value: overloadCount },
    ];
  }, [distroData]);

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
    <DataViewPage<PowerDistribution>
      config={powerDistributionPageConfig}
      data={distroData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["name", "location", "eventName"]}
      onAction={handleAction}
    />
  );
}
