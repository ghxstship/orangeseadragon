import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError, supabaseError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

const HOURS_PER_MONTH = 160;
const AVG_REVENUE_PER_HOUR = 150;
const FORECAST_MONTHS = 3;

/**
 * G11: Hiring needs forecasting.
 * Compares projected demand (pipeline + active projects) against
 * available capacity to surface hiring recommendations.
 */
export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const { data: people, error: peopleError } = await supabase
      .from('employee_profiles')
      .select('id, department_id, employment_type')
      .eq('organization_id', membership.organization_id);
    if (peopleError) return supabaseError(peopleError);

    const { data: deals, error: dealError } = await supabase
      .from('deals')
      .select('id, value, stage, expected_close_date')
      .eq('organization_id', membership.organization_id)
      .not('stage', 'in', '("lost","closed_lost")');
    if (dealError) return supabaseError(dealError);

    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('user_id, hours')
      .eq('organization_id', membership.organization_id)
      .gte('date', new Date().toISOString().split('T')[0]);
    if (timeError) return supabaseError(timeError);

    const headcount = people?.length || 0;
    const currentCapacity = headcount * HOURS_PER_MONTH;

    const totalBookedHours = (timeEntries || []).reduce((sum, t) => {
      return sum + (Number(t.hours) || 0);
    }, 0);

    const pipelineValue = (deals || []).reduce((sum, d) => {
      return sum + (Number(d.value) || 0);
    }, 0);

    const estimatedHoursNeeded = pipelineValue / AVG_REVENUE_PER_HOUR;
    const capacityGap = estimatedHoursNeeded - currentCapacity * FORECAST_MONTHS;
    const hiresNeeded = Math.max(0, Math.ceil(capacityGap / (HOURS_PER_MONTH * FORECAST_MONTHS)));

    const departmentBreakdown: Record<string, number> = {};
    for (const person of people || []) {
      const dept = person.department_id || 'General';
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;
    }

    return apiSuccess({
      currentHeadcount: headcount,
      currentMonthlyCapacity: currentCapacity,
      totalBookedHours,
      pipelineValue,
      estimatedHoursNeeded: Math.round(estimatedHoursNeeded),
      capacityGap: Math.round(capacityGap),
      recommendedHires: hiresNeeded,
      departmentBreakdown,
      timeline: `Next ${FORECAST_MONTHS} months`,
    });
  } catch (err) {
    captureError(err, 'api.hiring.forecast.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
    });
    return serverError('Failed to generate hiring forecast');
  }
}
