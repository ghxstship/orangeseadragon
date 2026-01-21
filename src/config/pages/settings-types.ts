export type FieldType = 
  | "text" 
  | "email" 
  | "password" 
  | "tel" 
  | "url"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "switch"
  | "toggle"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "color"
  | "date"
  | "time"
  | "datetime";

export interface FieldOption {
  label: string;
  value: string;
  description?: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string | number | boolean | string[];
  options?: FieldOption[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  accept?: string;
  maxSize?: number;
  columns?: 1 | 2;
}

export interface SectionConfig {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fields: FieldConfig[];
  columns?: 1 | 2;
}

export interface SettingsPageConfig {
  id: string;
  title: string;
  description?: string;
  sections: SectionConfig[];
  actions?: {
    save?: { label?: string; enabled?: boolean };
    cancel?: { label?: string; enabled?: boolean };
    reset?: { label?: string; enabled?: boolean };
  };
  layout?: "single" | "sidebar" | "tabs";
  autoSave?: boolean;
}
