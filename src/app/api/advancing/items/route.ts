import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
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
      platform_catalog_category:platform_catalog_categories(id, slug, name, icon, color),
      platform_catalog_item:platform_catalog_items(id, slug, name, description, icon, image_url, default_unit_cost, unit_of_measure, is_rentable, is_service, platform_catalog_categories(id, slug, name, icon, color, platform_catalog_divisions(id, slug, name))),
      vendor:companies(id, name),
      assigned_user:users!advance_items_assigned_to_fkey(id, full_name, avatar_url),
      production_advance:production_advances(id, advance_code, event_id, advance_type, status)
    `, { count: 'exact' });

  if (productionAdvanceId) query = query.eq('production_advance_id', productionAdvanceId);
  if (categoryId) query = query.eq('platform_catalog_category_id', categoryId);
  if (vendorId) query = query.eq('vendor_id', vendorId);
  if (status) query = query.eq('status', status);
  if (isCriticalPath === 'true') query = query.eq('is_critical_path', true);
  if (assignedTo) query = query.eq('assigned_to', assignedTo);
  if (search) query = query.ilike('item_name', `%${search}%`);

  // Filter by category slug prefix (e.g., 'audio', 'lighting')
  if (categoryCode) {
    const { data: categories } = await supabase
      .from('platform_catalog_categories')
      .select('id')
      .ilike('slug', `${categoryCode}%`);
    
    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id);
      query = query.in('platform_catalog_category_id', categoryIds);
    }
  }

  query = query
    .order('scheduled_delivery', { ascending: true, nullsFirst: false })
    .order('is_critical_path', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  // Compute total_cost for each item
  const recordsWithTotals = (data || []).map(item => ({
    ...item,
    total_cost: (item.quantity_required || 0) * (item.unit_cost || 0),
    confirmed_cost: (item.quantity_confirmed || 0) * (item.unit_cost || 0),
  }));

  return apiSuccess({
    records: recordsWithTotals,
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
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
      .from('advance_items')
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
