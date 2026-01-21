"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { accountActivityPageConfig } from "@/config/pages/account-activity";

interface ActivityItem {
  id: string;
  action: string;
  item: string;
  time: string;
  type: string;
}

export default function AccountHistoryActivityPage() {
  const [activitiesData, setActivitiesData] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/v1/account/history/activity");
        if (response.ok) {
          const result = await response.json();
          setActivitiesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, []);

  const stats = React.useMemo(() => {
    const eventCount = activitiesData.filter((a) => a.type === "event").length;
    const settingsCount = activitiesData.filter((a) => a.type === "settings").length;
    return [
      { id: "total", label: "Total Activities", value: activitiesData.length },
      { id: "events", label: "Events", value: eventCount },
      { id: "settings", label: "Settings Changes", value: settingsCount },
    ];
  }, [activitiesData]);

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
    <DataViewPage<ActivityItem>
      config={accountActivityPageConfig}
      data={activitiesData}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["action", "item"]}
      onAction={handleAction}
    />
  );
}
