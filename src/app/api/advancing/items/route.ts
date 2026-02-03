import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const productionAdvanceId = searchParams.get('productionAdvanceId');
  const categoryCode = searchParams.get('categoryCode');
  const categoryId = searchParams.get('categoryId');
  const vendorId = searchParams.get('vendorId');
  const status = searchParams.get('status');
  const isCriticalPath = searchParams.get('isCriticalPath');
  const assignedTo = searchParams.get('assignedTo');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');

  let query = supabase
    .from('advance_items')
    .select(`
      *,
      category:advance_categories(id, code, name, icon, color),
      vendor:companies(id, name),
      assigned_user:users!advance_items_assigned_to_fkey(id, full_name, avatar_url),
      production_advance:production_advances(id, advance_code, event_id, advance_type, status)
    `, { count: 'exact' });

  if (productionAdvanceId) query = query.eq('production_advance_id', productionAdvanceId);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (vendorId) query = query.eq('vendor_id', vendorId);
  if (status) query = query.eq('status', status);
  if (isCriticalPath === 'true') query = query.eq('is_critical_path', true);
  if (assignedTo) query = query.eq('assigned_to', assignedTo);
  if (search) query = query.ilike('item_name', `%${search}%`);

  // Filter by category code prefix (e.g., 'technical', 'logistics')
  if (categoryCode) {
    const { data: categories } = await supabase
      .from('advance_categories')
      .select('id')
      .ilike('code', `${categoryCode}%`);
    
    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id);
      query = query.in('category_id', categoryIds);
    }
  }

  query = query
    .order('scheduled_delivery', { ascending: true, nullsFirst: false })
    .order('is_critical_path', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute total_cost for each item
  const recordsWithTotals = (data || []).map(item => ({
    ...item,
    total_cost: (item.quantity_required || 0) * (item.unit_cost || 0),
    confirmed_cost: (item.quantity_confirmed || 0) * (item.unit_cost || 0),
  }));

  return NextResponse.json({
    records: recordsWithTotals,
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
      .from('advance_items')
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
