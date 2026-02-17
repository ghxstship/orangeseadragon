import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

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
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id: employeeId } = await params;
    const { organization_id, origin_venue_id, destination_venue_id, event_date } = await request.json();

    if (!organization_id || !origin_venue_id || !destination_venue_id || !event_date) {
      return badRequest('organization_id, origin_venue_id, destination_venue_id, and event_date are required');
    }

    const { data, error } = await supabase.rpc('estimate_travel_schedule', {
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
    captureError(error, 'api.crew.id.travel-estimate.error');
    return serverError('Failed to estimate travel');
  }
}
