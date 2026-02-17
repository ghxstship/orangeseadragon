// /app/api/invitations/batch/route.ts
// Batch invite users to the organization

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const body = await request.json();

    // Support both payload shapes:
    //   Legacy:  { emails: string[], roleId: string, message?: string }
    //   Current: { invites: [{ email: string, role?: string }] }
    let emailRolePairs: Array<{ email: string; role_id: string | null }>;

    if (Array.isArray(body.invites) && body.invites.length > 0) {
      emailRolePairs = body.invites.map((inv: { email: string; role?: string }) => ({
        email: inv.email,
        role_id: inv.role || null,
      }));
    } else if (Array.isArray(body.emails) && body.emails.length > 0) {
      emailRolePairs = body.emails.map((email: string) => ({
        email,
        role_id: body.roleId || null,
      }));
    } else {
      return badRequest('Either "invites" array or "emails" array is required');
    }

    const orgId = membership.organization_id;
    if (!orgId) return badRequest('User has no organization');

    const message = body.message || null;

    const invitations = emailRolePairs.map(({ email, role_id }) => ({
      organization_id: orgId,
      email: email.trim().toLowerCase(),
      role_id,
      invited_by: user.id,
      message,
      status: 'pending',
      token: crypto.randomUUID(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { data, error } = await supabase
      .from('invitations')
      .insert(invitations)
      .select('id, email, status');

    if (error) return supabaseError(error);

    return apiSuccess({ invited: data?.length || 0, invitations: data || [] });
  } catch (err) {
    captureError(err, 'api.invitations.batch.error');
    return serverError('Failed to send invitations');
  }
}
