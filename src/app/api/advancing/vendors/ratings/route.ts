import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    records: data,
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  try {
    const body = await request.json();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const insertData = {
      ...body,
      rated_by: userId,
      rated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vendor_ratings')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
