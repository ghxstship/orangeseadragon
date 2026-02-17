import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';
import {
  erpConnectors,
  crmConnectors,
  hrisConnectors,
  finopsConnectors,
  communicationConnectors,
  calendarConnectors,
  storageConnectors,
  ticketingConnectors,
} from '@/lib/integrations/connectors';
import { captureError } from '@/lib/observability';

const allConnectors = [
  ...erpConnectors,
  ...crmConnectors,
  ...hrisConnectors,
  ...finopsConnectors,
  ...communicationConnectors,
  ...calendarConnectors,
  ...storageConnectors,
  ...ticketingConnectors,
];

/**
 * POST /api/integrations/[id]/connect
 * Initiate an integration connection (OAuth redirect or API key registration).
 * Returns { redirect_url } for OAuth flows, or confirms connection for API key types.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, membership } = auth;

  const { id } = await params;

  if (!id) {
    return badRequest('Integration ID is required');
  }

  try {
    const connector = allConnectors.find((c) => c.id === id || c.slug === id);

    if (!connector) {
      return notFound('Integration');
    }

    const orgId = membership.organization_id;
    if (!orgId) {
      return badRequest('User has no organization');
    }

    // For OAuth2 integrations, build the authorization URL
    if (connector.auth.type === 'oauth2' && connector.auth.oauth2) {
      const { authUrl, scopes } = connector.auth.oauth2;
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.atlvs.one'}/api/oauth/callback`;

      const params = new URLSearchParams({
        client_id: process.env[`${id.toUpperCase().replace(/-/g, '_')}_CLIENT_ID`] || '',
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: (scopes || []).join(' '),
        state: JSON.stringify({ provider: id, organization_id: orgId, user_id: user.id }),
      });

      const redirectUrl = `${authUrl}?${params.toString()}`;

      return apiSuccess({ redirect_url: redirectUrl, provider: id, auth_type: 'oauth2' });
    }

    // For API key integrations, return instructions (no redirect needed)
    if (connector.auth.type === 'api_key') {
      return apiSuccess({
        provider: id,
        auth_type: 'api_key',
        message: 'API key configuration required. Please provide your API key in integration settings.',
      });
    }

    // For SAML/SCIM integrations
    if (connector.auth.type === 'saml') {
      return apiSuccess({
        provider: id,
        auth_type: 'saml',
        message: 'SAML/SCIM configuration required. Please configure SSO in your identity provider.',
      });
    }

    return apiSuccess({ provider: id, auth_type: connector.auth.type });
  } catch (err) {
    captureError(err, 'api.integrations.id.connect.error');
    return serverError('Failed to initiate integration connection');
  }
}
