import { NextRequest } from 'next/server';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';
import { createUntypedClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: token } = await params;
  const supabase = await createUntypedClient();

  try {
    const body = await request.json();
    const { name, password } = body;

    if (!name || !password) {
      return badRequest('name and password are required');
    }

    const { data: rawInvitation, error: fetchErr } = await supabase
      .from('invitations')
      .select('id, email, role_id, status, organization_id, expires_at')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (fetchErr || !rawInvitation) return notFound('Invitation');

    const invitation = rawInvitation as Record<string, unknown>;

    if (invitation.expires_at && new Date(String(invitation.expires_at)) < new Date()) {
      return badRequest('Invitation has expired');
    }

    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: String(invitation.email),
      password,
      options: {
        data: {
          full_name: name,
          organization_id: invitation.organization_id,
        },
      },
    });

    if (signUpErr) {
      return badRequest(signUpErr.message);
    }

    const { error: updateErr } = await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: authData.user?.id,
      })
      .eq('id', String(invitation.id));

    if (updateErr) return supabaseError(updateErr);

    return apiSuccess({
      accepted: true,
      user_id: authData.user?.id,
      organization_id: invitation.organization_id,
    });
  } catch (err) {
    captureError(err, 'api.invitations.accept.error');
    return serverError('Failed to accept invitation');
  }
}
