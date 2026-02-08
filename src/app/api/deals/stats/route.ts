import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

const DEFAULT_ROTTING_DAYS = 7;

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { searchParams } = new URL(request.url);
    
    const pipelineId = searchParams.get('pipeline_id');

    // Build base query
    let dealsQuery = supabase
      .from('deals')
      .select('id, name, value, stage, probability, pipeline_id, last_activity_at, created_at, won_at, lost_at');

    if (pipelineId) {
      dealsQuery = dealsQuery.eq('pipeline_id', pipelineId);
    }

    const { data: deals, error } = await dealsQuery;

    if (error) {
      console.error('Error fetching deals:', error);
      return supabaseError(error);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate stats
    const activeDeals = (deals || []).filter(
      d => d.stage !== 'closed-won' && d.stage !== 'closed-lost'
    );

    const totalDeals = activeDeals.length;
    const totalValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const weightedValue = activeDeals.reduce((sum, d) => {
      const prob = Number(d.probability) || 0;
      const val = Number(d.value) || 0;
      return sum + (val * prob / 100);
    }, 0);

    // Rotting deals
    const rottingDeals = activeDeals.filter(d => {
      if (!d.last_activity_at) return true;
      const lastActivity = new Date(d.last_activity_at);
      const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / 86400000);
      return daysSince > DEFAULT_ROTTING_DAYS;
    }).length;

    // Average days in pipeline
    const avgDaysInPipeline = activeDeals.length > 0
      ? Math.round(
          activeDeals.reduce((sum, d) => {
            const created = new Date(d.created_at);
            return sum + Math.floor((now.getTime() - created.getTime()) / 86400000);
          }, 0) / activeDeals.length
        )
      : 0;

    // Won/Lost this month
    const wonThisMonth = (deals || []).filter(
      d => d.stage === 'closed-won' && d.won_at && new Date(d.won_at) >= startOfMonth
    ).length;

    const lostThisMonth = (deals || []).filter(
      d => d.stage === 'closed-lost' && d.lost_at && new Date(d.lost_at) >= startOfMonth
    ).length;

    // Win rate (last 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);
    const closedRecently = (deals || []).filter(d => {
      const closedAt = d.won_at || d.lost_at;
      return closedAt && new Date(closedAt) >= ninetyDaysAgo;
    });
    const wonRecently = closedRecently.filter(d => d.stage === 'closed-won').length;
    const winRate = closedRecently.length > 0
      ? Math.round((wonRecently / closedRecently.length) * 100)
      : 0;

    // By stage breakdown
    const stageGroups: Record<string, { count: number; value: number }> = {};
    activeDeals.forEach(d => {
      const stage = d.stage || 'unknown';
      if (!stageGroups[stage]) {
        stageGroups[stage] = { count: 0, value: 0 };
      }
      stageGroups[stage].count++;
      stageGroups[stage].value += Number(d.value) || 0;
    });

    const byStage = Object.entries(stageGroups).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value,
    }));

    return apiSuccess({
      totalDeals,
      totalValue,
      weightedValue,
      rottingDeals,
      avgDaysInPipeline,
      wonThisMonth,
      lostThisMonth,
      winRate,
      byStage,
    });
  } catch (error) {
    console.error('Error in deals stats API:', error);
    return serverError();
  }
}
