"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { parkingPageConfig } from "@/config/pages/parking";

interface ParkingPass {
  id: string;
  pass_number: string;
  vehicle_info: string;
  license_plate: string;
  holder_name: string;
  holder_role: string;
  event_name: string;
  lot_assignment: string;
  valid_from: string;
  valid_to: string;
  status: "active" | "expired" | "revoked" | "pending";
}

export default function ParkingPage() {
  const [parkingData, setParkingData] = React.useState<ParkingPass[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchParking() {
      try {
        const response = await fetch("/api/v1/parking");
        if (response.ok) {
          const result = await response.json();
          setParkingData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch parking:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchParking();
  }, []);

  const stats = React.useMemo(() => {
    const active = parkingData.filter((p) => p.status === "active").length;
    const pending = parkingData.filter((p) => p.status === "pending").length;
    const expired = parkingData.filter((p) => p.status === "expired").length;

    return [
      { id: "total", label: "Total Passes", value: parkingData.length },
      { id: "active", label: "Active", value: active },
      { id: "pending", label: "Pending", value: pending },
      { id: "expired", label: "Expired", value: expired },
    ];
  }, [parkingData]);

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
    <DataViewPage<ParkingPass>
      config={parkingPageConfig}
      data={parkingData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["pass_number", "holder_name", "vehicle_info", "license_plate", "event_name"]}
      onAction={handleAction}
    />
  );
}
