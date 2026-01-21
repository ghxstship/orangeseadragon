export interface BoardColumnConfig {
  id: string;
  title: string;
  statusValue: string;
  color?: string;
  limit?: number;
}

export interface BoardCardConfig {
  titleField: string;
  subtitleField?: string;
  descriptionField?: string;
  badgeField?: string;
  priorityField?: string;
  avatarField?: string;
  metaFields?: string[];
  colorField?: string;
}

export interface BoardSwimlaneConfig {
  field: string;
  label: string;
  collapsed?: boolean;
}

export interface BoardPageConfig {
  id: string;
  title: string;
  description?: string;
  statusField: string;
  columns: BoardColumnConfig[];
  card: BoardCardConfig;
  swimlanes?: BoardSwimlaneConfig;
  toolbar?: {
    search?: { enabled: boolean; placeholder?: string; fields?: string[] };
    filters?: {
      field: string;
      label: string;
      options: { label: string; value: string }[];
    }[];
    groupBy?: { enabled: boolean; options: { label: string; value: string }[] };
  };
  actions?: {
    create?: { label?: string; enabled?: boolean };
    dragDrop?: { enabled?: boolean; crossColumn?: boolean };
    quickAdd?: { enabled?: boolean; columns?: string[] };
  };
  primaryAction?: {
    id: string;
    label: string;
    icon?: string;
  };
  cardActions?: {
    id: string;
    label: string;
    icon?: string;
    variant?: "default" | "destructive";
  }[];
}
