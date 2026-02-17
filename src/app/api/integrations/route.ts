import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import { integrationConfigs } from '@/lib/integrations/adapter';
import type { Database } from '@/types/database';
import type { IntegrationProvider } from '@/lib/integrations/adapter';

type OauthConnectionRow = Database['public']['Tables']['oauth_connections']['Row'];

const VALID_PROVIDERS = integrationConfigs.map((c) => c.provider) as [string, ...string[]];

const integrationActionSchema = z.object({
  provider: z.enum(VALID_PROVIDERS),
  action: z.enum(['connect', 'disconnect', 'sync']),
  config: z.record(z.unknown()).optional(),
});

function isIntegrationProvider(value: string): value is IntegrationProvider {
  return integrationConfigs.some((config) => config.provider === value);
}

/**
 * G14-G19: Integration management endpoint.
 * GET: List all available integrations with connection status
 * POST: Connect/disconnect an integration
 */
export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  const { data: connections, error } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('organization_id', membership.organization_id);

  if (error) {
    return supabaseError(error);
  }

  const connMap = new Map<IntegrationProvider, OauthConnectionRow>();
  if (connections) {
    for (const conn of connections) {
      if (isIntegrationProvider(conn.provider)) {
        connMap.set(conn.provider, conn);
      }
    }
  }

  const integrations = integrationConfigs.map((config) => {
    const conn = connMap.get(config.provider);
    return {
      ...config,
      connected: !!conn,
      connectionId: conn?.id ?? null,
      lastSyncAt: conn?.last_synced_at ?? null,
      status: conn ? 'connected' : 'disconnected',
    };
  });

  return apiSuccess(integrations);
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsed = integrationActionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { provider, action, config } = parsed.data;

  try {
    if (action === 'connect') {
      const integrationConfig = integrationConfigs.find((c) => c.provider === provider);
      if (!integrationConfig) {
        return badRequest('Unknown provider');
      }

      if (integrationConfig.authType === 'oauth2') {
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.atlvs.one'}/api/integrations/callback`;
        const state = Buffer.from(JSON.stringify({ provider, orgId: membership.organization_id, userId: user.id })).toString('base64');

        return apiSuccess({
          authUrl: `/api/integrations/oauth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
          provider,
          authType: 'oauth2',
        });
      }

      const { data, error } = await supabase
        .from('oauth_connections')
        .insert({
          provider,
          organization_id: membership.organization_id,
          user_id: user.id,
          config: JSON.stringify(config ?? {}),
          status: 'connected',
        })
        .select()
        .single();

      if (error) return supabaseError(error);
      return apiSuccess(data);
    }

    if (action === 'disconnect') {
      const { error } = await supabase
        .from('oauth_connections')
        .delete()
        .eq('provider', provider)
        .eq('organization_id', membership.organization_id);

      if (error) return supabaseError(error);
      return apiSuccess({ provider, status: 'disconnected' });
    }

    if (action === 'sync') {
      return apiSuccess({
        provider,
        status: 'sync_started',
        message: `Sync initiated for ${provider}. This may take a few minutes.`,
      });
    }

    return badRequest('Invalid action');
  } catch (error) {
    captureError(error, 'api.integrations.action.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to process integration action');
  }
}
