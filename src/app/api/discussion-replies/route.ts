import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { discussion_id, parent_reply_id, content } = body;

    if (!discussion_id || !content) {
      return badRequest('discussion_id and content are required');
    }

    const { data: reply, error: insertError } = await supabase
      .from('discussion_replies')
      .insert({
        discussion_id,
        parent_reply_id,
        author_id: user.id,
        content,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    await supabase.rpc('increment_reply_count', { discussion_id_param: discussion_id });

    if (parent_reply_id) {
      await supabase.rpc('increment_reply_count_for_reply', { reply_id_param: parent_reply_id });
    }

    return apiCreated(reply);
  } catch (error) {
    captureError(error, 'api.discussion-replies.error');
    return serverError('Failed to process discussion replies');
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { searchParams } = new URL(request.url);
    const discussion_id = searchParams.get('discussion_id');
    const parent_reply_id = searchParams.get('parent_reply_id');

    if (!discussion_id) {
      return badRequest('discussion_id is required');
    }

    let query = supabase
      .from('discussion_replies')
      .select('*')
      .eq('discussion_id', discussion_id)
      .order('created_at', { ascending: true });

    if (parent_reply_id) {
      query = query.eq('parent_reply_id', parent_reply_id);
    } else {
      query = query.is('parent_reply_id', null);
    }

    const { data: replies, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(replies);
  } catch (error) {
    captureError(error, 'api.discussion-replies.error');
    return serverError('Failed to process discussion replies');
  }
}
