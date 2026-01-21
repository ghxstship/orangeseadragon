export type CalendarViewType = "day" | "week" | "month" | "timeline" | "agenda";

export interface CalendarEventConfig {
  titleField: string;
  startField: string;
  endField: string;
  colorField?: string;
  allDayField?: string;
  descriptionField?: string;
  locationField?: string;
}

export interface CalendarResourceConfig {
  idField: string;
  titleField: string;
  groupField?: string;
}

export interface CalendarPageConfig {
  id: string;
  title: string;
  description?: string;
  views: CalendarViewType[];
  defaultView?: CalendarViewType;
  event: CalendarEventConfig;
  resources?: CalendarResourceConfig;
  toolbar?: {
    navigation?: boolean;
    viewSwitcher?: boolean;
    dateRange?: boolean;
    filters?: {
      field: string;
      label: string;
      options: { label: string; value: string }[];
    }[];
  };
  actions?: {
    create?: { label?: string; enabled?: boolean };
    edit?: { enabled?: boolean };
    delete?: { enabled?: boolean };
    dragDrop?: { enabled?: boolean };
    resize?: { enabled?: boolean };
  };
  display?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    showWeekNumbers?: boolean;
    slotDuration?: number;
    slotMinTime?: string;
    slotMaxTime?: string;
  };
}
