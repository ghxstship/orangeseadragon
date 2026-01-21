"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { ridersPageConfig } from "@/config/pages/riders";

interface Rider {
  id: string;
  artistName: string;
  eventName: string;
  eventDate: string;
  type: string;
  status: string;
}

export default function RidersPage() {
  const [ridersData, setRidersData] = React.useState<Rider[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRiders() {
      try {
        const response = await fetch("/api/v1/riders");
        if (response.ok) {
          const result = await response.json();
          setRidersData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch riders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRiders();
  }, []);

  const stats = React.useMemo(() => {
    const pendingCount = ridersData.filter((r) => r.status === "pending" || r.status === "in_review").length;
    const approvedCount = ridersData.filter((r) => r.status === "approved").length;
    const fulfilledCount = ridersData.filter((r) => r.status === "fulfilled").length;
    return [
      { id: "total", label: "Total Riders", value: ridersData.length },
      { id: "pending", label: "Pending Review", value: pendingCount },
      { id: "approved", label: "Approved", value: approvedCount },
      { id: "fulfilled", label: "Fulfilled", value: fulfilledCount },
    ];
  }, [ridersData]);

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
    <DataViewPage<Rider>
      config={ridersPageConfig}
      data={ridersData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["artistName", "eventName"]}
      onAction={handleAction}
    />
  );
}
