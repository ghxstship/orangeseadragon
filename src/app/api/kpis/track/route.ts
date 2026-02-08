import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/kpis/track
 * 
 * Record a KPI value snapshot. Compares against target and thresholds
 * to determine status (on_track, warning, critical, exceeded).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { kpi_definition_id, value, period_start, period_end } = await request.json();

    if (!kpi_definition_id || value === undefined) {
      return badRequest('kpi_definition_id and value are required');
    }

    // Fetch the KPI definition to evaluate thresholds
    const { data: kpiDef, error: fetchError } = await supabase
      .from('kpi_definitions')
      .select('*')
      .eq('id', kpi_definition_id)
      .single();

    if (fetchError || !kpiDef) {
      return notFound('KPI definition');
    }

    // Determine status based on thresholds
    let status = 'on_track';
    const numValue = Number(value);
    const target = Number(kpiDef.target_value);
    const warning = kpiDef.warning_threshold ? Number(kpiDef.warning_threshold) : null;
    const critical = kpiDef.critical_threshold ? Number(kpiDef.critical_threshold) : null;

    if (kpiDef.trend_direction === 'up') {
      // Higher is better
      if (numValue >= target) status = 'exceeded';
      else if (critical !== null && numValue <= critical) status = 'critical';
      else if (warning !== null && numValue <= warning) status = 'warning';
    } else {
      // Lower is better
      if (numValue <= target) status = 'exceeded';
      else if (critical !== null && numValue >= critical) status = 'critical';
      else if (warning !== null && numValue >= warning) status = 'warning';
    }

    // Calculate trend from previous entry
    const { data: previousEntries } = await supabase
      .from('kpi_history')
      .select('value')
      .eq('kpi_definition_id', kpi_definition_id)
      .order('recorded_at', { ascending: false })
      .limit(1);

    let trend_direction: string | null = null;
    let trend_percentage: number | null = null;

    if (previousEntries && previousEntries.length > 0) {
      const prevValue = Number(previousEntries[0].value);
      if (prevValue !== 0) {
        trend_percentage = ((numValue - prevValue) / Math.abs(prevValue)) * 100;
        trend_direction = numValue > prevValue ? 'up' : numValue < prevValue ? 'down' : 'flat';
      }
    }

    // Insert KPI history entry
    const { data: historyEntry, error: insertError } = await supabase
      .from('kpi_history')
      .insert({
        kpi_definition_id,
        value: numValue,
        target_value: target,
        status,
        period_start: period_start || null,
        period_end: period_end || null,
        trend_direction,
        trend_percentage,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    // Update the KPI definition with current value
    await supabase
      .from('kpi_definitions')
      .update({
        current_value: numValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', kpi_definition_id);

    return apiCreated({
      ...historyEntry,
      kpi_name: kpiDef.name,
      status,
      trend_direction,
      trend_percentage,
    });
  } catch (error) {
    console.error('Error tracking KPI:', error);
    return serverError();
  }
}

/**
 * GET /api/kpis/track
 * 
 * Get KPI history for a specific definition with trend data.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('kpi_definition_id');
    const limit = parseInt(searchParams.get('limit') || '30');

    if (!kpiId) {
      return badRequest('kpi_definition_id query param is required');
    }

    const { data: history, error } = await supabase
      .from('kpi_history')
      .select('*')
      .eq('kpi_definition_id', kpiId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(history);
  } catch (error) {
    console.error('Error fetching KPI history:', error);
    return serverError();
  }
}
