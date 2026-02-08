import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const target_type = searchParams.get('target_type');

    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (target_type) {
      query = query.eq('target_type', target_type);
    }

    const { data: activities, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const { action, target_type, target_id, target_title, target_url, metadata, visibility = 'connections' } = body;

    if (!action || !target_type || !target_id) {
      return badRequest('Missing required fields: action, target_type, target_id');
    }

    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert({
        actor_id: user.id,
        action,
        target_type,
        target_id,
        target_title,
        target_url,
        metadata,
        visibility,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    return apiCreated(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return serverError();
  }
}
