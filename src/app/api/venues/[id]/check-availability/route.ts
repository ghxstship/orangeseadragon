import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/venues/:id/check-availability
 * 
 * Check venue availability for a date range.
 * Returns conflicting events if any.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id: venueId } = await params;
    const { start_date, end_date, organization_id } = await request.json();

    if (!start_date || !end_date || !organization_id) {
      return badRequest('start_date, end_date, and organization_id are required');
    }

    const { data, error } = await supabase.rpc('check_venue_availability', {
      p_venue_id: venueId,
      p_start_date: start_date,
      p_end_date: end_date,
      p_organization_id: organization_id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data?.[0] || data);
  } catch (error) {
    captureError(error, 'api.venues.id.check-availability.error');
    return serverError('Failed to check venue availability');
  }
}
