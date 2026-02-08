import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

/**
 * GET /api/deals/analytics/win-loss
 * Win/loss analytics with reason code breakdown
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('organization_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const pipelineId = searchParams.get('pipeline_id');

    // Fetch all closed deals
    let query = supabase
      .from('deals')
      .select('id, name, value, currency, status, won_at, lost_at, loss_reason_code, win_reason_code, competitor_name, pipeline_id, stage_id, owner_id, created_at')
      .is('deleted_at', null);

    if (orgId) query = query.eq('organization_id', orgId);
    if (pipelineId) query = query.eq('pipeline_id', pipelineId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: deals, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    const allDeals = deals || [];

    // Categorize deals
    const wonDeals = allDeals.filter((d: Record<string, unknown>) => d.won_at);
    const lostDeals = allDeals.filter((d: Record<string, unknown>) => d.lost_at && !d.won_at);
    const openDeals = allDeals.filter((d: Record<string, unknown>) => !d.won_at && !d.lost_at);

    // Win reason breakdown
    const winReasons: Record<string, { count: number; total_value: number }> = {};
    for (const deal of wonDeals) {
      const d = deal as Record<string, unknown>;
      const code = (d.win_reason_code as string) || 'unspecified';
      if (!winReasons[code]) winReasons[code] = { count: 0, total_value: 0 };
      winReasons[code].count++;
      winReasons[code].total_value += (d.value as number) || 0;
    }

    // Loss reason breakdown
    const lossReasons: Record<string, { count: number; total_value: number }> = {};
    for (const deal of lostDeals) {
      const d = deal as Record<string, unknown>;
      const code = (d.loss_reason_code as string) || 'unspecified';
      if (!lossReasons[code]) lossReasons[code] = { count: 0, total_value: 0 };
      lossReasons[code].count++;
      lossReasons[code].total_value += (d.value as number) || 0;
    }

    // Competitor breakdown
    const competitors: Record<string, { count: number; total_value: number }> = {};
    for (const deal of lostDeals) {
      const d = deal as Record<string, unknown>;
      const name = (d.competitor_name as string) || 'unknown';
      if (!competitors[name]) competitors[name] = { count: 0, total_value: 0 };
      competitors[name].count++;
      competitors[name].total_value += (d.value as number) || 0;
    }

    // Calculate metrics
    const totalWonValue = wonDeals.reduce((sum, d) => sum + ((d as Record<string, unknown>).value as number || 0), 0);
    const totalLostValue = lostDeals.reduce((sum, d) => sum + ((d as Record<string, unknown>).value as number || 0), 0);
    const winRate = allDeals.length > 0
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
      : 0;

    // Average deal cycle time (days from created to won/lost)
    const cycleTimes = [...wonDeals, ...lostDeals].map(d => {
      const deal = d as Record<string, unknown>;
      const created = new Date(deal.created_at as string);
      const closed = new Date((deal.won_at || deal.lost_at) as string);
      return Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });
    const avgCycleTime = cycleTimes.length > 0
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
      : 0;

    return apiSuccess({
      summary: {
        total_deals: allDeals.length,
        won: wonDeals.length,
        lost: lostDeals.length,
        open: openDeals.length,
        win_rate: Math.round(winRate * 100) / 100,
        total_won_value: totalWonValue,
        total_lost_value: totalLostValue,
        avg_cycle_time_days: avgCycleTime,
      },
      win_reasons: Object.entries(winReasons)
        .map(([code, data]) => ({ code, ...data }))
        .sort((a, b) => b.count - a.count),
      loss_reasons: Object.entries(lossReasons)
        .map(([code, data]) => ({ code, ...data }))
        .sort((a, b) => b.count - a.count),
      competitors: Object.entries(competitors)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (e) {
    console.error('[API] Win/loss analytics error:', e);
    return serverError('Failed to generate win/loss analytics');
  }
}
