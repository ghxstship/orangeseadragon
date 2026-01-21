"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { accessControlPageConfig } from "@/config/pages/access-control";
import { useRouter } from "next/navigation";

interface AccessPoint {
  id: string;
  name: string;
  location: string;
  event_name: string;
  type: "entry" | "exit" | "checkpoint" | "restricted";
  status: "active" | "inactive" | "alert";
  scans_today: number;
  denied_today: number;
  last_scan?: string;
  allowed_credentials: string[];
}

export default function AccessControlPage() {
  const router = useRouter();
  const [accessPoints, setAccessPoints] = React.useState<AccessPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAccessPoints() {
      try {
        const response = await fetch("/api/v1/access-control");
        if (response.ok) {
          const result = await response.json();
          setAccessPoints(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch access points:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAccessPoints();
  }, []);

  const stats = React.useMemo(() => {
    const totalScans = accessPoints.reduce((acc, a) => acc + (a.scans_today || 0), 0);
    const totalDenied = accessPoints.reduce((acc, a) => acc + (a.denied_today || 0), 0);
    const activePoints = accessPoints.filter((a) => a.status === "active").length;

    return [
      { id: "total", label: "Access Points", value: accessPoints.length },
      { id: "active", label: "Active", value: activePoints },
      { id: "scans", label: "Scans Today", value: totalScans },
      { id: "denied", label: "Denied Today", value: totalDenied },
    ];
  }, [accessPoints]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "create":
          console.log("Create new access point");
          break;
        case "view":
          console.log("View access point details", payload);
          break;
        case "scan-log":
          console.log("View scan log", payload);
          break;
        case "permissions":
          console.log("Edit permissions", payload);
          break;
        case "toggle-status":
          console.log("Toggle status", payload);
          break;
        case "delete":
          console.log("Delete access point", payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    []
  );

  const handleRowClick = React.useCallback(
    (point: AccessPoint) => {
      router.push(`/access-control/${point.id}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<AccessPoint>
      config={accessControlPageConfig}
      data={accessPoints}
      stats={stats}
      getRowId={(point) => point.id}
      searchFields={["name", "location", "event_name"]}
      onAction={handleAction}
      onRowClick={handleRowClick}
    />
  );
}
