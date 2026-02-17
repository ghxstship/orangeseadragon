import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/client-portal/invite
 * 
 * Invite a client contact to the portal by creating access record
 * and generating a magic link token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact_id, company_id, organization_id, access_level, permissions } = body;

    if (!contact_id || !company_id || !organization_id) {
      return badRequest('contact_id, company_id, and organization_id are required');
    }

    const auth = await requirePolicy('entity.read', { orgId: organization_id });
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // Generate magic link token (expires in 7 days)
    const magicToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: portalAccess, error: insertError } = await supabase
      .from('client_portal_access')
      .upsert({
        organization_id,
        company_id,
        contact_id,
        access_level: access_level || 'viewer',
        magic_link_token: magicToken,
        magic_link_expires_at: expiresAt,
        is_active: true,
        can_view_budgets: permissions?.can_view_budgets ?? false,
        can_view_invoices: permissions?.can_view_invoices ?? true,
        can_view_tasks: permissions?.can_view_tasks ?? false,
        can_view_documents: permissions?.can_view_documents ?? true,
        can_view_reports: permissions?.can_view_reports ?? false,
        can_comment: permissions?.can_comment ?? true,
        can_approve: permissions?.can_approve ?? false,
        can_upload: permissions?.can_upload ?? false,
        custom_welcome_message: permissions?.custom_welcome_message || null,
        created_by: user.id,
      }, { onConflict: 'organization_id,contact_id' })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    // Log the activity
    await supabase.from('activities').insert({
      actor_id: user.id,
      action: 'client_portal_invite',
      target_type: 'client_portal_access',
      target_id: portalAccess.id,
      metadata: { contact_id, company_id, access_level: access_level || 'viewer' },
    });

    return apiSuccess({
      ...portalAccess,
      magic_link_token: magicToken,
      expires_at: expiresAt,
    });
  } catch (error) {
    captureError(error, 'api.client-portal.invite.error');
    return serverError('Failed to send client portal invitation');
  }
}
