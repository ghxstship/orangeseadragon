import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const advanceItemId = searchParams.get('advanceItemId');
  const fulfillmentStage = searchParams.get('fulfillmentStage');
  const assignedTo = searchParams.get('assignedTo');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');

  let query = supabase
    .from('advance_item_fulfillment')
    .select(`
      *,
      advance_item:advance_items(id, item_name, status, vendor_id),
      assigned_user:users!advance_item_fulfillment_assigned_to_fkey(id, full_name, avatar_url)
    `, { count: 'exact' });

  if (advanceItemId) query = query.eq('advance_item_id', advanceItemId);
  if (fulfillmentStage) query = query.eq('fulfillment_stage', fulfillmentStage);
  if (assignedTo) query = query.eq('assigned_to', assignedTo);

  query = query
    .order('stage_entered_at', { ascending: false })
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

    const insertData = {
      ...body,
      stage_entered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('advance_item_fulfillment')
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
