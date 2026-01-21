"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { errorTrackingPageConfig } from "@/config/pages/error-tracking";

interface ErrorEvent {
  id: string;
  title: string;
  message: string;
  type: string;
  status: "new" | "investigating" | "resolved" | "ignored";
  occurrences: number;
  users: number;
  first_seen: string;
  last_seen: string;
  environment: string;
}

export default function ErrorTrackingPage() {
  const [errorEventsData, setErrorEventsData] = React.useState<ErrorEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchErrorEvents() {
      try {
        const response = await fetch("/api/v1/error-tracking");
        if (response.ok) {
          const result = await response.json();
          setErrorEventsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch error events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchErrorEvents();
  }, []);

  const stats = React.useMemo(() => {
    const newErrors = errorEventsData.filter((e) => e.status === "new").length;
    const totalOccurrences = errorEventsData.reduce((acc, e) => acc + (e.occurrences || 0), 0);
    const affectedUsers = errorEventsData.reduce((acc, e) => acc + (e.users || 0), 0);

    return [
      { id: "total", label: "Total Errors", value: errorEventsData.length },
      { id: "new", label: "New", value: newErrors },
      { id: "occurrences", label: "Occurrences", value: totalOccurrences },
      { id: "users", label: "Users Affected", value: affectedUsers },
    ];
  }, [errorEventsData]);

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
    <DataViewPage<ErrorEvent>
      config={errorTrackingPageConfig}
      data={errorEventsData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["title", "message", "type"]}
      onAction={handleAction}
    />
  );
}
