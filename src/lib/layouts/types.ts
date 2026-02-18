/**
 * LAYOUT TYPES
 * 
 * Type definitions for the unified layout system.
 * Defines additional types for non-entity layouts (Dashboard, Wizard, etc.)
 */

// ============================================================================
// RE-EXPORT SCHEMA TYPES (SSOT for entity layouts)
// ============================================================================

export type {
  EntitySchema,
  ListLayoutConfig,
  DetailLayoutConfig,
  FormLayoutConfig,
  SubpageDefinition,
  DetailTabDefinition,
  FormSectionDefinition,
  FieldDefinition,
  TableViewConfig,
  KanbanViewConfig,
  CalendarViewConfig,
  ActionDefinition,
  QuickStatDefinition,
  SidebarConfig,
  SidebarSectionDefinition,
  OverviewConfig,
} from '@/lib/schema-engine/types';


// ============================================================================
// LAYOUT TYPE ENUM
// ============================================================================

export type LayoutType =
  | 'list'
  | 'detail'
  | 'form'
  | 'split'
  | 'dashboard'
  | 'workspace'
  | 'settings'
  | 'wizard'
  | 'canvas'
  | 'document'
  | 'empty'
  | 'error';

// ============================================================================
// NON-ENTITY LAYOUT TYPES
// ============================================================================

// Common types used across layouts
export interface ActionConfig {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  shortcut?: string;
  disabled?: boolean;
}

export interface BadgeConfig {
  label: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

// Dashboard Layout
export type WidgetType = 
  | 'stat' 
  | 'chart' 
  | 'list' 
  | 'table' 
  | 'calendar' 
  | 'activity' 
  | 'tasks' 
  | 'quick-actions'
  | 'custom';

export interface WidgetConfig {
  key: string;
  title: string;
  type: WidgetType;
  size: 'small' | 'medium' | 'large' | 'full';
  position?: { row: number; col: number };
  refreshInterval?: number;
  config?: Record<string, unknown>;
}

export interface DashboardLayoutConfig {
  title: string;
  description?: string;
  widgets: WidgetConfig[];
  layout?: {
    columns?: number;
    gap?: number;
    responsive?: boolean;
  };
  personalization?: {
    enabled: boolean;
    allowReorder?: boolean;
    allowResize?: boolean;
    allowHide?: boolean;
  };
  refresh?: {
    enabled: boolean;
    intervalMs?: number;
  };
  dateRange?: {
    enabled: boolean;
    default?: 'today' | 'week' | 'month' | 'quarter' | 'year';
    presets?: string[];
  };
}

// Split Layout
export interface SplitLayoutConfig {
  master: {
    title: string;
    width: { default: number; min: number; max: number };
    collapsible?: boolean;
    search?: { enabled: boolean; placeholder?: string };
    empty?: { title: string; description: string };
  };
  detail: {
    empty?: { title: string; description: string };
    header?: { showBackButton?: boolean; showActions?: boolean };
  };
  keyboard?: { enabled: boolean };
}

// Workspace Layout
export interface WorkspaceTab {
  key: string;
  label: string;
  icon?: string;
  badge?: { show: boolean; countField?: string };
}

export interface WorkspaceLayoutConfig {
  title: string;
  subtitle?: string;
  icon?: string;
  tabs: WorkspaceTab[];
  defaultTab?: string;
  tabPosition?: 'top' | 'left';
  header?: {
    showBackButton?: boolean;
    showFavorite?: boolean;
    showShare?: boolean;
    showSettings?: boolean;
    showPresence?: boolean;
  };
  sidebar?: {
    enabled: boolean;
    position: 'left' | 'right';
    width?: number;
    defaultOpen?: boolean;
  };
}

// Settings Layout
export interface SettingsSectionConfig {
  key: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface SettingsLayoutConfig {
  title: string;
  description?: string;
  sections: SettingsSectionConfig[];
  defaultSection?: string;
  navigation?: {
    position: 'top' | 'left';
    sticky?: boolean;
  };
  actions?: {
    save?: ActionConfig;
    reset?: ActionConfig;
  };
}

// Wizard Layout
export interface WizardStepConfig {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  optional?: boolean;
}

export interface WizardLayoutConfig {
  title: string;
  description?: string;
  steps: WizardStepConfig[];
  navigation?: {
    showStepNumbers?: boolean;
    showProgress?: boolean;
    allowSkip?: boolean;
    allowBack?: boolean;
  };
  actions?: {
    next?: string;
    back?: string;
    skip?: string;
    finish?: string;
    cancel?: string;
  };
}

// Canvas Layout
export interface CanvasLayoutConfig {
  title: string;
  canvas?: {
    width?: number | 'auto';
    height?: number | 'auto';
    minZoom?: number;
    maxZoom?: number;
    gridEnabled?: boolean;
    gridSize?: number;
    snapToGrid?: boolean;
  };
  toolbar?: {
    position: 'top' | 'left' | 'bottom';
    tools?: string[];
  };
  sidebar?: {
    enabled: boolean;
    position: 'left' | 'right';
    width?: number;
  };
}

// Document Layout
export interface DocumentLayoutConfig {
  title: string;
  editor?: {
    type: 'richtext' | 'markdown' | 'code';
    toolbar?: string[];
    autosave?: boolean;
    autosaveInterval?: number;
  };
  sidebar?: {
    enabled: boolean;
    position: 'left' | 'right';
    width?: number;
    sections?: Array<'outline' | 'comments' | 'history' | 'attachments'>;
  };
  collaboration?: {
    enabled: boolean;
    showPresence?: boolean;
    showCursors?: boolean;
  };
}

// Empty Layout
export interface EmptyLayoutConfig {
  title: string;
  description: string;
  icon?: string;
  illustration?: string;
  actions?: ActionConfig[];
  suggestions?: Array<{
    title: string;
    description: string;
    action: ActionConfig;
  }>;
}

// Error Layout
export interface ErrorLayoutConfig {
  code?: number | string;
  title: string;
  description: string;
  icon?: string;
  illustration?: string;
  actions?: ActionConfig[];
  showDetails?: boolean;
  showStackTrace?: boolean;
}
