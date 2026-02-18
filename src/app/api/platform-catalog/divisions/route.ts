import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError, supabaseError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const includeCategories = request.nextUrl.searchParams.get('include') === 'categories';

    const query = supabase
      .from('platform_catalog_divisions')
      .select(includeCategories
        ? 'id,slug,name,description,icon,sort_order,is_active,platform_catalog_categories(id,slug,name,description,icon,color,sort_order,is_active)'
        : 'id,slug,name,description,icon,sort_order,is_active'
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data ?? []);
  } catch (err) {
    captureError(err, 'api.platform-catalog.divisions.error');
    return serverError('Failed to fetch catalog divisions');
  }
}
