import { NextRequest } from 'next/server';
import { apiSuccess, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';
import { createUntypedClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: token } = await params;
  const supabase = await createUntypedClient();

  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('id, email, role_id, status, organization_id, expires_at, message')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (error) {
      return error.code === 'PGRST116' ? notFound('Invitation') : supabaseError(error);
    }

    const row = data as Record<string, unknown>;
    if (row.expires_at && new Date(String(row.expires_at)) < new Date()) {
      return notFound('Invitation has expired');
    }

    return apiSuccess(row);
  } catch (err) {
    captureError(err, 'api.invitations.get.error');
    return serverError('Failed to validate invitation');
  }
}
