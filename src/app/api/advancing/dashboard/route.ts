import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;

  const eventId = searchParams.get('eventId');

  // Get dashboard metrics from the view
  let metricsQuery = supabase
    .from('advance_dashboard_metrics')
    .select('*');

  if (eventId) {
    metricsQuery = metricsQuery.eq('event_id', eventId);
  }

  const { data: metrics, error: metricsError } = await metricsQuery;

  if (metricsError) {
    return supabaseError(metricsError);
  }

  // Get critical path items that are not complete
  let criticalQuery = supabase
    .from('advance_items')
    .select(`
      id,
      item_name,
      status,
      scheduled_delivery,
      location,
      vendor:companies(id, name),
      production_advance:production_advances(id, advance_code, event_id)
    `)
    .eq('is_critical_path', true)
    .not('status', 'eq', 'complete')
    .order('scheduled_delivery', { ascending: true })
    .limit(10);

  if (eventId) {
    criticalQuery = criticalQuery.eq('production_advance.event_id', eventId);
  }

  const { data: criticalItems } = await criticalQuery;

  // Get items due in next 48 hours
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const upcomingQuery = supabase
    .from('advance_items')
    .select(`
      id,
      item_name,
      status,
      scheduled_delivery,
      location,
      vendor:companies(id, name)
    `)
    .gte('scheduled_delivery', now.toISOString())
    .lte('scheduled_delivery', in48Hours.toISOString())
    .not('status', 'in', '(complete,cancelled)')
    .order('scheduled_delivery', { ascending: true })
    .limit(10);

  const { data: upcomingDeliveries } = await upcomingQuery;

  // Get status distribution
  const { data: statusCounts } = await supabase
    .from('advance_items')
    .select('status')
    .then(result => {
      if (!result.data) return { data: [] };
      const counts: Record<string, number> = {};
      result.data.forEach(item => {
        counts[item.status] = (counts[item.status] || 0) + 1;
      });
      return { data: Object.entries(counts).map(([status, count]) => ({ status, count })) };
    });

  // Get category distribution
  const { data: categoryCounts } = await supabase
    .from('advance_items_with_totals')
    .select('category_code, category_name')
    .then(result => {
      if (!result.data) return { data: [] };
      const counts: Record<string, { name: string; count: number }> = {};
      result.data.forEach(item => {
        const code = item.category_code?.split('.')[0] || 'uncategorized';
        if (!counts[code]) {
          counts[code] = { name: item.category_name || code, count: 0 };
        }
        counts[code].count++;
      });
      return { data: Object.entries(counts).map(([code, data]) => ({ code, ...data })) };
    });

  // Aggregate metrics
  const aggregatedMetrics = {
    totalAdvances: metrics?.length || 0,
    totalItems: metrics?.reduce((sum, m) => sum + (m.total_items || 0), 0) || 0,
    completedItems: metrics?.reduce((sum, m) => sum + (m.completed_items || 0), 0) || 0,
    criticalPending: metrics?.reduce((sum, m) => sum + (m.critical_pending || 0), 0) || 0,
    totalBudget: metrics?.reduce((sum, m) => sum + parseFloat(m.total_budget || 0), 0) || 0,
    confirmedBudget: metrics?.reduce((sum, m) => sum + parseFloat(m.confirmed_budget || 0), 0) || 0,
  };

  return apiSuccess({
    metrics: aggregatedMetrics,
    advances: metrics,
    criticalItems: criticalItems || [],
    upcomingDeliveries: upcomingDeliveries || [],
    statusDistribution: statusCounts || [],
    categoryDistribution: categoryCounts || [],
  });
}
