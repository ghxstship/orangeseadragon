/**
 * Expiration Alert Service
 * 
 * Monitors entities with expiration dates and generates alerts/notifications
 * when items are approaching or past their expiration dates.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";


interface ExpiringItem {
  id: string;
  entityType: string;
  name: string;
  expirationDate: string;
  daysUntilExpiration: number;
  status: string;
  metadata?: Record<string, unknown>;
}

interface AlertNotification {
  userId: string;
  organizationId: string;
  type: "expiration_warning" | "expiration_imminent" | "expired";
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  expirationDate: string;
  daysUntilExpiration: number;
  actionUrl: string;
}

const DEFAULT_ALERT_DAYS = [30, 14, 7, 3, 1, 0];

export class ExpirationAlertService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Check all expiring items for an organization and generate alerts
   */
  async checkExpirations(organizationId: string): Promise<AlertNotification[]> {
    const alerts: AlertNotification[] = [];

    // Check permits
    const permitAlerts = await this.checkPermitExpirations(organizationId);
    alerts.push(...permitAlerts);

    // Check certifications (if applicable)
    const certAlerts = await this.checkCertificationExpirations(organizationId);
    alerts.push(...certAlerts);

    // Check contracts
    const contractAlerts = await this.checkContractExpirations(organizationId);
    alerts.push(...contractAlerts);

    // Check insurance documents
    const insuranceAlerts = await this.checkInsuranceExpirations(organizationId);
    alerts.push(...insuranceAlerts);

    return alerts;
  }

  /**
   * Check permit expirations
   */
  async checkPermitExpirations(organizationId: string): Promise<AlertNotification[]> {
    const alerts: AlertNotification[] = [];
    const today = new Date();

    const { data: permits, error } = await this.supabase
      .from("permits")
      .select("id, name, expiration_date, status, permit_type, event_id")
      .eq("organization_id", organizationId)
      .not("expiration_date", "is", null)
      .eq("status", "approved");

    if (error || !permits) return alerts;

    for (const permit of permits) {
      if (!permit.expiration_date) continue;

      const expirationDate = new Date(permit.expiration_date);
      const daysUntil = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (DEFAULT_ALERT_DAYS.includes(daysUntil) || daysUntil < 0) {
        const alertType = this.getAlertType(daysUntil);
        const recipients = await this.getAlertRecipients(organizationId, "permit");

        for (const userId of recipients) {
          alerts.push({
            userId,
            organizationId,
            type: alertType,
            title: this.getAlertTitle(alertType, "Permit", permit.name),
            message: this.getAlertMessage(alertType, "permit", permit.name, daysUntil),
            entityType: "permit",
            entityId: permit.id,
            expirationDate: permit.expiration_date,
            daysUntilExpiration: daysUntil,
            actionUrl: `/productions/compliance/${permit.id}`,
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Check certification expirations
   */
  async checkCertificationExpirations(organizationId: string): Promise<AlertNotification[]> {
    const alerts: AlertNotification[] = [];
    const today = new Date();

    const { data: certifications, error } = await this.supabase
      .from("certificates_of_insurance")
      .select("id, name, expiration_date, status")
      .eq("organization_id", organizationId)
      .not("expiration_date", "is", null);

    if (error || !certifications) return alerts;

    for (const cert of certifications) {
      if (!cert.expiration_date) continue;

      const expirationDate = new Date(cert.expiration_date);
      const daysUntil = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (DEFAULT_ALERT_DAYS.includes(daysUntil) || daysUntil < 0) {
        const alertType = this.getAlertType(daysUntil);

        // Notify HR/admins
        const recipients = await this.getAlertRecipients(organizationId, "certification");
        for (const userId of recipients) {
          alerts.push({
            userId,
            organizationId,
            type: alertType,
            title: this.getAlertTitle(alertType, "Certificate", cert.name),
            message: this.getAlertMessage(alertType, "certificate", cert.name, daysUntil),
            entityType: "certificate_of_insurance",
            entityId: cert.id,
            expirationDate: cert.expiration_date,
            daysUntilExpiration: daysUntil,
            actionUrl: `/compliance/certificates/${cert.id}`,
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Check contract expirations
   */
  async checkContractExpirations(organizationId: string): Promise<AlertNotification[]> {
    const alerts: AlertNotification[] = [];
    const today = new Date();

    const { data: contracts, error } = await this.supabase
      .from("contracts")
      .select("id, title, end_date, status")
      .eq("organization_id", organizationId)
      .not("end_date", "is", null)
      .eq("status", "active");

    if (error || !contracts) return alerts;

    for (const contract of contracts) {
      if (!contract.end_date) continue;

      const expirationDate = new Date(contract.end_date);
      const daysUntil = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (DEFAULT_ALERT_DAYS.includes(daysUntil) || daysUntil < 0) {
        const alertType = this.getAlertType(daysUntil);
        const recipients = await this.getAlertRecipients(organizationId, "contract");

        for (const userId of recipients) {
          alerts.push({
            userId,
            organizationId,
            type: alertType,
            title: this.getAlertTitle(alertType, "Contract", contract.title),
            message: this.getAlertMessage(alertType, "contract", contract.title, daysUntil),
            entityType: "contract",
            entityId: contract.id,
            expirationDate: contract.end_date,
            daysUntilExpiration: daysUntil,
            actionUrl: `/contracts/${contract.id}`,
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Check insurance document expirations
   */
  async checkInsuranceExpirations(organizationId: string): Promise<AlertNotification[]> {
    const alerts: AlertNotification[] = [];
    const today = new Date();

    const { data: documents, error } = await this.supabase
      .from("certificates_of_insurance")
      .select("id, name, expiration_date, status")
      .eq("organization_id", organizationId)
      .not("expiration_date", "is", null);

    if (error || !documents) return alerts;

    for (const doc of documents) {
      if (!doc.expiration_date) continue;

      const expirationDate = new Date(doc.expiration_date);
      const daysUntil = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (DEFAULT_ALERT_DAYS.includes(daysUntil) || daysUntil < 0) {
        const alertType = this.getAlertType(daysUntil);
        const recipients = await this.getAlertRecipients(organizationId, "insurance");

        for (const userId of recipients) {
          alerts.push({
            userId,
            organizationId,
            type: alertType,
            title: this.getAlertTitle(alertType, "Insurance", doc.name),
            message: this.getAlertMessage(alertType, "insurance certificate", doc.name, daysUntil),
            entityType: "certificate_of_insurance",
            entityId: doc.id,
            expirationDate: doc.expiration_date,
            daysUntilExpiration: daysUntil,
            actionUrl: `/compliance/certificates/${doc.id}`,
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Get all expiring items for dashboard display
   */
  async getExpiringItems(
    organizationId: string,
    daysAhead: number = 30
  ): Promise<ExpiringItem[]> {
    const items: ExpiringItem[] = [];
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // Get expiring permits
    const { data: permits } = await this.supabase
      .from("permits")
      .select("id, name, expiration_date, status, permit_type")
      .eq("organization_id", organizationId)
      .not("expiration_date", "is", null)
      .lte("expiration_date", futureDate.toISOString())
      .eq("status", "approved");

    if (permits) {
      for (const permit of permits) {
        if (!permit.expiration_date) continue;
        const daysUntil = Math.ceil(
          (new Date(permit.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: permit.id,
          entityType: "permit",
          name: permit.name,
          expirationDate: permit.expiration_date,
          daysUntilExpiration: daysUntil,
          status: permit.status ?? "unknown",
          metadata: { permitType: permit.permit_type },
        });
      }
    }

    // Get expiring certificates of insurance
    const { data: certifications } = await this.supabase
      .from("certificates_of_insurance")
      .select("id, name, expiration_date, status")
      .eq("organization_id", organizationId)
      .not("expiration_date", "is", null)
      .lte("expiration_date", futureDate.toISOString());

    if (certifications) {
      for (const cert of certifications) {
        if (!cert.expiration_date) continue;
        const daysUntil = Math.ceil(
          (new Date(cert.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: cert.id,
          entityType: "certificate_of_insurance",
          name: cert.name,
          expirationDate: cert.expiration_date,
          daysUntilExpiration: daysUntil,
          status: cert.status ?? "unknown",
        });
      }
    }

    // Get expiring contracts
    const { data: contracts } = await this.supabase
      .from("contracts")
      .select("id, title, end_date, status")
      .eq("organization_id", organizationId)
      .not("end_date", "is", null)
      .lte("end_date", futureDate.toISOString())
      .eq("status", "active");

    if (contracts) {
      for (const contract of contracts) {
        if (!contract.end_date) continue;
        const daysUntil = Math.ceil(
          (new Date(contract.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: contract.id,
          entityType: "contract",
          name: contract.title,
          expirationDate: contract.end_date,
          daysUntilExpiration: daysUntil,
          status: contract.status ?? "unknown",
        });
      }
    }

    // Sort by days until expiration (most urgent first)
    items.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

    return items;
  }

  /**
   * Send alert notifications
   */
  async sendAlerts(alerts: AlertNotification[]): Promise<void> {
    if (alerts.length === 0) return;

    // Deduplicate alerts (same user + entity + type)
    const uniqueAlerts = this.deduplicateAlerts(alerts);

    // Check which alerts have already been sent recently
    const alertsToSend = await this.filterRecentlySentAlerts(uniqueAlerts);

    if (alertsToSend.length === 0) return;

    // Create notifications
    const notifications = alertsToSend.map((alert) => ({
      type: alert.type,
      title: alert.title,
      message: alert.message,
      user_id: alert.userId,
      organization_id: alert.organizationId,
      entity_type: alert.entityType,
      entity_id: alert.entityId,
      data: {
        expirationDate: alert.expirationDate,
        daysUntilExpiration: alert.daysUntilExpiration,
        url: alert.actionUrl,
      },
      is_read: false,
    }));

    await this.supabase.from("notifications").insert(notifications);
  }

  /**
   * Get users who should receive alerts for a given entity type
   */
  private async getAlertRecipients(
    organizationId: string,
    entityType: string
  ): Promise<string[]> {
    // Get notification rules for this entity type
    const { data: rules } = await this.supabase
      .from("notification_rules")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("entity_type", entityType)
      .eq("trigger_type", "expiration")
      .eq("is_active", true);

    if (!rules?.length) {
      // Default: notify admins and managers
      const { data: members } = await this.supabase
        .from("organization_members")
        .select("user_id, role:roles(slug)")
        .eq("organization_id", organizationId)
        .eq("status", "active");

      if (!members) return [];

      return members
        .filter((m) => {
          const role = m.role as { slug: string } | null;
          return role && ["owner", "admin", "manager"].includes(role.slug);
        })
        .map((m) => m.user_id);
    }

    // Collect recipients from rules
    const recipients = new Set<string>();

    for (const rule of rules) {
      const config = rule.notification_config as { notifyRoles?: string[]; notifyUsers?: string[] } | null;
      
      if (config?.notifyUsers) {
        config.notifyUsers.forEach((id) => recipients.add(id));
      }

      if (config?.notifyRoles) {
        const { data: members } = await this.supabase
          .from("organization_members")
          .select("user_id, role:roles(slug)")
          .eq("organization_id", organizationId)
          .eq("status", "active");

        if (members) {
          members
            .filter((m) => {
              const role = m.role as { slug: string } | null;
              return role && config.notifyRoles!.includes(role.slug);
            })
            .forEach((m) => recipients.add(m.user_id));
        }
      }
    }

    return Array.from(recipients);
  }

  /**
   * Get alert type based on days until expiration
   */
  private getAlertType(daysUntil: number): "expiration_warning" | "expiration_imminent" | "expired" {
    if (daysUntil < 0) return "expired";
    if (daysUntil <= 3) return "expiration_imminent";
    return "expiration_warning";
  }

  /**
   * Get alert title
   */
  private getAlertTitle(
    alertType: "expiration_warning" | "expiration_imminent" | "expired",
    entityLabel: string,
    name: string
  ): string {
    switch (alertType) {
      case "expired":
        return `${entityLabel} Expired: ${name}`;
      case "expiration_imminent":
        return `${entityLabel} Expiring Soon: ${name}`;
      default:
        return `${entityLabel} Expiration Notice: ${name}`;
    }
  }

  /**
   * Get alert message
   */
  private getAlertMessage(
    alertType: "expiration_warning" | "expiration_imminent" | "expired",
    entityType: string,
    name: string,
    daysUntil: number
  ): string {
    if (alertType === "expired") {
      return `The ${entityType} "${name}" has expired ${Math.abs(daysUntil)} day(s) ago. Please renew immediately.`;
    }
    if (daysUntil === 0) {
      return `The ${entityType} "${name}" expires today. Please take action.`;
    }
    if (daysUntil === 1) {
      return `The ${entityType} "${name}" expires tomorrow. Please take action.`;
    }
    return `The ${entityType} "${name}" will expire in ${daysUntil} days. Please plan for renewal.`;
  }

  /**
   * Deduplicate alerts
   */
  private deduplicateAlerts(alerts: AlertNotification[]): AlertNotification[] {
    const seen = new Set<string>();
    return alerts.filter((alert) => {
      const key = `${alert.userId}:${alert.entityType}:${alert.entityId}:${alert.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Filter out alerts that were sent recently
   */
  private async filterRecentlySentAlerts(
    alerts: AlertNotification[]
  ): Promise<AlertNotification[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentNotifications } = await this.supabase
      .from("notifications")
      .select("user_id, data")
      .gte("created_at", oneDayAgo)
      .in("type", ["expiration_warning", "expiration_imminent", "expired"]);

    if (!recentNotifications?.length) return alerts;

    const recentKeys = new Set(
      recentNotifications.map((n) => {
        const data = n.data as { entityType?: string; entityId?: string } | null;
        return `${n.user_id}:${data?.entityType}:${data?.entityId}`;
      })
    );

    return alerts.filter((alert) => {
      const key = `${alert.userId}:${alert.entityType}:${alert.entityId}`;
      return !recentKeys.has(key);
    });
  }
}

// Singleton instance
let expirationAlertServiceInstance: ExpirationAlertService | null = null;

export function getExpirationAlertService(): ExpirationAlertService {
  if (!expirationAlertServiceInstance) {
    expirationAlertServiceInstance = new ExpirationAlertService();
  }
  return expirationAlertServiceInstance;
}
