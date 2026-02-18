import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError } from '@/lib/api/response';

/**
 * GET /api/advancing/categories
 * Returns platform catalog categories (SSOT). Read-only.
 * Supports ?division=slug to filter by division.
 * Supports ?includeItems=true to nest catalog items.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;

  const divisionSlug = searchParams.get('division');
  const includeItems = searchParams.get('includeItems') === 'true';

  const selectFields = includeItems
    ? 'id,slug,name,description,icon,color,sort_order,is_active,division_id,platform_catalog_divisions!inner(id,slug,name),platform_catalog_items(id,slug,name,description,icon,image_url,default_unit_cost,unit_of_measure,is_rentable,is_purchasable,is_service,sort_order,is_active)'
    : 'id,slug,name,description,icon,color,sort_order,is_active,division_id,platform_catalog_divisions!inner(id,slug,name)';

  let query = supabase
    .from('platform_catalog_categories')
    .select(selectFields)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (divisionSlug) {
    query = query.eq('platform_catalog_divisions.slug', divisionSlug);
  }

  const { data, error } = await query;

  if (error) {
    return supabaseError(error);
  }

  return apiSuccess(data ?? [], { total: data?.length || 0 });
}
