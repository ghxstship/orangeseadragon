"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { assetsMaintenancePageConfig } from "@/config/pages/assets-maintenance";

interface MaintenanceItem {
  id: string;
  name: string;
  type: string;
  status: string;
  priority: string;
  scheduled_date: string;
  assignee: string;
}

export default function AssetsMaintenancePage() {
  const [maintenanceItems, setMaintenanceItems] = React.useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMaintenance() {
      try {
        const response = await fetch("/api/v1/assets/maintenance");
        if (response.ok) {
          const result = await response.json();
          setMaintenanceItems(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch maintenance:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMaintenance();
  }, []);

  const stats = React.useMemo(() => {
    const inProgressCount = maintenanceItems.filter((i) => i.status === "in_progress").length;
    const scheduledCount = maintenanceItems.filter((i) => i.status === "scheduled").length;
    const completedCount = maintenanceItems.filter((i) => i.status === "completed").length;
    return [
      { id: "total", label: "Total", value: maintenanceItems.length },
      { id: "inProgress", label: "In Progress", value: inProgressCount },
      { id: "scheduled", label: "Scheduled", value: scheduledCount },
      { id: "completed", label: "Completed", value: completedCount },
    ];
  }, [maintenanceItems]);

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
    <DataViewPage<MaintenanceItem>
      config={assetsMaintenancePageConfig}
      data={maintenanceItems}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["name", "assignee"]}
      onAction={handleAction}
    />
  );
}
