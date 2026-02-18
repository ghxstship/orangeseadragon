import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/advancing/assignments
 * List inventory/asset assignments linked to advances.
 * Joins advance_items with assignee info to produce the shape expected by the frontend.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const assigneeType = searchParams.get('assignee_type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    let query = supabase
      .from('advance_items')
      .select(`
        id,
        item_name,
        status,
        assigned_to,
        vendor_id,
        scheduled_delivery,
        actual_delivery,
        created_at,
        notes,
        platform_catalog_category:platform_catalog_categories(id, slug, name, icon, color),
        platform_catalog_item:platform_catalog_items(id, slug, name, icon, unit_of_measure, platform_catalog_categories(id, slug, name, color)),
        production_advance:production_advances(id, advance_code, event_id),
        assigned_user:users!advance_items_assigned_to_fkey(id, full_name, avatar_url),
        vendor:companies(id, name)
      `, { count: 'exact' })
      .not('assigned_to', 'is', null)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      query = query.ilike('item_name', `%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: items, error, count } = await query;
    if (error) return supabaseError(error);

    // Transform into assignment shape expected by the frontend
    const assignments = (items || [])
      .filter((_item) => {
        if (!assigneeType || assigneeType === 'all') return true;
        // Default all to 'user' type since advance_items assigns to users
        return assigneeType === 'user';
      })
      .map((item) => {
        const advance = Array.isArray(item.production_advance)
          ? item.production_advance[0]
          : item.production_advance;
        const assignedUser = Array.isArray(item.assigned_user)
          ? item.assigned_user[0]
          : item.assigned_user;
        const cat = Array.isArray(item.platform_catalog_category)
          ? item.platform_catalog_category[0]
          : item.platform_catalog_category;
        const vendor = Array.isArray(item.vendor)
          ? item.vendor[0]
          : item.vendor;

        // Map advance item status to assignment status
        let assignmentStatus: string = 'active';
        if (item.status === 'returned' || item.status === 'complete') {
          assignmentStatus = 'returned';
        } else if (item.status === 'cancelled') {
          assignmentStatus = 'lost';
        } else if (item.status === 'struck') {
          assignmentStatus = 'pending_return';
        }

        return {
          id: item.id,
          asset_id: item.id,
          asset_name: item.item_name,
          asset_category: cat?.name || 'Uncategorized',
          assignee_type: vendor ? 'company' : 'user',
          assignee_id: item.assigned_to || vendor?.id || '',
          assignee_name: assignedUser?.full_name || vendor?.name || 'Unassigned',
          advance_code: advance?.advance_code,
          event_name: advance?.event_id || undefined,
          status: assignmentStatus,
          assigned_at: item.created_at,
          due_back_at: item.scheduled_delivery || undefined,
          returned_at: item.actual_delivery || undefined,
          notes: item.notes || undefined,
        };
      });

    return apiSuccess(assignments, { total: count || assignments.length, page, pageSize });
  } catch (err) {
    captureError(err, 'api.advancing.assignments.error');
    return serverError('Failed to fetch assignments');
  }
}
