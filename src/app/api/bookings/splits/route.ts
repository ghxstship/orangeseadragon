import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/bookings/splits
 * Split a resource booking across multiple projects with allocation percentages.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { booking_id, splits } = body;

    if (!booking_id) {
      return badRequest('booking_id is required');
    }

    if (!splits || !Array.isArray(splits) || splits.length < 2) {
      return badRequest('At least 2 splits are required');
    }

    // Validate total allocation = 100%
    const totalAllocation = splits.reduce(
      (sum: number, s: { allocation_pct: number }) => sum + (s.allocation_pct || 0),
      0
    );
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return badRequest(`Split allocations must total 100%. Current total: ${totalAllocation}%`);
    }

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('resource_bookings')
      .select('id, organization_id, user_id, start_date, end_date')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return notFound('Resource booking');
    }

    // Create split records
    const splitRecords = splits.map((s: { project_id: string; allocation_pct: number; start_date?: string; end_date?: string; notes?: string }) => ({
      organization_id: booking.organization_id,
      booking_id,
      project_id: s.project_id,
      allocation_pct: s.allocation_pct,
      start_date: s.start_date || booking.start_date,
      end_date: s.end_date || booking.end_date,
      notes: s.notes || null,
      created_by: user.id,
    }));

    const { data: created, error: insertError } = await supabase
      .from('booking_splits')
      .insert(splitRecords)
      .select();

    if (insertError) {
      return supabaseError(insertError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: booking.organization_id,
      user_id: user.id,
      action: 'booking_split_created',
      entity_type: 'resource_booking',
      entity_id: booking_id,
      new_values: {
        split_count: splits.length,
        allocations: splits.map((s: { project_id: string; allocation_pct: number }) => ({
          project_id: s.project_id,
          pct: s.allocation_pct,
        })),
      },
    });

    return apiCreated(created, {
      message: `Booking split into ${splits.length} allocations`,
      booking_id,
    });
  } catch (e) {
    console.error('[API] Booking split error:', e);
    return serverError('Failed to create booking split');
  }
}

/**
 * GET /api/bookings/splits
 * List booking splits, filtered by booking_id or project_id.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('booking_splits')
      .select('*, resource_bookings(user_id, start_date, end_date, status)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (!bookingId && !projectId) {
      return badRequest('Either booking_id or project_id filter is required');
    }

    const { data, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    console.error('[API] Booking splits list error:', e);
    return serverError('Failed to list booking splits');
  }
}
