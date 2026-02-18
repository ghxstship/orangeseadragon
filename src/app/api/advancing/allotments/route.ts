import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/advancing/allotments
 * List advance item allotments with budget and fulfillment data.
 * Aggregates from advance_items joined with production_advances and categories.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const advanceId = searchParams.get('advanceId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    let query = supabase
      .from('advance_items')
      .select(`
        id,
        item_name,
        status,
        quantity_required,
        quantity_confirmed,
        estimated_cost,
        actual_cost,
        production_advance_id,
        platform_catalog_item_id,
        platform_catalog_category_id,
        platform_catalog_category:platform_catalog_categories(id, slug, name, icon, color),
        platform_catalog_item:platform_catalog_items(id, slug, name, icon, unit_of_measure, platform_catalog_categories(id, slug, name, color)),
        production_advance:production_advances(id, advance_code, event_id, status)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      query = query.ilike('item_name', `%${search}%`);
    }
    if (advanceId) {
      query = query.eq('production_advance_id', advanceId);
    }

    const { data: items, error, count } = await query;
    if (error) return supabaseError(error);

    // Transform into allotment shape expected by the frontend
    const allotments = (items || [])
      .filter((item) => {
        if (!category) return true;
        const cat = Array.isArray(item.platform_catalog_category) ? item.platform_catalog_category[0] : item.platform_catalog_category;
        return cat?.name?.toLowerCase() === category.toLowerCase() ||
               cat?.slug?.toLowerCase().startsWith(category.toLowerCase());
      })
      .map((item) => {
        const advance = Array.isArray(item.production_advance)
          ? item.production_advance[0]
          : item.production_advance;
        const cat = Array.isArray(item.platform_catalog_category)
          ? item.platform_catalog_category[0]
          : item.platform_catalog_category;

        const qtyAllotted = item.quantity_required || 0;
        const qtyFulfilled = item.quantity_confirmed || 0;
        const budgetAllotted = item.estimated_cost || 0;
        const budgetSpent = item.actual_cost || 0;

        let status: string = 'pending';
        if (qtyFulfilled >= qtyAllotted && qtyAllotted > 0) {
          status = budgetSpent > budgetAllotted ? 'over_allocated' : 'fulfilled';
        } else if (qtyFulfilled > 0) {
          status = 'partial';
        }

        return {
          id: item.id,
          advance_id: item.production_advance_id,
          advance_code: advance?.advance_code || '—',
          item_name: item.item_name,
          category: cat?.name || 'Uncategorized',
          quantity_allotted: qtyAllotted,
          quantity_fulfilled: qtyFulfilled,
          budget_allotted: budgetAllotted,
          budget_spent: budgetSpent,
          status,
          assigned_event: advance?.event_id || '',
        };
      });

    return apiSuccess(allotments, { total: count || allotments.length, page, pageSize });
  } catch (err) {
    captureError(err, 'api.advancing.allotments.error');
    return serverError('Failed to fetch allotments');
  }
}
