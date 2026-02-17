import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { target_type, target_id, emoji } = body;

    if (!target_type || !target_id || !emoji) {
      return badRequest('target_type, target_id, and emoji are required');
    }

    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id);
      return apiSuccess({ action: 'removed' });
    }

    const { data: reaction, error: insertError } = await supabase
      .from('reactions')
      .insert({
        user_id: user.id,
        target_type,
        target_id,
        emoji,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    return apiSuccess(reaction, { action: 'added' });
  } catch (error) {
    captureError(error, 'api.reactions.error');
    return serverError('Failed to process reactions');
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { searchParams } = new URL(request.url);
    const target_type = searchParams.get('target_type');
    const target_id = searchParams.get('target_id');

    if (!target_type || !target_id) {
      return badRequest('target_type and target_id are required');
    }

    const { data: reactions, error } = await supabase
      .from('reactions')
      .select('emoji, user_id')
      .eq('target_type', target_type)
      .eq('target_id', target_id);

    if (error) {
      return supabaseError(error);
    }

    const grouped = reactions.reduce((acc: Record<string, number>, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    return apiSuccess(grouped, { total: reactions.length });
  } catch (error) {
    captureError(error, 'api.reactions.error');
    return serverError('Failed to process reactions');
  }
}
