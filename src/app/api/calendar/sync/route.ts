import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/calendar/sync
 * Create or update a calendar sync connection for bidirectional sync
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const {
      provider,
      external_calendar_id,
      external_calendar_name,
      sync_direction = 'bidirectional',
      organization_id,
    } = body;

    if (!provider || !external_calendar_id || !organization_id) {
      return badRequest('provider, external_calendar_id, and organization_id are required');
    }

    if (!['google', 'outlook', 'apple', 'caldav'].includes(provider)) {
      return badRequest('provider must be one of: google, outlook, apple, caldav');
    }

    // Upsert connection
    const { data: connection, error: upsertError } = await supabase
      .from('calendar_sync_connections')
      .upsert({
        organization_id,
        user_id: user.id,
        provider,
        external_calendar_id,
        external_calendar_name,
        sync_direction,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider,external_calendar_id',
      })
      .select()
      .single();

    if (upsertError) {
      return supabaseError(upsertError);
    }

    return apiCreated(connection);
  } catch (e) {
    captureError(e, 'api.calendar.sync.error');
    return serverError('Failed to create calendar sync');
  }
}

/**
 * GET /api/calendar/sync
 * List user's calendar sync connections
 */
export async function GET() {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { data, error } = await supabase
      .from('calendar_sync_connections')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    captureError(e, 'api.calendar.sync.error');
    return serverError('Failed to list calendar syncs');
  }
}

/**
 * DELETE /api/calendar/sync
 * Disconnect a calendar sync (pass connection_id in query)
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const connectionId = request.nextUrl.searchParams.get('connection_id');
    if (!connectionId) {
      return badRequest('connection_id query parameter is required');
    }

    const { error } = await supabase
      .from('calendar_sync_connections')
      .update({
        status: 'disconnected',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .eq('user_id', user.id);

    if (error) {
      return supabaseError(error);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'calendar_sync_disconnected',
      entity_type: 'calendar_sync_connection',
      entity_id: connectionId,
    });

    return apiSuccess({ disconnected: true });
  } catch (e) {
    captureError(e, 'api.calendar.sync.error');
    return serverError('Failed to disconnect calendar sync');
  }
}
