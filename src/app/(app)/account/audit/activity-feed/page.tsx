"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { activityFeedPageConfig } from "@/config/pages/activity-feed";

interface ActivityItem {
  id: string;
  type: "event" | "contact" | "invoice" | "vendor" | "comment" | "notification";
  action: string;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export default function ActivityFeedPage() {
  const [activityFeedData, setActivityFeedData] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActivityFeed() {
      try {
        const response = await fetch("/api/v1/activity-feed");
        if (response.ok) {
          const result = await response.json();
          setActivityFeedData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch activity feed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActivityFeed();
  }, []);

  const stats = React.useMemo(() => {
    const eventCount = activityFeedData.filter((a) => a.type === "event").length;
    const invoiceCount = activityFeedData.filter((a) => a.type === "invoice").length;
    const uniqueActors = new Set(activityFeedData.map((a) => a.actor)).size;

    return [
      { id: "total", label: "Today's Activity", value: activityFeedData.length },
      { id: "events", label: "Events", value: eventCount },
      { id: "financial", label: "Financial", value: invoiceCount },
      { id: "users", label: "Active Users", value: uniqueActors },
    ];
  }, [activityFeedData]);

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
      config={activityFeedPageConfig}
      data={activityFeedData}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["description", "actor", "action"]}
      onAction={handleAction}
    />
  );
}
