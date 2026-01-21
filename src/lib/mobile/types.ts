/**
 * Mobile UI Types (COMPVSS)
 * Type definitions for mobile-optimized components and views
 */

export type MobileViewType = 
  | "list" 
  | "grid" 
  | "card" 
  | "detail" 
  | "form" 
  | "dashboard"
  | "calendar"
  | "map"
  | "chat";

export type MobileNavigationType = 
  | "tabs" 
  | "drawer" 
  | "stack" 
  | "modal";

export type GestureType = 
  | "tap" 
  | "longPress" 
  | "swipe" 
  | "pinch" 
  | "pan"
  | "doubleTap";

export interface MobileScreen {
  id: string;
  name: string;
  path: string;
  icon?: string;
  viewType: MobileViewType;
  requiresAuth: boolean;
  offlineSupport: boolean;
  cacheStrategy?: CacheStrategy;
}

export interface MobileNavigation {
  type: MobileNavigationType;
  items: MobileNavigationItem[];
  position?: "top" | "bottom";
}

export interface MobileNavigationItem {
  id: string;
  label: string;
  icon: string;
  screen: string;
  badge?: number | string;
  children?: MobileNavigationItem[];
}

export interface CacheStrategy {
  type: "network-first" | "cache-first" | "stale-while-revalidate";
  maxAge: number;
  maxItems?: number;
}

export interface MobileListConfig {
  itemHeight: number | "auto";
  pullToRefresh: boolean;
  infiniteScroll: boolean;
  swipeActions?: SwipeAction[];
  emptyState: EmptyState;
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
}

export interface SwipeAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  position: "left" | "right";
  destructive?: boolean;
  handler: string;
}

export interface EmptyState {
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    handler: string;
  };
}

export interface MobileFormConfig {
  sections: FormSection[];
  submitLabel: string;
  cancelLabel?: string;
  validation: "onChange" | "onBlur" | "onSubmit";
  autoSave?: boolean;
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: FieldValidation[];
  options?: FieldOption[];
  config?: Record<string, unknown>;
}

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "phone"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "switch"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "image"
  | "signature"
  | "location"
  | "rating"
  | "slider"
  | "color";

export interface FieldValidation {
  type: "required" | "email" | "phone" | "url" | "min" | "max" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: unknown;
  message: string;
}

export interface FieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface MobileCardConfig {
  layout: "vertical" | "horizontal";
  image?: CardImage;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: CardMetadata[];
  actions?: CardAction[];
  swipeable?: boolean;
}

export interface CardImage {
  field: string;
  aspectRatio: "1:1" | "4:3" | "16:9" | "3:2";
  placeholder?: string;
}

export interface CardMetadata {
  icon?: string;
  label: string;
  field: string;
  format?: string;
}

export interface CardAction {
  id: string;
  label: string;
  icon?: string;
  type: "primary" | "secondary" | "destructive";
  handler: string;
}

export interface MobileCalendarConfig {
  view: "month" | "week" | "day" | "agenda";
  startField: string;
  endField: string;
  titleField: string;
  colorField?: string;
  allowCreate: boolean;
  allowEdit: boolean;
}

export interface MobileMapConfig {
  latitudeField: string;
  longitudeField: string;
  titleField: string;
  descriptionField?: string;
  clusterMarkers: boolean;
  showUserLocation: boolean;
  defaultZoom: number;
}

export interface MobileChatConfig {
  messageField: string;
  senderField: string;
  timestampField: string;
  attachmentField?: string;
  typing: boolean;
  readReceipts: boolean;
}

export interface OfflineConfig {
  enabled: boolean;
  syncStrategy: "manual" | "auto" | "background";
  conflictResolution: "server-wins" | "client-wins" | "manual";
  maxOfflineItems: number;
  syncInterval: number;
}

export interface PushNotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  defaultSound: boolean;
  defaultVibrate: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: "none" | "min" | "low" | "default" | "high" | "max";
  sound?: string;
  vibration?: number[];
}

export interface BiometricConfig {
  enabled: boolean;
  types: ("fingerprint" | "face" | "iris")[];
  fallbackToPin: boolean;
  timeout: number;
}

export interface MobileAppConfig {
  name: string;
  version: string;
  buildNumber: number;
  bundleId: string;
  navigation: MobileNavigation;
  screens: MobileScreen[];
  offline: OfflineConfig;
  pushNotifications: PushNotificationConfig;
  biometric: BiometricConfig;
  deepLinking: DeepLinkConfig;
  analytics: AnalyticsConfig;
}

export interface DeepLinkConfig {
  scheme: string;
  host: string;
  routes: DeepLinkRoute[];
}

export interface DeepLinkRoute {
  path: string;
  screen: string;
  params?: string[];
}

export interface AnalyticsConfig {
  enabled: boolean;
  providers: ("firebase" | "mixpanel" | "amplitude" | "custom")[];
  trackScreenViews: boolean;
  trackUserActions: boolean;
  anonymizeIp: boolean;
}
