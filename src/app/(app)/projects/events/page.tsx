"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { eventsPageConfig } from "@/config/pages/events";

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  phase: string;
  start_date: string;
  end_date: string;
  venue?: { name: string } | null;
  capacity: number;
  expected_attendance: number;
  tickets_sold: number;
}

export default function EventsPage() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/v1/events");
        if (response.ok) {
          const result = await response.json();
          setEvents(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const stats = React.useMemo(() => {
    const upcoming = events.filter((e) => new Date(e.start_date) > new Date()).length;
    const active = events.filter((e) => e.phase === "active" || e.phase === "live").length;
    const totalCapacity = events.reduce((acc, e) => acc + (e.capacity || 0), 0);

    return [
      { id: "total", label: "Total Events", value: events.length },
      { id: "upcoming", label: "Upcoming", value: upcoming },
      { id: "active", label: "Active Now", value: active },
      { id: "capacity", label: "Total Capacity", value: totalCapacity.toLocaleString() },
    ];
  }, [events]);

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
    <DataViewPage<Event>
      config={eventsPageConfig}
      data={events}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
