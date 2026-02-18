import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError, supabaseError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const categorySlug = request.nextUrl.searchParams.get('category');
    const divisionSlug = request.nextUrl.searchParams.get('division');
    const search = request.nextUrl.searchParams.get('search');
    const rentableOnly = request.nextUrl.searchParams.get('rentable') === 'true';
    const servicesOnly = request.nextUrl.searchParams.get('services') === 'true';

    let query = supabase
      .from('platform_catalog_items')
      .select('id,slug,name,description,icon,image_url,default_unit_cost,default_rental_rate,currency,unit_of_measure,is_rentable,is_purchasable,is_service,specifications,tags,sort_order,is_active,category_id,platform_catalog_categories!inner(id,slug,name,icon,color,division_id,platform_catalog_divisions!inner(id,slug,name))')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (categorySlug) {
      query = query.eq('platform_catalog_categories.slug', categorySlug);
    }

    if (divisionSlug) {
      query = query.eq('platform_catalog_categories.platform_catalog_divisions.slug', divisionSlug);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (rentableOnly) {
      query = query.eq('is_rentable', true);
    }

    if (servicesOnly) {
      query = query.eq('is_service', true);
    }

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data ?? []);
  } catch (err) {
    captureError(err, 'api.platform-catalog.items.error');
    return serverError('Failed to fetch catalog items');
  }
}
