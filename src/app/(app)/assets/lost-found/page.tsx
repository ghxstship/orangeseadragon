"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { lostFoundPageConfig } from "@/config/pages/lost-found";

interface LostFoundItem {
  id: string;
  item_description: string;
  category: "electronics" | "clothing" | "accessories" | "documents" | "keys" | "bags" | "other";
  found_location: string;
  found_date: string;
  found_time: string;
  event_name: string;
  status: "unclaimed" | "claimed" | "pending_pickup" | "disposed";
  claimant_name?: string;
  claimant_phone?: string;
  storage_location: string;
  notes?: string;
}

export default function LostFoundPage() {
  const [lostFoundData, setLostFoundData] = React.useState<LostFoundItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLostFound() {
      try {
        const response = await fetch("/api/v1/lost-found");
        if (response.ok) {
          const result = await response.json();
          setLostFoundData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch lost-found:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLostFound();
  }, []);

  const stats = React.useMemo(() => {
    const unclaimed = lostFoundData.filter((i) => i.status === "unclaimed").length;
    const pendingPickup = lostFoundData.filter((i) => i.status === "pending_pickup").length;
    const claimed = lostFoundData.filter((i) => i.status === "claimed").length;

    return [
      { id: "total", label: "Total Items", value: lostFoundData.length },
      { id: "unclaimed", label: "Unclaimed", value: unclaimed },
      { id: "pending", label: "Pending Pickup", value: pendingPickup },
      { id: "claimed", label: "Claimed", value: claimed },
    ];
  }, [lostFoundData]);

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
    <DataViewPage<LostFoundItem>
      config={lostFoundPageConfig}
      data={lostFoundData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["item_description", "found_location", "event_name", "storage_location"]}
      onAction={handleAction}
    />
  );
}
