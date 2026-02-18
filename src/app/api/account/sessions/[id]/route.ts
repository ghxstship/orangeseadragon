// /app/api/account/sessions/[id]/route.ts
// Revoke a specific session

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { id } = await params;
    if (!id) return badRequest('Session ID is required');

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return serverError('Failed to revoke session');
    }

    return apiSuccess({ revoked: true });
  } catch (err) {
    captureError(err, 'api.account.sessions.revoke.error');
    return serverError('Failed to revoke session');
  }
}
