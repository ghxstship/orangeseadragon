export type DetailSectionType = 
  | "info"
  | "description"
  | "metadata"
  | "related-list"
  | "activity"
  | "comments"
  | "attachments"
  | "custom";

export interface InfoFieldConfig {
  field: string;
  label: string;
  format?: "text" | "date" | "datetime" | "currency" | "number" | "badge" | "link" | "email" | "phone";
  icon?: string;
  copyable?: boolean;
}

export interface InfoSectionConfig {
  type: "info";
  id: string;
  title: string;
  fields: InfoFieldConfig[];
  columns?: 1 | 2 | 3;
}

export interface DescriptionSectionConfig {
  type: "description";
  id: string;
  title: string;
  field: string;
  format?: "text" | "markdown" | "html";
}

export interface MetadataSectionConfig {
  type: "metadata";
  id: string;
  title: string;
  fields: { field: string; label: string }[];
}

export interface RelatedListSectionConfig {
  type: "related-list";
  id: string;
  title: string;
  entity: string;
  foreignKey: string;
  columns: { field: string; label: string; format?: string }[];
  limit?: number;
  actions?: { id: string; label: string }[];
}

export interface ActivitySectionConfig {
  type: "activity";
  id: string;
  title: string;
  dataSource: string;
  limit?: number;
}

export interface CommentsSectionConfig {
  type: "comments";
  id: string;
  title: string;
  allowAdd?: boolean;
}

export interface AttachmentsSectionConfig {
  type: "attachments";
  id: string;
  title: string;
  allowUpload?: boolean;
  accept?: string[];
}

export type DetailSectionConfig =
  | InfoSectionConfig
  | DescriptionSectionConfig
  | MetadataSectionConfig
  | RelatedListSectionConfig
  | ActivitySectionConfig
  | CommentsSectionConfig
  | AttachmentsSectionConfig;

export interface DetailPageConfig {
  id: string;
  title: string;
  titleField: string;
  subtitleField?: string;
  badgeField?: string;
  avatarField?: string;
  sections: DetailSectionConfig[];
  tabs?: {
    id: string;
    label: string;
    sectionIds: string[];
  }[];
  actions?: {
    id: string;
    label: string;
    icon?: string;
    variant?: "default" | "destructive" | "outline";
    primary?: boolean;
  }[];
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
}

export interface EditPageConfig {
  id: string;
  title: string;
  entity: string;
  sections: {
    id: string;
    title: string;
    description?: string;
    fields: {
      id: string;
      label: string;
      type: string;
      required?: boolean;
      placeholder?: string;
      options?: { label: string; value: string }[];
    }[];
  }[];
  actions?: {
    save?: { label?: string };
    cancel?: { label?: string; href?: string };
    delete?: { label?: string; confirm?: string };
  };
}
