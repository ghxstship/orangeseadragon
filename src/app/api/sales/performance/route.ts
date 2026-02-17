import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiPaginated, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import type { Database } from '@/types/database';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

type DealPerformanceRow = Pick<
  Database['public']['Tables']['deals']['Row'],
  'id' | 'value' | 'stage' | 'owner_id' | 'lost_reason' | 'created_at' | 'actual_close_date'
>;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/**
 * G12: Sales rep performance analytics.
 * Returns per-rep metrics: deals closed, revenue won, win rate, loss reasons.
 */
export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  const page = parsePositiveInt(_request.nextUrl.searchParams.get('page'), DEFAULT_PAGE);
  const limit = Math.min(
    parsePositiveInt(_request.nextUrl.searchParams.get('limit'), DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const requestContext = extractRequestContext(_request.headers);

  try {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, value, stage, owner_id, lost_reason, created_at, actual_close_date')
      .eq('organization_id', membership.organization_id);

    if (error) return supabaseError(error);

    const typedDeals: DealPerformanceRow[] = deals ?? [];

    const repMap = new Map<string, {
      repId: string;
      totalDeals: number;
      wonDeals: number;
      lostDeals: number;
      revenueWon: number;
      totalValue: number;
      lossReasons: Record<string, number>;
      avgDaysToClose: number;
      closeDays: number[];
    }>();

    for (const deal of typedDeals) {
      const repId = deal.owner_id ?? 'unassigned';
      if (!repMap.has(repId)) {
        repMap.set(repId, {
          repId,
          totalDeals: 0,
          wonDeals: 0,
          lostDeals: 0,
          revenueWon: 0,
          totalValue: 0,
          lossReasons: {},
          avgDaysToClose: 0,
          closeDays: [],
        });
      }

      const rep = repMap.get(repId)!;
      rep.totalDeals++;
      rep.totalValue += Number(deal.value ?? 0);

      const stage = String(deal.stage ?? '').toLowerCase();
      if (stage === 'won' || stage === 'closed_won') {
        rep.wonDeals++;
        rep.revenueWon += Number(deal.value ?? 0);
        if (deal.created_at && deal.actual_close_date) {
          const days = Math.floor(
            (new Date(deal.actual_close_date).getTime() - new Date(deal.created_at).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (Number.isFinite(days) && days >= 0) {
            rep.closeDays.push(days);
          }
        }
      } else if (stage === 'lost' || stage === 'closed_lost') {
        rep.lostDeals++;
        const reason = deal.lost_reason || 'Unknown';
        rep.lossReasons[reason] = (rep.lossReasons[reason] || 0) + 1;
      }
    }

    const results = Array.from(repMap.values()).map((rep) => ({
      repId: rep.repId,
      totalDeals: rep.totalDeals,
      wonDeals: rep.wonDeals,
      lostDeals: rep.lostDeals,
      revenueWon: rep.revenueWon,
      totalValue: rep.totalValue,
      winRate: rep.totalDeals > 0 ? Math.round((rep.wonDeals / rep.totalDeals) * 100) : 0,
      avgDaysToClose: rep.closeDays.length > 0 ? Math.round(rep.closeDays.reduce((a, b) => a + b, 0) / rep.closeDays.length) : 0,
      lossReasons: rep.lossReasons,
    })).sort((a, b) => b.revenueWon - a.revenueWon);

    const from = (page - 1) * limit;
    const paginated = results.slice(from, from + limit);

    return apiPaginated(paginated, {
      page,
      limit,
      total: results.length,
    });
  } catch (err) {
    if (isSupabaseError(err)) {
      return supabaseError(err);
    }

    captureError(err, 'api.sales.performance.unhandled_error', {
      organization_id: membership.organization_id,
      ...requestContext,
    });
    return serverError('Failed to fetch sales performance');
  }
}
