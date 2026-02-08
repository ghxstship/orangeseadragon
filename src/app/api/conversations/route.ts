import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const { participant_ids, name, type = 'direct' } = body;

    if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
      return badRequest('participant_ids is required and must be a non-empty array');
    }

    const allParticipants = Array.from(new Set([user.id, ...participant_ids]));

    if (type === 'direct' && allParticipants.length === 2) {
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('type', 'direct')
        .contains('participant_ids', allParticipants)
        .single();

      if (existing) {
        return apiSuccess(existing, { existing: true });
      }
    }

    const { data: conversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        type,
        name: type === 'group' ? name : null,
        participant_ids: allParticipants,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    return apiCreated(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const archived = searchParams.get('archived') === 'true';

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [user.id])
      .eq('is_archived', archived)
      .order('last_message_at', { ascending: false });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return serverError();
  }
}
