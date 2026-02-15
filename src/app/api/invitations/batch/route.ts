// /app/api/invitations/batch/route.ts
// Batch invite users to the organization

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { emails, roleId, message } = await request.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return badRequest('emails array is required');
    }

    const orgId = user.user_metadata?.organization_id;
    if (!orgId) return badRequest('User has no organization');

    const invitations = emails.map((email: string) => ({
      organization_id: orgId,
      email: email.trim().toLowerCase(),
      role_id: roleId || null,
      invited_by: user.id,
      message: message || null,
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
    console.error('[Invitations Batch] error:', err);
    return serverError('Failed to send invitations');
  }
}
