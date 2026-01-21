import type {
  IntegrationConnector,
  IntegrationInstance,
  SyncJob,
  WebhookEvent,
} from "./types";
import { getConnectorById, allConnectors } from "./connectors";

export class IntegrationService {
  private baseUrl: string;

  constructor(baseUrl: string = "/api/integrations") {
    this.baseUrl = baseUrl;
  }

  async getConnectors(): Promise<IntegrationConnector[]> {
    return allConnectors;
  }

  async getConnector(id: string): Promise<IntegrationConnector | null> {
    return getConnectorById(id) || null;
  }

  async getInstances(organizationId: string): Promise<IntegrationInstance[]> {
    const response = await fetch(
      `${this.baseUrl}/instances?organizationId=${organizationId}`
    );
    if (!response.ok) throw new Error("Failed to fetch integration instances");
    return response.json();
  }

  async getInstance(instanceId: string): Promise<IntegrationInstance | null> {
    const response = await fetch(`${this.baseUrl}/instances/${instanceId}`);
    if (!response.ok) return null;
    return response.json();
  }

  async connectIntegration(
    organizationId: string,
    connectorId: string,
    credentials: Record<string, string>
  ): Promise<IntegrationInstance> {
    const response = await fetch(`${this.baseUrl}/instances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, connectorId, credentials }),
    });
    if (!response.ok) throw new Error("Failed to connect integration");
    return response.json();
  }

  async disconnectIntegration(instanceId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/instances/${instanceId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to disconnect integration");
  }

  async updateInstanceSettings(
    instanceId: string,
    settings: Partial<IntegrationInstance["settings"]>
  ): Promise<IntegrationInstance> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/settings`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }
    );
    if (!response.ok) throw new Error("Failed to update integration settings");
    return response.json();
  }

  async triggerSync(instanceId: string): Promise<SyncJob> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/sync`,
      {
        method: "POST",
      }
    );
    if (!response.ok) throw new Error("Failed to trigger sync");
    return response.json();
  }

  async getSyncJobs(instanceId: string): Promise<SyncJob[]> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/sync-jobs`
    );
    if (!response.ok) throw new Error("Failed to fetch sync jobs");
    return response.json();
  }

  async getSyncJob(jobId: string): Promise<SyncJob | null> {
    const response = await fetch(`${this.baseUrl}/sync-jobs/${jobId}`);
    if (!response.ok) return null;
    return response.json();
  }

  async getWebhookEvents(instanceId: string): Promise<WebhookEvent[]> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/webhook-events`
    );
    if (!response.ok) throw new Error("Failed to fetch webhook events");
    return response.json();
  }

  async retryWebhookEvent(eventId: string): Promise<WebhookEvent> {
    const response = await fetch(
      `${this.baseUrl}/webhook-events/${eventId}/retry`,
      {
        method: "POST",
      }
    );
    if (!response.ok) throw new Error("Failed to retry webhook event");
    return response.json();
  }

  getOAuthUrl(connectorId: string, redirectUri: string): string {
    const connector = getConnectorById(connectorId);
    if (!connector || connector.auth.type !== "oauth2" || !connector.auth.oauth2) {
      throw new Error("Connector does not support OAuth2");
    }

    const { authUrl, scopes } = connector.auth.oauth2;
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state: connectorId,
    });

    return `${authUrl}?${params.toString()}`;
  }

  async exchangeOAuthCode(
    connectorId: string,
    code: string,
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
    const response = await fetch(`${this.baseUrl}/oauth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId, code, redirectUri }),
    });
    if (!response.ok) throw new Error("Failed to exchange OAuth code");
    return response.json();
  }

  async refreshOAuthToken(instanceId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/refresh-token`,
      {
        method: "POST",
      }
    );
    if (!response.ok) throw new Error("Failed to refresh OAuth token");
  }

  async testConnection(instanceId: string): Promise<{
    success: boolean;
    message: string;
    latencyMs: number;
  }> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/test`,
      {
        method: "POST",
      }
    );
    if (!response.ok) throw new Error("Failed to test connection");
    return response.json();
  }

  async getFieldMappings(
    instanceId: string
  ): Promise<IntegrationInstance["settings"]["entityMappings"]> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/field-mappings`
    );
    if (!response.ok) throw new Error("Failed to fetch field mappings");
    return response.json();
  }

  async updateFieldMappings(
    instanceId: string,
    mappings: IntegrationInstance["settings"]["entityMappings"]
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/instances/${instanceId}/field-mappings`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappings),
      }
    );
    if (!response.ok) throw new Error("Failed to update field mappings");
  }
}

export const integrationService = new IntegrationService();
