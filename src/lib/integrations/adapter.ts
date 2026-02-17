/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INTEGRATION ADAPTER FRAMEWORK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Generic adapter interface for all external integrations:
 * - Accounting (Xero, QuickBooks)
 * - HR (BambooHR, Personio)
 * - Calendar (Google, Outlook)
 * - Email (Gmail, Outlook)
 * - CRM (HubSpot)
 * - Project Management (Jira)
 *
 * Each adapter implements connect/disconnect/sync/getStatus.
 * Configuration is stored per-org in oauth_connections table.
 */

export type IntegrationProvider =
  | 'xero'
  | 'quickbooks'
  | 'sage'
  | 'bamboohr'
  | 'personio'
  | 'hibob'
  | 'google-calendar'
  | 'outlook-calendar'
  | 'gmail'
  | 'outlook-email'
  | 'hubspot'
  | 'jira'
  | 'slack';

export type IntegrationType =
  | 'accounting'
  | 'hr'
  | 'calendar'
  | 'email'
  | 'crm'
  | 'project-management'
  | 'messaging';

export type SyncDirection = 'push' | 'pull' | 'bidirectional';

export interface IntegrationConfig {
  provider: IntegrationProvider;
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  authType: 'oauth2' | 'api-key' | 'webhook';
  scopes?: string[];
  syncDirection: SyncDirection;
  syncEntities: string[];
  webhookEvents?: string[];
}

export interface SyncResult {
  provider: IntegrationProvider;
  direction: SyncDirection;
  entitiesSynced: number;
  entitiesCreated: number;
  entitiesUpdated: number;
  entitiesSkipped: number;
  errors: Array<{ entity: string; id: string; error: string }>;
  startedAt: string;
  completedAt: string;
}

export interface IntegrationStatus {
  provider: IntegrationProvider;
  connected: boolean;
  lastSyncAt?: string;
  lastSyncResult?: SyncResult;
  error?: string;
  expiresAt?: string;
}

export abstract class BaseIntegrationAdapter {
  abstract readonly config: IntegrationConfig;

  abstract getAuthUrl(redirectUri: string, state: string): string;
  abstract handleCallback(code: string, state: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string }>;
  abstract refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string }>;
  abstract disconnect(connectionId: string): Promise<void>;
  abstract getStatus(connectionId: string): Promise<IntegrationStatus>;
  abstract sync(connectionId: string, options?: { fullSync?: boolean; entities?: string[] }): Promise<SyncResult>;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const integrationConfigs: IntegrationConfig[] = [
  {
    provider: 'xero',
    type: 'accounting',
    name: 'Xero',
    description: 'Sync invoices, expenses, and payments with Xero',
    icon: 'FileSpreadsheet',
    authType: 'oauth2',
    scopes: ['accounting.transactions', 'accounting.contacts'],
    syncDirection: 'bidirectional',
    syncEntities: ['invoices', 'expenses', 'payments', 'contacts'],
  },
  {
    provider: 'quickbooks',
    type: 'accounting',
    name: 'QuickBooks',
    description: 'Sync invoices and expenses with QuickBooks Online',
    icon: 'Calculator',
    authType: 'oauth2',
    scopes: ['com.intuit.quickbooks.accounting'],
    syncDirection: 'bidirectional',
    syncEntities: ['invoices', 'expenses', 'payments', 'customers'],
  },
  {
    provider: 'sage',
    type: 'accounting',
    name: 'Sage',
    description: 'Export invoices to Sage accounting',
    icon: 'BookOpen',
    authType: 'oauth2',
    syncDirection: 'push',
    syncEntities: ['invoices'],
  },
  {
    provider: 'bamboohr',
    type: 'hr',
    name: 'BambooHR',
    description: 'Sync time-off requests and employee data',
    icon: 'Users',
    authType: 'api-key',
    syncDirection: 'pull',
    syncEntities: ['leave_requests', 'people'],
  },
  {
    provider: 'personio',
    type: 'hr',
    name: 'Personio',
    description: 'Sync absence data and employee profiles',
    icon: 'Users',
    authType: 'oauth2',
    syncDirection: 'pull',
    syncEntities: ['leave_requests', 'people'],
  },
  {
    provider: 'hibob',
    type: 'hr',
    name: 'HiBob',
    description: 'Sync time-off and employee data from HiBob',
    icon: 'Users',
    authType: 'api-key',
    syncDirection: 'pull',
    syncEntities: ['leave_requests', 'people'],
  },
  {
    provider: 'google-calendar',
    type: 'calendar',
    name: 'Google Calendar',
    description: 'Sync events and create time entries from calendar',
    icon: 'Calendar',
    authType: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/calendar'],
    syncDirection: 'bidirectional',
    syncEntities: ['events', 'time_entries'],
  },
  {
    provider: 'outlook-calendar',
    type: 'calendar',
    name: 'Outlook Calendar',
    description: 'Sync events and create time entries from Outlook',
    icon: 'Calendar',
    authType: 'oauth2',
    scopes: ['Calendars.ReadWrite'],
    syncDirection: 'bidirectional',
    syncEntities: ['events', 'time_entries'],
  },
  {
    provider: 'gmail',
    type: 'email',
    name: 'Gmail',
    description: 'Link email conversations to contacts and deals',
    icon: 'Mail',
    authType: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    syncDirection: 'pull',
    syncEntities: ['email_messages', 'contacts'],
  },
  {
    provider: 'outlook-email',
    type: 'email',
    name: 'Outlook Email',
    description: 'Link email conversations to contacts and deals',
    icon: 'Mail',
    authType: 'oauth2',
    scopes: ['Mail.Read'],
    syncDirection: 'pull',
    syncEntities: ['email_messages', 'contacts'],
  },
  {
    provider: 'hubspot',
    type: 'crm',
    name: 'HubSpot',
    description: 'Sync deals from HubSpot pipeline',
    icon: 'GitBranch',
    authType: 'oauth2',
    scopes: ['crm.objects.deals.read', 'crm.objects.contacts.read'],
    syncDirection: 'pull',
    syncEntities: ['deals', 'contacts', 'companies'],
  },
  {
    provider: 'jira',
    type: 'project-management',
    name: 'Jira',
    description: 'Sync tasks and time tracking with Jira',
    icon: 'CheckSquare',
    authType: 'oauth2',
    scopes: ['read:jira-work', 'write:jira-work'],
    syncDirection: 'bidirectional',
    syncEntities: ['tasks', 'time_entries'],
  },
  {
    provider: 'slack',
    type: 'messaging',
    name: 'Slack',
    description: 'Send notifications and report updates to Slack',
    icon: 'MessageSquare',
    authType: 'oauth2',
    scopes: ['chat:write', 'incoming-webhook'],
    syncDirection: 'push',
    syncEntities: ['notifications'],
    webhookEvents: ['budget_alert', 'report_subscription', 'approval_request'],
  },
];

export function getIntegrationConfig(provider: IntegrationProvider): IntegrationConfig | undefined {
  return integrationConfigs.find((c) => c.provider === provider);
}

export function getIntegrationsByType(type: IntegrationType): IntegrationConfig[] {
  return integrationConfigs.filter((c) => c.type === type);
}
