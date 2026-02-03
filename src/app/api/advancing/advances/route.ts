import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
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
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('production_advances')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
