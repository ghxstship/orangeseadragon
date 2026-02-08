import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;

  const eventId = searchParams.get('eventId');
  const status = searchParams.get('status');
  const advanceType = searchParams.get('advanceType');
  const assignedTo = searchParams.get('assignedTo');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');

  let query = supabase
    .from('production_advances')
    .select(`
      *,
      event:events(id, name, start_date),
      assigned_user:users!production_advances_assigned_to_fkey(id, full_name, avatar_url),
      created_by_user:users!production_advances_created_by_fkey(id, full_name)
    `, { count: 'exact' })
    .is('deleted_at', null);

  if (eventId) query = query.eq('event_id', eventId);
  if (status) query = query.eq('status', status);
  if (advanceType) query = query.eq('advance_type', advanceType);
  if (assignedTo) query = query.eq('assigned_to', assignedTo);
  if (search) query = query.ilike('advance_code', `%${search}%`);

  query = query
    .order('due_date', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  return apiSuccess({
    records: data,
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await request.json();

    const insertData = {
      ...body,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('production_advances')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiCreated(data);
  } catch {
    return badRequest('Invalid request body');
  }
}
