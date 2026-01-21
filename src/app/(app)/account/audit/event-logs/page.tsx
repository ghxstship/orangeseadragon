"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { eventLogsPageConfig } from "@/config/pages/event-logs";

interface EventLog {
  id: string;
  event_type: string;
  resource: string;
  resource_id: string;
  actor: string;
  actor_type: "user" | "system" | "api";
  timestamp: string;
  metadata?: Record<string, string>;
}

export default function EventLogsPage() {
  const [eventLogsData, setEventLogsData] = React.useState<EventLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEventLogs() {
      try {
        const response = await fetch("/api/v1/event-logs");
        if (response.ok) {
          const result = await response.json();
          setEventLogsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch event logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEventLogs();
  }, []);

  const stats = React.useMemo(() => {
    const userEvents = eventLogsData.filter((l) => l.actor_type === "user").length;
    const systemEvents = eventLogsData.filter((l) => l.actor_type === "system").length;
    const apiEvents = eventLogsData.filter((l) => l.actor_type === "api").length;

    return [
      { id: "total", label: "Total Events", value: eventLogsData.length },
      { id: "user", label: "User Events", value: userEvents },
      { id: "system", label: "System Events", value: systemEvents },
      { id: "api", label: "API Events", value: apiEvents },
    ];
  }, [eventLogsData]);

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
    <DataViewPage<EventLog>
      config={eventLogsPageConfig}
      data={eventLogsData}
      stats={stats}
      getRowId={(l) => l.id}
      searchFields={["event_type", "resource", "actor"]}
      onAction={handleAction}
    />
  );
}
