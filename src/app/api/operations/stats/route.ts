import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase, membership } = auth;

    const orgId = membership.organization_id;
    if (!orgId) {
      return apiSuccess({ activeShows: 0, openIncidents: 0, workOrders: 0, activeVenues: 0 });
    }

    const [showsRes, incidentsRes, workOrdersRes, venuesRes] = await Promise.all([
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active'),
      supabase
        .from('incidents')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['open', 'in_progress']),
      supabase
        .from('work_orders')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['open', 'in_progress']),
      supabase
        .from('venues')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('is_active', true),
    ]);

    return apiSuccess({
      activeShows: showsRes.count ?? 0,
      openIncidents: incidentsRes.count ?? 0,
      workOrders: workOrdersRes.count ?? 0,
      activeVenues: venuesRes.count ?? 0,
    });
  } catch (error) {
    captureError(error, 'api.operations.stats.error');
    return serverError('Failed to load operations statistics');
  }
}
