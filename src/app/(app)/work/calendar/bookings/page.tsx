"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { calendarBookingsPageConfig } from "@/config/pages/calendar-bookings";

interface Booking {
  id: string;
  title: string;
  resource: string;
  date: string;
  time: string;
  booked_by: string;
  status: "confirmed" | "pending" | "cancelled";
  attendees: number;
}

export default function CalendarBookingsPage() {
  const [bookingsData, setBookingsData] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/v1/work/calendar/bookings");
        if (response.ok) {
          const result = await response.json();
          setBookingsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const stats = React.useMemo(() => {
    const confirmed = bookingsData.filter((b) => b.status === "confirmed").length;
    const pending = bookingsData.filter((b) => b.status === "pending").length;
    const totalAttendees = bookingsData.reduce((sum, b) => sum + (b.attendees || 0), 0);
    return [
      { id: "total", label: "Total Bookings", value: bookingsData.length },
      { id: "confirmed", label: "Confirmed", value: confirmed },
      { id: "pending", label: "Pending", value: pending },
      { id: "attendees", label: "Total Attendees", value: totalAttendees },
    ];
  }, [bookingsData]);

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
    <DataViewPage<Booking>
      config={calendarBookingsPageConfig}
      data={bookingsData}
      stats={stats}
      getRowId={(b) => b.id}
      searchFields={["title", "resource", "booked_by"]}
      onAction={handleAction}
    />
  );
}
