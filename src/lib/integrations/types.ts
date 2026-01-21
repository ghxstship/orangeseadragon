import type {
  IntegrationCategory,
  IntegrationStatus,
  IntegrationTier,
  SyncDirection,
  SyncStatus,
} from "@/lib/enums";

// ============================================================================
// INTEGRATION CONNECTOR TYPES
// ============================================================================

export interface IntegrationConnector {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: IntegrationCategory;
  tier: IntegrationTier;
  logoUrl: string;
  websiteUrl: string;
  docsUrl: string;
  
  auth: AuthConfig;
  sync: SyncConfig;
  webhooks: WebhookConfig[];
  fieldMappings: FieldMapping[];
  
  features: string[];
  limitations?: string[];
}

export interface AuthConfig {
  type: "oauth2" | "api_key" | "basic" | "saml" | "scim";
  oauth2?: OAuth2Config;
  apiKey?: ApiKeyConfig;
  saml?: SAMLConfig;
  scim?: SCIMConfig;
}

export interface OAuth2Config {
  authUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  scopes: string[];
  pkce?: boolean;
}

export interface ApiKeyConfig {
  headerName: string;
  prefix?: string;
  location: "header" | "query";
}

export interface SAMLConfig {
  entityId: string;
  acsUrl: string;
  sloUrl?: string;
  metadataUrl?: string;
}

export interface SCIMConfig {
  baseUrl: string;
  version: "1.1" | "2.0";
  features: ("users" | "groups" | "provisioning" | "deprovisioning")[];
}

export interface SyncConfig {
  schedule?: string;
  direction: SyncDirection;
  entities: EntitySyncConfig[];
  rateLimit?: RateLimitConfig;
}

export interface EntitySyncConfig {
  source: string;
  target: string;
  direction: SyncDirection;
  transform?: TransformConfig;
  filters?: FilterConfig[];
}

export interface RateLimitConfig {
  requests: number;
  period: "second" | "minute" | "hour" | "day";
  burstLimit?: number;
}

export interface WebhookConfig {
  event: string;
  endpoint: string;
  secret?: boolean;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number[];
}

export interface FieldMapping {
  source: string;
  target: string;
  transform?: TransformConfig;
  default?: unknown;
  required?: boolean;
}

export interface TransformConfig {
  type: "format" | "map" | "concat" | "split" | "custom";
  pattern?: string;
  values?: Record<string, unknown>;
  fields?: string[];
  separator?: string;
  delimiter?: string;
  index?: number;
  function?: string;
}

export interface FilterConfig {
  field: string;
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "contains";
  value: unknown;
}

// ============================================================================
// INTEGRATION INSTANCE (User's connected integration)
// ============================================================================

export interface IntegrationInstance {
  id: string;
  organizationId: string;
  connectorId: string;
  name: string;
  status: IntegrationStatus;
  
  credentials: EncryptedCredentials;
  settings: IntegrationSettings;
  
  lastSyncAt?: Date;
  lastSyncStatus?: SyncStatus;
  lastError?: string;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface EncryptedCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  expiresAt?: Date;
  metadata?: Record<string, string>;
}

export interface IntegrationSettings {
  enabled: boolean;
  syncSchedule?: string;
  syncDirection?: SyncDirection;
  entityMappings?: EntityMapping[];
  webhookUrl?: string;
  customFields?: Record<string, unknown>;
}

export interface EntityMapping {
  sourceEntity: string;
  targetEntity: string;
  enabled: boolean;
  fieldMappings: FieldMapping[];
  filters?: FilterConfig[];
}

// ============================================================================
// SYNC TYPES
// ============================================================================

export interface SyncJob {
  id: string;
  integrationInstanceId: string;
  status: SyncStatus;
  direction: SyncDirection;
  
  startedAt: Date;
  completedAt?: Date;
  
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsFailed: number;
  
  errors: SyncError[];
  logs: SyncLog[];
}

export interface SyncError {
  recordId?: string;
  entity: string;
  message: string;
  code: string;
  timestamp: Date;
}

export interface SyncLog {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookEvent {
  id: string;
  integrationInstanceId: string;
  event: string;
  payload: unknown;
  
  receivedAt: Date;
  processedAt?: Date;
  status: "pending" | "processing" | "processed" | "failed";
  
  attempts: number;
  lastError?: string;
}
