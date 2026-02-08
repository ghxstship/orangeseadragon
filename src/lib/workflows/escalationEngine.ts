/**
 * Escalation Engine
 * 
 * Automated incident escalation workflow engine that processes
 * escalation chains based on incident severity, type, and time thresholds.
 */

import { notificationService } from '../notifications/notificationService';

export interface Incident {
  id: string;
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  location: string;
  reported_at: string;
  escalation_level: number;
  assigned_to_id?: string;
}

export interface EscalationChain {
  id: string;
  name: string;
  incident_type: string;
  min_severity: string;
  is_active: boolean;
  auto_escalate: boolean;
  steps: EscalationStep[];
}

export interface EscalationStep {
  id: string;
  order: number;
  name: string;
  delay_minutes: number;
  notify_roles: string[];
  notify_users: string[];
  notify_teams: string[];
  notification_methods: ('push' | 'sms' | 'email' | 'radio' | 'phone')[];
  message_template: string;
  require_acknowledgment: boolean;
  acknowledgment_timeout_minutes: number;
  auto_proceed_on_timeout: boolean;
}

export interface EscalationLog {
  id: string;
  incident_id: string;
  chain_id: string;
  step_id: string;
  step_order: number;
  triggered_at: string;
  acknowledged_at?: string;
  acknowledged_by_id?: string;
  status: 'pending' | 'acknowledged' | 'timeout' | 'cancelled';
  notifications_sent: number;
}

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];

class EscalationEngine {
  private static instance: EscalationEngine;
  private activeEscalations: Map<string, NodeJS.Timeout[]> = new Map();
  private escalationLogs: EscalationLog[] = [];

  private constructor() {}

  static getInstance(): EscalationEngine {
    if (!EscalationEngine.instance) {
      EscalationEngine.instance = new EscalationEngine();
    }
    return EscalationEngine.instance;
  }

