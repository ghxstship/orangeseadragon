/**
 * Audit Logging Types
 * Comprehensive audit trail for compliance and security
 */

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "login_failed"
  | "password_change"
  | "password_reset"
  | "mfa_enabled"
  | "mfa_disabled"
  | "permission_granted"
  | "permission_revoked"
  | "role_assigned"
  | "role_removed"
  | "invite_sent"
  | "invite_accepted"
  | "export"
  | "import"
  | "bulk_update"
  | "bulk_delete"
  | "approve"
  | "reject"
  | "archive"
  | "restore"
  | "publish"
  | "unpublish"
  | "share"
  | "unshare"
  | "download"
  | "upload"
  | "api_call"
  | "webhook_received"
  | "integration_connected"
  | "integration_disconnected"
  | "settings_changed"
  | "custom";

export type AuditSeverity = "info" | "low" | "medium" | "high" | "critical";

export type AuditCategory =
  | "authentication"
  | "authorization"
  | "data"
  | "system"
  | "integration"
  | "security"
  | "compliance";

export interface AuditActor {
  id: string;
  type: "user" | "system" | "api" | "integration" | "workflow";
  name?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditTarget {
  type: string;
  id: string;
  name?: string;
  parentType?: string;
  parentId?: string;
}

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditEntry {
  id: string;
  organizationId: string;
  
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  
  actor: AuditActor;
  target?: AuditTarget;
  
  description: string;
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
  
  success: boolean;
  errorMessage?: string;
  
  timestamp: Date;
  
  requestId?: string;
  correlationId?: string;

  previousHash?: string;
  integrityHash?: string;
  
  retentionDays?: number;
  tags?: string[];
}

export interface AuditQuery {
  organizationId?: string;
  actorId?: string;
  actorType?: AuditActor["type"];
  targetType?: string;
  targetId?: string;
  action?: AuditAction | AuditAction[];
  category?: AuditCategory | AuditCategory[];
  severity?: AuditSeverity | AuditSeverity[];
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: "timestamp" | "severity";
  orderDirection?: "asc" | "desc";
}

export interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byActor: Array<{ actorId: string; actorName?: string; count: number }>;
  byTarget: Array<{ targetType: string; count: number }>;
  successRate: number;
  timeline: Array<{ date: string; count: number }>;
}

export interface AuditExportOptions {
  format: "json" | "csv" | "pdf";
  query: AuditQuery;
  includeMetadata?: boolean;
  includeChanges?: boolean;
}

export interface AuditRetentionPolicy {
  defaultDays: number;
  byCategory?: Partial<Record<AuditCategory, number>>;
  bySeverity?: Partial<Record<AuditSeverity, number>>;
}

export interface AuditServiceConfig {
  enabled: boolean;
  retentionPolicy: AuditRetentionPolicy;
  
  sensitiveFields?: string[];
  excludeActions?: AuditAction[];
  excludeTargetTypes?: string[];
  
  realtime?: {
    enabled: boolean;
    webhookUrl?: string;
    severityThreshold?: AuditSeverity;
  };

  persistence?: {
    mode: "memory" | "supabase" | "hybrid";
    hashAlgorithm?: "sha256";
  };
  
  compliance?: {
    gdpr?: boolean;
    hipaa?: boolean;
    soc2?: boolean;
    pci?: boolean;
  };
}
