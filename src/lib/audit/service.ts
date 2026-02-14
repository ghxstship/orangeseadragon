/**
 * Audit Service
 * Comprehensive audit logging for compliance and security
 */

import type {
  AuditAction,
  AuditActor,
  AuditCategory,
  AuditChange,
  AuditEntry,
  AuditExportOptions,
  AuditQuery,
  AuditServiceConfig,
  AuditSeverity,
  AuditStats,
  AuditTarget,
} from "./types";
import { captureError, logWarn } from "@/lib/observability";

type AuditEventHandler = (entry: AuditEntry) => void | Promise<void>;

const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PersistResult = {
  previous_hash?: string;
  integrity_hash?: string;
};

function asUuidOrNil(value: string | undefined | null): string {
  if (!value) {
    return NIL_UUID;
  }

  return UUID_PATTERN.test(value) ? value : NIL_UUID;
}

export class AuditService {
  private config: AuditServiceConfig;
  private entries: Map<string, AuditEntry> = new Map();
  private eventHandlers: AuditEventHandler[] = [];

  constructor(config: Partial<AuditServiceConfig> = {}) {
    this.config = {
      enabled: true,
      retentionPolicy: {
        defaultDays: 365 * 7, // 7 years for compliance
        byCategory: {
          authentication: 365 * 7,
          authorization: 365 * 7,
          security: 365 * 7,
          compliance: 365 * 7,
          data: 365 * 2,
          system: 365,
          integration: 365,
        },
        bySeverity: {
          critical: 365 * 10,
          high: 365 * 7,
          medium: 365 * 5,
          low: 365 * 2,
          info: 365,
        },
      },
      sensitiveFields: [
        "password",
        "secret",
        "token",
        "apiKey",
        "creditCard",
        "ssn",
        "socialSecurityNumber",
      ],
      persistence: {
        mode: "hybrid",
        hashAlgorithm: "sha256",
      },
      ...config,
    };
  }

  // ==================== Configuration ====================

