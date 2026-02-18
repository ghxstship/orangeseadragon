import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/auth/session-invalidation
 * Invalidate a user's session when their permissions change.
 * Called by admin when changing roles/permissions.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin']);
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    const body = await request.json();
    const { target_user_id, reason } = body;

    if (!target_user_id) {
      return badRequest('target_user_id is required');
    }

    if (!reason) {
      return badRequest('reason is required');
    }

    // Record the invalidation
    const { data: invalidation, error: insertError } = await supabase
      .from('session_invalidations')
      .insert({
        user_id: target_user_id,
        reason,
        invalidated_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    // Sign out the target user via Supabase Admin API
    // Note: This requires service role access in production
    // For now, we record the invalidation and the client checks on next request
    await supabase.from('notifications').insert({
      organization_id: membership.organization_id,
      user_id: target_user_id,
      type: 'session_invalidated',
      title: 'Session Expired',
      message: `Your session has been invalidated: ${reason}. Please sign in again.`,
      data: { invalidation_id: invalidation.id, reason },
      entity_type: 'session_invalidation',
      entity_id: invalidation.id,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: 'session_invalidated',
      entity_type: 'user',
      entity_id: target_user_id,
      new_values: { reason },
    });

    return apiSuccess(invalidation, { message: 'Session invalidated' });
  } catch (e) {
    captureError(e, 'api.auth.session-invalidation.error');
    return serverError('Failed to invalidate session');
  }
}

/**
 * GET /api/auth/session-invalidation
 * Check if the current user's session has been invalidated
 */
export async function GET() {
  try {
    const auth = await requireRole(['owner', 'admin', 'manager', 'team', 'contractor', 'client', 'vendor']);
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { data, error } = await supabase
      .from('session_invalidations')
      .select('*')
      .eq('user_id', user.id)
      .order('invalidated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return supabaseError(error);
    }

    const isInvalidated = data && new Date(data.invalidated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

    return apiSuccess({
      invalidated: !!isInvalidated,
      invalidation: isInvalidated ? data : null,
    });
  } catch (e) {
    captureError(e, 'api.auth.session-invalidation.error');
    return serverError('Failed to check session');
  }
}
