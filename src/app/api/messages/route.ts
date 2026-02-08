import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, forbidden, supabaseError, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { conversation_id, content, message_type = 'text', attachments } = body;

    if (!conversation_id || !content) {
      return badRequest('conversation_id and content are required');
    }

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant_ids')
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      return notFound('Conversation');
    }

    const participantIds = conversation.participant_ids as string[];
    if (!participantIds.includes(user.id)) {
      return forbidden('Not a participant in this conversation');
    }

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content,
        message_type,
        attachments,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: content.substring(0, 100),
      })
      .eq('id', conversation_id);

    return apiCreated(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const conversation_id = searchParams.get('conversation_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!conversation_id) {
      return badRequest('conversation_id is required');
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return serverError();
  }
}
