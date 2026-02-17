import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/crew/per-diem
 * 
 * Calculate per diem costs for a crew member over a date range
 * using their active rate card.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { employee_id, organization_id, start_date, end_date, include_travel_days } = await request.json();

    if (!employee_id || !organization_id || !start_date || !end_date) {
      return badRequest('employee_id, organization_id, start_date, and end_date are required');
    }

    const { data, error } = await supabase.rpc('calculate_per_diem', {
      p_employee_id: employee_id,
      p_organization_id: organization_id,
      p_start_date: start_date,
      p_end_date: end_date,
      p_include_travel_days: include_travel_days ?? true,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    captureError(error, 'api.crew.per-diem.error');
    return serverError('Failed to calculate per diem');
  }
}
