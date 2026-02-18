import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError, supabaseError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const divisionSlug = request.nextUrl.searchParams.get('division');
    const includeItems = request.nextUrl.searchParams.get('include') === 'items';

    let query = supabase
      .from('platform_catalog_categories')
      .select(includeItems
        ? 'id,slug,name,description,icon,color,sort_order,is_active,division_id,platform_catalog_divisions!inner(slug,name),platform_catalog_items(id,slug,name,description,icon,image_url,default_unit_cost,default_rental_rate,currency,unit_of_measure,is_rentable,is_purchasable,is_service,sort_order,is_active)'
        : 'id,slug,name,description,icon,color,sort_order,is_active,division_id,platform_catalog_divisions!inner(slug,name)'
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (divisionSlug) {
      query = query.eq('platform_catalog_divisions.slug', divisionSlug);
    }

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data ?? []);
  } catch (err) {
    captureError(err, 'api.platform-catalog.categories.error');
    return serverError('Failed to fetch catalog categories');
  }
}
