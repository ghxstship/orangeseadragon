import type { CalendarPageConfig } from "./calendar-types";

export const workCalendarSchedulePageConfig: CalendarPageConfig = {
  id: "work-calendar-schedule",
  title: "Schedule",
  description: "Manage your daily and weekly schedule",

  views: ["month", "week", "day", "agenda"],
  defaultView: "week",

  event: {
    titleField: "title",
    startField: "startTime",
    endField: "endTime",
    colorField: "color",
    locationField: "location",
  },

  toolbar: {
    navigation: true,
    viewSwitcher: true,
    dateRange: false,
  },

  actions: {
    create: { label: "Add Event", enabled: true },
    edit: { enabled: true },
    delete: { enabled: true },
    dragDrop: { enabled: true },
  },

  display: {
    weekStartsOn: 1,
    showWeekNumbers: false,
    slotDuration: 30,
    slotMinTime: "08:00",
    slotMaxTime: "20:00",
  },
};