  configure(config: Partial<AuditServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  // ==================== Event Handling ====================

  onEntry(handler: AuditEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) this.eventHandlers.splice(index, 1);
    };
  }

  private async emitEntry(entry: AuditEntry): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(entry);
      } catch (error) {
        captureError(error, "audit.handler_failed", {
          audit_id: entry.id,
          action: entry.action,
          category: entry.category,
        });
      }
    }

    // Send to realtime webhook if configured
    if (
      this.config.realtime?.enabled &&
      this.config.realtime.webhookUrl &&
      this.shouldSendRealtime(entry)
    ) {
      this.sendToWebhook(entry);
    }
  }

  private shouldSendRealtime(entry: AuditEntry): boolean {
    if (!this.config.realtime?.severityThreshold) return true;

    const severityOrder: AuditSeverity[] = ["info", "low", "medium", "high", "critical"];
    const thresholdIndex = severityOrder.indexOf(this.config.realtime.severityThreshold);
    const entryIndex = severityOrder.indexOf(entry.severity);

    return entryIndex >= thresholdIndex;
  }

  private async sendToWebhook(entry: AuditEntry): Promise<void> {
    if (!this.config.realtime?.webhookUrl) return;

    try {
      const response = await fetch(this.config.realtime.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        logWarn("audit.webhook_failed", {
          audit_id: entry.id,
          status: response.status,
          endpoint: this.config.realtime.webhookUrl,
        });
      }
    } catch (error) {
      captureError(error, "audit.webhook_exception", {
        audit_id: entry.id,
        endpoint: this.config.realtime.webhookUrl,
      });
    }
  }

  // ==================== Logging ====================

  async log(params: {
    organizationId: string;
    action: AuditAction;
    category: AuditCategory;
    severity?: AuditSeverity;
    actor: AuditActor;
    target?: AuditTarget;
    description: string;
    changes?: AuditChange[];
    metadata?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
    requestId?: string;
    correlationId?: string;
    tags?: string[];
  }): Promise<AuditEntry> {
    if (!this.config.enabled) {
      throw new Error("Audit logging is disabled");
    }

    // Check if action should be excluded
    if (this.config.excludeActions?.includes(params.action)) {
      throw new Error(`Action ${params.action} is excluded from audit logging`);
    }

    // Check if target type should be excluded
    if (
      params.target?.type &&
      this.config.excludeTargetTypes?.includes(params.target.type)
    ) {
      throw new Error(`Target type ${params.target.type} is excluded from audit logging`);
    }

    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Sanitize sensitive fields in changes
    const sanitizedChanges = params.changes?.map((change) =>
      this.sanitizeChange(change)
    );

    // Sanitize sensitive fields in metadata
    const sanitizedMetadata = params.metadata
      ? this.sanitizeObject(params.metadata)
      : undefined;

    const entry: AuditEntry = {
      id,
      organizationId: params.organizationId,
      action: params.action,
      category: params.category,
      severity: params.severity || this.inferSeverity(params.action, params.success ?? true),
      actor: params.actor,
      target: params.target,
      description: params.description,
      changes: sanitizedChanges,
      metadata: sanitizedMetadata,
      success: params.success ?? true,
      errorMessage: params.errorMessage,
      timestamp: new Date(),
      requestId: params.requestId,
      correlationId: params.correlationId,
      retentionDays: this.calculateRetentionDays(
        params.category,
        params.severity || "info"
      ),
      tags: params.tags,
    };

    const persistResult = await this.persistEntry(entry);
    if (persistResult) {
      entry.previousHash = persistResult.previous_hash;
      entry.integrityHash = persistResult.integrity_hash;
    }

    this.entries.set(id, entry);
    await this.emitEntry(entry);

    return entry;
  }

  private async persistEntry(entry: AuditEntry): Promise<PersistResult | null> {
    const mode = this.config.persistence?.mode || "memory";
    if (mode === "memory") {
      return null;
    }

    // Prevent server-only Supabase dependencies from being loaded in browser bundles.
    if (typeof window !== "undefined") {
      return null;
    }

    const retentionDays = entry.retentionDays || this.config.retentionPolicy.defaultDays;
    const retentionUntil = new Date(entry.timestamp);
    retentionUntil.setDate(retentionUntil.getDate() + retentionDays);

    const oldValues = this.buildChangeValueMap(entry.changes, "oldValue");
    const newValues = this.buildChangeValueMap(entry.changes, "newValue");

    try {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = await createServiceClient();

      const { data, error } = await supabase.rpc("append_audit_log", {
        p_organization_id: asUuidOrNil(entry.organizationId),
        p_user_id: asUuidOrNil(entry.actor.id),
        p_user_email: entry.actor.email ?? null,
        p_action: entry.action,
        p_entity_type: entry.target?.type ?? entry.category,
        p_entity_id: asUuidOrNil(entry.target?.id),
        p_old_values: oldValues,
        p_new_values: newValues,
        p_ip_address: entry.actor.ipAddress ?? null,
        p_user_agent: entry.actor.userAgent ?? null,
        p_metadata: {
          ...(entry.metadata || {}),
          tags: entry.tags ?? [],
          severity: entry.severity,
          success: entry.success,
          error_message: entry.errorMessage ?? null,
        },
        p_request_id: entry.requestId ?? null,
        p_correlation_id: entry.correlationId ?? null,
        p_retention_until: retentionUntil.toISOString(),
      });

      if (error) {
        throw error;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row || typeof row !== "object") {
        return null;
      }

      const result = row as Record<string, unknown>;
      return {
        previous_hash: typeof result.previous_hash === "string" ? result.previous_hash : undefined,
        integrity_hash: typeof result.integrity_hash === "string" ? result.integrity_hash : undefined,
      };
    } catch (error) {
      captureError(error, "audit.persistence_failed", {
        audit_id: entry.id,
        organization_id: entry.organizationId,
        mode,
      });

      if (mode === "supabase") {
        throw new Error("Audit persistence failed");
      }

      return null;
    }
  }

  private buildChangeValueMap(
    changes: AuditChange[] | undefined,
    key: "oldValue" | "newValue"
  ): Record<string, unknown> | null {
    if (!changes?.length) {
      return null;
    }

    const mapped: Record<string, unknown> = {};
    for (const change of changes) {
      mapped[change.field] = change[key];
    }

    return Object.keys(mapped).length > 0 ? mapped : null;
  }

  // Convenience methods for common actions
  async logCreate(
    organizationId: string,
    actor: AuditActor,
    target: AuditTarget,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action: "create",
      category: "data",
      actor,
      target,
      description: `Created ${target.type} "${target.name || target.id}"`,
      metadata,
    });
  }

  async logUpdate(
    organizationId: string,
    actor: AuditActor,
    target: AuditTarget,
    changes: AuditChange[],
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action: "update",
      category: "data",
      actor,
      target,
      description: `Updated ${target.type} "${target.name || target.id}"`,
      changes,
      metadata,
    });
  }

  async logDelete(
    organizationId: string,
    actor: AuditActor,
    target: AuditTarget,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action: "delete",
      category: "data",
      severity: "medium",
      actor,
      target,
      description: `Deleted ${target.type} "${target.name || target.id}"`,
      metadata,
    });
  }

  async logLogin(
    organizationId: string,
    actor: AuditActor,
    success: boolean,
    errorMessage?: string
  ): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action: success ? "login" : "login_failed",
      category: "authentication",
      severity: success ? "info" : "high",
      actor,
      description: success
        ? `User ${actor.email || actor.id} logged in`
        : `Failed login attempt for ${actor.email || actor.id}`,
      success,
      errorMessage,
    });
  }

  async logLogout(organizationId: string, actor: AuditActor): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action: "logout",
      category: "authentication",
      actor,
      description: `User ${actor.email || actor.id} logged out`,
    });
  }

  async logPermissionChange(
    organizationId: string,
    actor: AuditActor,
    target: AuditTarget,
    action: "permission_granted" | "permission_revoked",
    permission: string
  ): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action,
      category: "authorization",
      severity: "medium",
      actor,
      target,
      description: `${action === "permission_granted" ? "Granted" : "Revoked"} permission "${permission}" for ${target.type} "${target.name || target.id}"`,
      metadata: { permission },
    });
  }

  async logExport(
    organizationId: string,
    actor: AuditActor,
    target: AuditTarget,
    format: string,
    recordCount: number
  ): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action: "export",
      category: "data",
      severity: "medium",
      actor,
      target,
      description: `Exported ${recordCount} ${target.type} records as ${format}`,
      metadata: { format, recordCount },
    });
  }

  async logSecurityEvent(
    organizationId: string,
    actor: AuditActor,
    action: AuditAction,
    description: string,
    severity: AuditSeverity = "high",
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      organizationId,
      action,
      category: "security",
      severity,
      actor,
      description,
      metadata,
    });
  }

  // ==================== Query ====================

  async query(query: AuditQuery): Promise<AuditEntry[]> {
    let entries = Array.from(this.entries.values());

    if (query.organizationId) {
      entries = entries.filter((e) => e.organizationId === query.organizationId);
    }
    if (query.actorId) {
      entries = entries.filter((e) => e.actor.id === query.actorId);
    }
    if (query.actorType) {
      entries = entries.filter((e) => e.actor.type === query.actorType);
    }
    if (query.targetType) {
      entries = entries.filter((e) => e.target?.type === query.targetType);
    }
    if (query.targetId) {
      entries = entries.filter((e) => e.target?.id === query.targetId);
    }
    if (query.action) {
      const actions = Array.isArray(query.action) ? query.action : [query.action];
      entries = entries.filter((e) => actions.includes(e.action));
    }
    if (query.category) {
      const categories = Array.isArray(query.category) ? query.category : [query.category];
      entries = entries.filter((e) => categories.includes(e.category));
    }
    if (query.severity) {
      const severities = Array.isArray(query.severity) ? query.severity : [query.severity];
      entries = entries.filter((e) => severities.includes(e.severity));
    }
    if (query.success !== undefined) {
      entries = entries.filter((e) => e.success === query.success);
    }
    if (query.startDate) {
      entries = entries.filter((e) => e.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      entries = entries.filter((e) => e.timestamp <= query.endDate!);
    }
    if (query.search) {
      const search = query.search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.description.toLowerCase().includes(search) ||
          e.actor.name?.toLowerCase().includes(search) ||
          e.actor.email?.toLowerCase().includes(search) ||
          e.target?.name?.toLowerCase().includes(search)
      );
    }
    if (query.tags?.length) {
      entries = entries.filter((e) =>
        query.tags!.some((tag) => e.tags?.includes(tag))
      );
    }

    // Sort
    const orderBy = query.orderBy || "timestamp";
    const orderDir = query.orderDirection || "desc";
    entries.sort((a, b) => {
      let comparison = 0;
      if (orderBy === "timestamp") {
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (orderBy === "severity") {
        const severityOrder: AuditSeverity[] = ["info", "low", "medium", "high", "critical"];
        comparison = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
      }
      return orderDir === "desc" ? -comparison : comparison;
    });

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    return entries.slice(offset, offset + limit);
  }

  async getEntry(id: string): Promise<AuditEntry | null> {
    return this.entries.get(id) || null;
  }

  async getByCorrelationId(correlationId: string): Promise<AuditEntry[]> {
    return Array.from(this.entries.values()).filter(
      (e) => e.correlationId === correlationId
    );
  }

  // ==================== Statistics ====================

  async getStats(query: Partial<AuditQuery> = {}): Promise<AuditStats> {
    const entries = await this.query({ ...query, limit: 10000 });

    const stats: AuditStats = {
      total: entries.length,
      byAction: {},
      byCategory: {},
      bySeverity: {},
      byActor: [],
      byTarget: [],
      successRate: 0,
      timeline: [],
    };

    const actorCounts: Record<string, { name?: string; count: number }> = {};
    const targetCounts: Record<string, number> = {};
    const dateCounts: Record<string, number> = {};
    let successCount = 0;

    for (const entry of entries) {
      // By action
      stats.byAction[entry.action] = (stats.byAction[entry.action] || 0) + 1;

      // By category
      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;

      // By severity
      stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;

      // By actor
      if (!actorCounts[entry.actor.id]) {
        actorCounts[entry.actor.id] = { name: entry.actor.name, count: 0 };
      }
      actorCounts[entry.actor.id].count++;

      // By target
      if (entry.target?.type) {
        targetCounts[entry.target.type] = (targetCounts[entry.target.type] || 0) + 1;
      }

      // Success rate
      if (entry.success) successCount++;

      // Timeline
      const dateKey = entry.timestamp.toISOString().split("T")[0];
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    }

    stats.byActor = Object.entries(actorCounts)
      .map(([actorId, data]) => ({ actorId, actorName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    stats.byTarget = Object.entries(targetCounts)
      .map(([targetType, count]) => ({ targetType, count }))
      .sort((a, b) => b.count - a.count);

    stats.successRate = entries.length > 0 ? (successCount / entries.length) * 100 : 100;

    stats.timeline = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  }

  // ==================== Export ====================

  async export(options: AuditExportOptions): Promise<string> {
    const entries = await this.query(options.query);

    switch (options.format) {
      case "json":
        return JSON.stringify(
          entries.map((e) => this.formatForExport(e, options)),
          null,
          2
        );

      case "csv":
        return this.exportToCsv(entries, options);

      case "pdf":
        // In production, use a PDF library
        throw new Error("PDF export not implemented");

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private formatForExport(
    entry: AuditEntry,
    options: AuditExportOptions
  ): Partial<AuditEntry> {
    const result: Partial<AuditEntry> = {
      id: entry.id,
      timestamp: entry.timestamp,
      action: entry.action,
      category: entry.category,
      severity: entry.severity,
      actor: entry.actor,
      target: entry.target,
      description: entry.description,
      success: entry.success,
      errorMessage: entry.errorMessage,
    };

    if (options.includeChanges && entry.changes) {
      result.changes = entry.changes;
    }
    if (options.includeMetadata && entry.metadata) {
      result.metadata = entry.metadata;
    }

    return result;
  }

  private exportToCsv(entries: AuditEntry[], options: AuditExportOptions): string {
    const headers = [
      "ID",
      "Timestamp",
      "Action",
      "Category",
      "Severity",
      "Actor ID",
      "Actor Name",
      "Actor Email",
      "Target Type",
      "Target ID",
      "Target Name",
      "Description",
      "Success",
      "Error Message",
    ];

    if (options.includeChanges) {
      headers.push("Changes");
    }
    if (options.includeMetadata) {
      headers.push("Metadata");
    }

    const rows = entries.map((e) => {
      const row = [
        e.id,
        e.timestamp.toISOString(),
        e.action,
        e.category,
        e.severity,
        e.actor.id,
        e.actor.name || "",
        e.actor.email || "",
        e.target?.type || "",
        e.target?.id || "",
        e.target?.name || "",
        `"${e.description.replace(/"/g, '""')}"`,
        e.success ? "true" : "false",
        e.errorMessage || "",
      ];

      if (options.includeChanges) {
        row.push(e.changes ? JSON.stringify(e.changes) : "");
      }
      if (options.includeMetadata) {
        row.push(e.metadata ? JSON.stringify(e.metadata) : "");
      }

      return row.join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  // ==================== Retention ====================

  async applyRetentionPolicy(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, entry] of Array.from(this.entries.entries())) {
      const retentionDays = entry.retentionDays || this.config.retentionPolicy.defaultDays;
      const expirationDate = new Date(entry.timestamp);
      expirationDate.setDate(expirationDate.getDate() + retentionDays);

      if (now > expirationDate) {
        this.entries.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // ==================== Helpers ====================

  private inferSeverity(action: AuditAction, success: boolean): AuditSeverity {
    if (!success) {
      return action === "login_failed" ? "high" : "medium";
    }

    const highSeverityActions: AuditAction[] = [
      "delete",
      "bulk_delete",
      "permission_granted",
      "permission_revoked",
      "role_assigned",
      "role_removed",
      "password_change",
      "mfa_disabled",
    ];

    const mediumSeverityActions: AuditAction[] = [
      "update",
      "bulk_update",
      "export",
      "import",
      "settings_changed",
      "integration_connected",
      "integration_disconnected",
    ];

    if (highSeverityActions.includes(action)) return "medium";
    if (mediumSeverityActions.includes(action)) return "low";
    return "info";
  }

  private calculateRetentionDays(
    category: AuditCategory,
    severity: AuditSeverity
  ): number {
    const policy = this.config.retentionPolicy;

    // Use the higher of category or severity retention
    const categoryDays = policy.byCategory?.[category] || policy.defaultDays;
    const severityDays = policy.bySeverity?.[severity] || policy.defaultDays;

    return Math.max(categoryDays, severityDays);
  }

  private sanitizeChange(change: AuditChange): AuditChange {
    if (this.isSensitiveField(change.field)) {
      return {
        field: change.field,
        oldValue: "[REDACTED]",
        newValue: "[REDACTED]",
      };
    }
    return change;
  }

  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitiveField(key)) {
        result[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        result[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private isSensitiveField(field: string): boolean {
    const lowerField = field.toLowerCase();
    return (
      this.config.sensitiveFields?.some((sensitive) =>
        lowerField.includes(sensitive.toLowerCase())
      ) ?? false
    );
  }
}

// Export singleton instance
export const auditService = new AuditService();
