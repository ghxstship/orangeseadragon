"use client";

import * as React from "react";
import { CalendarPage } from "@/components/common";
import { workCalendarSchedulePageConfig } from "@/config/pages/work-calendar-schedule";

interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
}

const scheduleEvents: ScheduleEvent[] = [
  { id: "1", title: "Team Standup", startTime: "2024-06-19T09:00:00", endTime: "2024-06-19T09:30:00", location: "Conference Room A", color: "#3b82f6" },
  { id: "2", title: "Client Presentation", startTime: "2024-06-19T10:00:00", endTime: "2024-06-19T11:30:00", location: "Main Hall", color: "#22c55e" },
  { id: "3", title: "Lunch Break", startTime: "2024-06-19T12:00:00", endTime: "2024-06-19T13:00:00", location: "", color: "#9ca3af" },
  { id: "4", title: "Vendor Meeting", startTime: "2024-06-19T14:00:00", endTime: "2024-06-19T15:00:00", location: "Virtual", color: "#a855f7" },
  { id: "5", title: "Site Inspection", startTime: "2024-06-19T16:00:00", endTime: "2024-06-19T17:30:00", location: "Festival Grounds", color: "#f97316" },
];

export default function CalendarSchedulePage() {
  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Calendar action:", actionId, payload);
  }, []);

  const handleEventClick = React.useCallback((event: ScheduleEvent) => {
    console.log("Event clicked:", event);
  }, []);

  return (
    <CalendarPage
      config={workCalendarSchedulePageConfig}
      events={scheduleEvents}
      getEventId={(event) => event.id}
      onAction={handleAction}
      onEventClick={handleEventClick}
    />
  );
}
