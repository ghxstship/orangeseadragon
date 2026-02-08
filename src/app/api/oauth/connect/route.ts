import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, forbidden, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/oauth/connect
 * 
 * Register or update an OAuth connection after the OAuth flow completes.
 * Stores encrypted tokens and initializes sync status.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {

    const body = await request.json();
    const {
      organization_id,
      provider,
      provider_user_id,
      access_token,
      refresh_token,
      token_expires_at,
      scopes,
      metadata,
    } = body;

    if (!organization_id || !provider) {
      return badRequest('organization_id and provider are required');
    }

    // Verify user belongs to the organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', organization_id)
      .single();

    if (!membership) {
      return forbidden('Not a member of this organization');
    }

    const { data: connection, error: upsertError } = await supabase
      .from('oauth_connections')
      .upsert({
        organization_id,
        user_id: user.id,
        provider,
        provider_user_id: provider_user_id || null,
        access_token_encrypted: access_token || null,
        refresh_token_encrypted: refresh_token || null,
        token_expires_at: token_expires_at || null,
        scopes: scopes || [],
        is_active: true,
        sync_status: 'idle',
        sync_error: null,
        metadata: metadata || {},
      }, { onConflict: 'organization_id,user_id,provider' })
      .select()
      .single();

    if (upsertError) {
      return supabaseError(upsertError);
    }

    // Log the activity
    await supabase.from('activities').insert({
      actor_id: user.id,
      action: 'oauth_connected',
      target_type: 'oauth_connection',
      target_id: connection.id,
      metadata: { provider, scopes },
    });

    return apiCreated({
      id: connection.id,
      provider: connection.provider,
      is_active: connection.is_active,
      sync_status: connection.sync_status,
    });
  } catch (error) {
    console.error('Error connecting OAuth provider:', error);
    return serverError();
  }
}

/**
 * DELETE /api/oauth/connect
 * 
 * Disconnect an OAuth provider by deactivating the connection.
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return badRequest('Connection id is required');
    }

    const { data: connection, error: updateError } = await supabase
      .from('oauth_connections')
      .update({
        is_active: false,
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        sync_status: 'idle',
      })
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return supabaseError(updateError);
    }

    return apiSuccess(connection);
  } catch (error) {
    console.error('Error disconnecting OAuth provider:', error);
    return serverError();
  }
}
