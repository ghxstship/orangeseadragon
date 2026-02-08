import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;

  const vendorId = searchParams.get('vendorId');
  const eventId = searchParams.get('eventId');
  const advanceItemId = searchParams.get('advanceItemId');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');

  let query = supabase
    .from('vendor_ratings')
    .select(`
      *,
      vendor:companies(id, name),
      event:events(id, name),
      advance_item:advance_items(id, item_name),
      rated_by_user:users!vendor_ratings_rated_by_fkey(id, full_name, avatar_url)
    `, { count: 'exact' });

  if (vendorId) query = query.eq('vendor_id', vendorId);
  if (eventId) query = query.eq('event_id', eventId);
  if (advanceItemId) query = query.eq('advance_item_id', advanceItemId);

  query = query
    .order('rated_at', { ascending: false })
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
      rated_by: user.id,
      rated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vendor_ratings')
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
