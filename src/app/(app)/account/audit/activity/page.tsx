"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { activityPageConfig } from "@/config/pages/activity";

interface ActivityItem {
  id: string;
  type: "task" | "document" | "comment" | "event" | "team" | "finance" | "asset" | "settings";
  action: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: {
    project?: string;
    link?: string;
  };
}

export default function ActivityPage() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/v1/activity");
        if (response.ok) {
          const result = await response.json();
          setActivities(result.data || []);
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
    const todayCount = activities.filter((a) => {
      const date = new Date(a.timestamp);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;
    const activeUsers = new Set(activities.map((a) => a.user)).size;
    const tasksCompleted = activities.filter((a) => a.type === "task" && a.action === "completed").length;

    return [
      { id: "today", label: "Today", value: todayCount },
      { id: "week", label: "This Week", value: activities.length },
      { id: "users", label: "Active Users", value: activeUsers },
      { id: "tasks", label: "Tasks Completed", value: tasksCompleted },
    ];
  }, [activities]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "refresh":
          console.log("Refresh activity feed");
          break;
        case "view":
          console.log("View activity details", payload);
          break;
        case "go-to":
          console.log("Go to item", payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<ActivityItem>
      config={activityPageConfig}
      data={activities}
      stats={stats}
      getRowId={(activity) => activity.id}
      searchFields={["user", "description", "action"]}
      onAction={handleAction}
    />
  );
}
