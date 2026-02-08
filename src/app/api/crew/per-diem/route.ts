import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/crew/per-diem
 * 
 * Calculate per diem costs for a crew member over a date range
 * using their active rate card.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { employee_id, organization_id, start_date, end_date, include_travel_days } = await request.json();

    if (!employee_id || !organization_id || !start_date || !end_date) {
      return badRequest('employee_id, organization_id, start_date, and end_date are required');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00084
    const { data, error } = await (supabase as any).rpc('calculate_per_diem', {
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
    console.error('Error calculating per diem:', error);
    return serverError();
  }
}
