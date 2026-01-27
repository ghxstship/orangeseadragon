/**
 * UNIFIED LAYOUT SYSTEM
 * 
 * All layouts accept EntitySchema directly as their configuration source.
 * This ensures SSOT - no separate config objects needed.
 */

// Entity Layouts (accept EntitySchema)
export { ListLayout } from './ListLayout';
export { DetailLayout } from './DetailLayout';
export { FormLayout } from './FormLayout';

// Non-Entity Layouts (use their own config types)
export { DashboardLayout } from './DashboardLayout';
export { SplitLayout } from './SplitLayout';
export { WorkspaceLayout } from './WorkspaceLayout';
export { SettingsLayout } from './SettingsLayout';
export { WizardLayout } from './WizardLayout';
export { CanvasLayout } from './CanvasLayout';
export { DocumentLayout } from './DocumentLayout';
export { EmptyLayout } from './EmptyLayout';
export { ErrorLayout } from './ErrorLayout';

// Types - explicit exports to avoid circular dependency issues
export type {
  LayoutType,
  ActionConfig,
  BadgeConfig,
  WidgetType,
  WidgetConfig,
  DashboardLayoutConfig,
  SplitLayoutConfig,
  WorkspaceTab,
  TabConfig,
  WorkspaceLayoutConfig,
  SettingsSectionConfig,
  SettingsLayoutConfig,
  WizardStepConfig,
  WizardLayoutConfig,
  CanvasLayoutConfig,
  DocumentLayoutConfig,
  EmptyLayoutConfig,
  ErrorLayoutConfig,
} from './types';

// Re-export props types
export type { ListLayoutProps } from './ListLayout';
export type { DetailLayoutProps } from './DetailLayout';
export type { FormLayoutProps } from './FormLayout';
export type { DashboardLayoutProps } from './DashboardLayout';
export type { SplitLayoutProps, SplitLayoutItem } from './SplitLayout';
export type { WorkspaceLayoutProps, WorkspaceCollaborator } from './WorkspaceLayout';
export type { SettingsLayoutProps } from './SettingsLayout';
export type { WizardLayoutProps } from './WizardLayout';
export type { CanvasLayoutProps } from './CanvasLayout';
export type { DocumentLayoutProps, DocumentCollaborator } from './DocumentLayout';
export type { EmptyLayoutProps } from './EmptyLayout';
export type { ErrorLayoutProps } from './ErrorLayout';
