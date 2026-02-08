import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/crew/:id/travel-estimate
 * 
 * Estimate travel schedule and costs for a crew member between venues.
 * Returns recommended departure, travel mode, estimated hours,
 * per diem, hotel nights, and total travel cost.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id: employeeId } = await params;
    const { organization_id, origin_venue_id, destination_venue_id, event_date } = await request.json();

    if (!organization_id || !origin_venue_id || !destination_venue_id || !event_date) {
      return badRequest('organization_id, origin_venue_id, destination_venue_id, and event_date are required');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00088
    const { data, error } = await (supabase as any).rpc('estimate_travel_schedule', {
      p_employee_id: employeeId,
      p_organization_id: organization_id,
      p_origin_venue_id: origin_venue_id,
      p_destination_venue_id: destination_venue_id,
      p_event_date: event_date,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data?.[0] || data);
  } catch (error) {
    console.error('Error estimating travel schedule:', error);
    return serverError();
  }
}
