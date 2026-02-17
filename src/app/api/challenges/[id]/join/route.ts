import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { data: challenge, error: fetchError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !challenge) {
      return notFound('Challenge');
    }

    if (challenge.status !== 'active') {
      return badRequest('Challenge is not active');
    }

    const { data: existing } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return badRequest('Already participating in this challenge');
    }

    const { data: participant, error: insertError } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: id,
        user_id: user.id,
        status: 'registered',
        progress_percent: 0,
        score: 0,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    await supabase
      .from('challenges')
      .update({ participant_count: (challenge.participant_count || 0) + 1 })
      .eq('id', id);

    return apiSuccess(participant);
  } catch (error) {
    captureError(error, 'api.challenges.id.join.error');
    return serverError('Failed to join challenge');
  }
}
