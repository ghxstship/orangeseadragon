export type BuilderType = "report" | "workflow" | "query" | "form" | "dashboard";

export interface ToolConfig {
  id: string;
  label: string;
  icon: string;
  category?: string;
  description?: string;
}

export interface SchemaItemConfig {
  id: string;
  label: string;
  type: string;
  children?: SchemaItemConfig[];
}

export interface CanvasConfig {
  type: BuilderType;
  gridEnabled?: boolean;
  snapToGrid?: boolean;
  zoomEnabled?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export interface BuilderPageConfig {
  id: string;
  title: string;
  description?: string;
  builderType: BuilderType;
  sidebar?: {
    tools?: ToolConfig[];
    schema?: SchemaItemConfig[];
    savedItems?: {
      enabled: boolean;
      label: string;
    };
  };
  canvas: CanvasConfig;
  toolbar?: {
    undo?: boolean;
    redo?: boolean;
    preview?: boolean;
    save?: boolean;
    export?: boolean;
    settings?: boolean;
  };
  properties?: {
    enabled: boolean;
    position: "right" | "bottom";
  };
  actions?: {
    save?: { label?: string };
    saveAs?: { label?: string };
    run?: { label?: string };
    preview?: { label?: string };
    export?: { label?: string; formats?: string[] };
  };
}
