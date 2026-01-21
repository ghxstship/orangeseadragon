export type MediaViewType = "grid" | "list" | "masonry";

export interface UploadConfig {
  enabled: boolean;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  dragDrop?: boolean;
}

export interface MediaItemConfig {
  idField: string;
  nameField: string;
  urlField: string;
  thumbnailField?: string;
  typeField?: string;
  sizeField?: string;
  createdAtField?: string;
  folderField?: string;
}

export interface MediaPageConfig {
  id: string;
  title: string;
  description?: string;
  views: MediaViewType[];
  defaultView?: MediaViewType;
  item: MediaItemConfig;
  upload?: UploadConfig;
  toolbar?: {
    search?: { enabled: boolean; placeholder?: string };
    filters?: {
      field: string;
      label: string;
      options: { label: string; value: string }[];
    }[];
    sort?: {
      enabled: boolean;
      options: { label: string; field: string; direction: "asc" | "desc" }[];
    };
  };
  folders?: {
    enabled: boolean;
    createEnabled?: boolean;
  };
  actions?: {
    download?: boolean;
    delete?: boolean;
    rename?: boolean;
    move?: boolean;
    preview?: boolean;
    share?: boolean;
  };
  display?: {
    columns?: number;
    showFileInfo?: boolean;
    thumbnailSize?: "small" | "medium" | "large";
  };
}