  /**
   * Find matching escalation chains for an incident
   */
  findMatchingChains(incident: Incident, chains: EscalationChain[]): EscalationChain[] {
    return chains.filter((chain) => {
      if (!chain.is_active) return false;
      
      // Check incident type match
      if (chain.incident_type !== 'all' && chain.incident_type !== incident.type) {
        return false;
      }
      
      // Check severity threshold
      const incidentSeverityIndex = SEVERITY_ORDER.indexOf(incident.severity);
      const minSeverityIndex = SEVERITY_ORDER.indexOf(chain.min_severity);
      if (incidentSeverityIndex < minSeverityIndex) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Start escalation process for an incident
   */
  async startEscalation(incident: Incident, chain: EscalationChain): Promise<void> {
    const escalationKey = `${incident.id}-${chain.id}`;
    
    // Cancel any existing escalation for this incident/chain
    this.cancelEscalation(incident.id, chain.id);
    
    const timeouts: NodeJS.Timeout[] = [];
    let cumulativeDelay = 0;

    for (const step of chain.steps.sort((a, b) => a.order - b.order)) {
      cumulativeDelay += step.delay_minutes * 60 * 1000;
      
      const timeout = setTimeout(async () => {
        await this.executeStep(incident, chain, step);
      }, cumulativeDelay);
      
      timeouts.push(timeout);
    }

    this.activeEscalations.set(escalationKey, timeouts);
  }

  /**
   * Execute a single escalation step
   */
  private async executeStep(
    incident: Incident,
    chain: EscalationChain,
    step: EscalationStep
  ): Promise<void> {
    const log: EscalationLog = {
      id: `log-${Date.now()}`,
      incident_id: incident.id,
      chain_id: chain.id,
      step_id: step.id,
      step_order: step.order,
      triggered_at: new Date().toISOString(),
      status: 'pending',
      notifications_sent: 0,
    };

    // Send notifications
    const message = this.formatMessage(step.message_template, incident);
    let notificationsSent = 0;

    for (const method of step.notification_methods) {
      try {
        await this.sendNotification(method, step, incident, message);
        notificationsSent++;
      } catch (error) {
        console.error(`Failed to send ${method} notification:`, error);
      }
    }

    log.notifications_sent = notificationsSent;
    this.escalationLogs.push(log);

    // Set acknowledgment timeout if required
    if (step.require_acknowledgment && step.auto_proceed_on_timeout) {
      setTimeout(() => {
        const existingLog = this.escalationLogs.find((l) => l.id === log.id);
        if (existingLog && existingLog.status === 'pending') {
          existingLog.status = 'timeout';
        }
      }, step.acknowledgment_timeout_minutes * 60 * 1000);
    }
  }

  /**
   * Format message template with incident data
   */
  private formatMessage(template: string, incident: Incident): string {
    return template
      .replace(/\{incident\.id\}/g, incident.id)
      .replace(/\{incident\.title\}/g, incident.title)
      .replace(/\{incident\.type\}/g, incident.type)
      .replace(/\{incident\.severity\}/g, incident.severity)
      .replace(/\{incident\.location\}/g, incident.location)
      .replace(/\{incident\.status\}/g, incident.status)
      .replace(/\{incident\.reported_at\}/g, new Date(incident.reported_at).toLocaleString());
  }

  /**
   * Send notification via specified method
   */
  private async sendNotification(
    method: string,
    step: EscalationStep,
    incident: Incident,
    message: string
  ): Promise<void> {
    switch (method) {
      case 'push':
        await notificationService.show({
          id: `escalation-${incident.id}-${step.id}`,
          type: incident.severity === 'critical' ? 'incident_critical' : 'incident_update',
          title: `🚨 Escalation: ${step.name}`,
          body: message,
          requireInteraction: true,
          data: {
            url: `/operations/incidents/${incident.id}`,
            incidentId: incident.id,
            escalationStepId: step.id,
          },
        });
        break;

      case 'sms':
        // SMS integration would go here
        console.log(`SMS to ${step.notify_users.join(', ')}: ${message}`);
        break;

      case 'email':
        // Email integration would go here
        console.log(`Email to ${step.notify_users.join(', ')}: ${message}`);
        break;

      case 'radio':
        // Radio dispatch integration would go here
        console.log(`Radio dispatch: ${message}`);
        break;

      case 'phone':
        // Phone call integration would go here
        console.log(`Phone call to ${step.notify_users.join(', ')}`);
        break;
    }
  }

  /**
   * Acknowledge an escalation step
   */
  acknowledgeStep(
    incidentId: string,
    chainId: string,
    stepId: string,
    userId: string
  ): boolean {
    const log = this.escalationLogs.find(
      (l) =>
        l.incident_id === incidentId &&
        l.chain_id === chainId &&
        l.step_id === stepId &&
        l.status === 'pending'
    );

    if (log) {
      log.status = 'acknowledged';
      log.acknowledged_at = new Date().toISOString();
      log.acknowledged_by_id = userId;
      return true;
    }

    return false;
  }

  /**
   * Cancel escalation for an incident
   */
  cancelEscalation(incidentId: string, chainId?: string): void {
    const keysToCancel = chainId
      ? [`${incidentId}-${chainId}`]
      : Array.from(this.activeEscalations.keys()).filter((k) =>
          k.startsWith(`${incidentId}-`)
        );

    for (const key of keysToCancel) {
      const timeouts = this.activeEscalations.get(key);
      if (timeouts) {
        timeouts.forEach((t) => clearTimeout(t));
        this.activeEscalations.delete(key);
      }

      // Mark pending logs as cancelled
      this.escalationLogs
        .filter(
          (l) =>
            l.incident_id === incidentId &&
            (!chainId || l.chain_id === chainId) &&
            l.status === 'pending'
        )
        .forEach((l) => {
          l.status = 'cancelled';
        });
    }
  }

  /**
   * Get escalation logs for an incident
   */
  getLogsForIncident(incidentId: string): EscalationLog[] {
    return this.escalationLogs.filter((l) => l.incident_id === incidentId);
  }

  /**
   * Get active escalations count
   */
  getActiveEscalationsCount(): number {
    return this.activeEscalations.size;
  }

  /**
   * Process new incident - find chains and start escalations
   */
  async processNewIncident(
    incident: Incident,
    availableChains: EscalationChain[]
  ): Promise<number> {
    const matchingChains = this.findMatchingChains(incident, availableChains);
    
    for (const chain of matchingChains) {
      if (chain.auto_escalate) {
        await this.startEscalation(incident, chain);
      }
    }

    return matchingChains.length;
  }

  /**
   * Handle incident status change
   */
  handleIncidentStatusChange(
    incident: Incident,
    newStatus: string
  ): void {
    // Cancel escalations if incident is resolved or closed
    if (['resolved', 'closed'].includes(newStatus)) {
      this.cancelEscalation(incident.id);
    }
  }
}

export const escalationEngine = EscalationEngine.getInstance();
export default escalationEngine;
