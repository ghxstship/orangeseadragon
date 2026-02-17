import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError } from '@/lib/api/response';
import { forecastTimeSeries, forecastBudget, forecastRevenue } from '@/lib/services/predictive-forecasting';
import type { TimeSeriesPoint } from '@/lib/services/predictive-forecasting';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  const forecastType = searchParams.get('type') || 'revenue';
  const projectId = searchParams.get('projectId');
  const periods = parseInt(searchParams.get('periods') || '8');

  try {
    switch (forecastType) {
      case 'revenue': {
        // Fetch historical revenue data
        const { data: revenueData, error: revError } = await supabase
          .from('invoices')
          .select('total_amount, issued_date')
          .eq('status', 'paid')
          .order('issued_date', { ascending: true })
          .limit(52);

        if (revError) return supabaseError(revError);

        const historical: TimeSeriesPoint[] = aggregateWeekly(
          (revenueData || []).map((r: { total_amount: number; issued_date: string }) => ({
            date: r.issued_date,
            value: r.total_amount || 0,
          }))
        );

        // Get pipeline data for weighted forecast
        const { data: pipelineData } = await supabase
          .from('deals')
          .select('value, probability')
          .in('stage', ['proposal', 'negotiation', 'closing']);

        const pipelineValue = (pipelineData || []).reduce((sum: number, d: { value: number }) => sum + (d.value || 0), 0);
        const avgWinRate = (pipelineData || []).length > 0
          ? (pipelineData || []).reduce((sum: number, d: { probability: number }) => sum + (d.probability || 0), 0) / pipelineData!.length / 100
          : 0.35;

        const revenueForecast = forecastRevenue(historical, pipelineValue, avgWinRate, periods);
        const trendResult = forecastTimeSeries(historical, periods, 'Revenue');

        return apiSuccess({
          type: 'revenue',
          historical,
          forecast: revenueForecast,
          trend: trendResult.trend,
          trend_pct: trendResult.trend_pct,
          model_accuracy: trendResult.model_accuracy,
          summary: trendResult.summary,
          pipeline_value: pipelineValue,
          win_rate: Math.round(avgWinRate * 100),
        });
      }

      case 'budget': {
        if (!projectId) return badRequest('projectId is required for budget forecast');

        const { data: project, error: projError } = await supabase
          .from('projects')
          .select('id, name, budget, start_date, end_date')
          .eq('id', projectId)
          .single();

        if (projError) return supabaseError(projError);
        if (!project) return badRequest('Project not found');

        // Get expenses
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, category, created_at')
          .eq('project_id', projectId)
          .eq('status', 'approved');

        const spentTotal = (expenses || []).reduce((sum: number, e: { amount: number }) => sum + (e.amount || 0), 0);

        // Get committed (POs)
        const { data: pos } = await supabase
          .from('purchase_orders')
          .select('total_amount')
          .eq('project_id', projectId)
          .in('status', ['approved', 'sent']);

        const committed = (pos || []).reduce((sum: number, p: { total_amount: number }) => sum + (p.total_amount || 0), 0);

        // Calculate days
        const startDate = new Date(project.start_date || Date.now());
        const endDate = new Date(project.end_date || Date.now());
        const now = new Date();
        const daysElapsed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86400000));
        const daysTotal = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000));

        // Category breakdown
        const categoryMap = new Map<string, number>();
        for (const exp of (expenses || []) as { amount: number; category: string }[]) {
          categoryMap.set(exp.category || 'uncategorized', (categoryMap.get(exp.category || 'uncategorized') || 0) + (exp.amount || 0));
        }

        const defaultCategories = ['labor', 'equipment', 'venue', 'catering', 'transport', 'production', 'misc'];
        const budgetPerCategory = (project.budget || 0) / defaultCategories.length;
        const categoryData = defaultCategories.map((cat) => ({
          category: cat,
          budgeted: budgetPerCategory,
          actual: categoryMap.get(cat) || 0,
        }));

        const budgetForecast = forecastBudget(
          project.name,
          project.id,
          project.budget || 0,
          spentTotal,
          committed,
          daysElapsed,
          daysTotal,
          categoryData
        );

        return apiSuccess({ type: 'budget', ...budgetForecast });
      }

      case 'utilization': {
        // Resource utilization forecast
        const { data: assignments } = await supabase
          .from('crew_assignments')
          .select('user_id, start_time, end_time, created_at')
          .gte('start_time', new Date(Date.now() - 90 * 86400000).toISOString())
          .order('start_time', { ascending: true });

        const weeklyUtil = aggregateWeekly(
          (assignments || []).map((a: { start_time: string; end_time: string }) => {
            const hours = (new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 3600000;
            return { date: a.start_time.split('T')[0], value: Math.max(0, hours) };
          })
        );

        const utilForecast = forecastTimeSeries(weeklyUtil, periods, 'Resource Utilization (hours)');

        return apiSuccess({
          type: 'utilization',
          ...utilForecast,
        });
      }

      case 'expenses': {
        const { data: expenseData, error: expError } = await supabase
          .from('expenses')
          .select('amount, created_at, category')
          .eq('status', 'approved')
          .order('created_at', { ascending: true })
          .limit(200);

        if (expError) return supabaseError(expError);

        const weekly = aggregateWeekly(
          (expenseData || []).map((e: { amount: number; created_at: string }) => ({
            date: e.created_at.split('T')[0],
            value: e.amount || 0,
          }))
        );

        const expForecast = forecastTimeSeries(weekly, periods, 'Weekly Expenses');

        return apiSuccess({
          type: 'expenses',
          ...expForecast,
        });
      }

      default:
        return badRequest(`Unknown forecast type: ${forecastType}. Supported: revenue, budget, utilization, expenses`);
    }
  } catch (error) {
    captureError(error, 'analytics.forecast.error', { type: forecastType });
    return badRequest('Failed to generate forecast');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function aggregateWeekly(points: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (points.length === 0) return [];

  const weekMap = new Map<string, number>();
  for (const p of points) {
    const d = new Date(p.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];
    weekMap.set(key, (weekMap.get(key) || 0) + p.value);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: Math.round(value * 100) / 100 }));
}
