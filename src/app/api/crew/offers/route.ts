import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/crew/offers
 * Create a crew offer (offer → accept/decline → confirm workflow)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const {
      booking_id,
      user_id: crew_user_id,
      rate_amount,
      rate_currency = 'USD',
      rate_type = 'daily',
      message,
      expires_at,
      organization_id,
    } = body;

    if (!booking_id || !crew_user_id || !organization_id) {
      return badRequest('booking_id, user_id, and organization_id are required');
    }

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('resource_bookings')
      .select('id, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return notFound('Resource booking');
    }

    // Check for existing pending offer
    const { data: existing } = await supabase
      .from('crew_offers')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('user_id', crew_user_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return badRequest('A pending offer already exists for this crew member on this booking');
    }

    // Create the offer
    const { data: offer, error: createError } = await supabase
      .from('crew_offers')
      .insert({
        organization_id,
        booking_id,
        user_id: crew_user_id,
        offered_by: user.id,
        rate_amount,
        rate_currency,
        rate_type,
        message,
        expires_at: expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (createError) {
      return supabaseError(createError);
    }

    // Notify crew member
    await supabase.from('notifications').insert({
      organization_id,
      user_id: crew_user_id,
      type: 'crew_offer_received',
      title: 'New Crew Offer',
      message: message || 'You have received a new crew offer',
      data: { offer_id: offer.id, booking_id },
      entity_type: 'crew_offer',
      entity_id: offer.id,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id,
      user_id: user.id,
      action: 'crew_offer_created',
      entity_type: 'crew_offer',
      entity_id: offer.id,
      new_values: { booking_id, crew_user_id, rate_amount, rate_type },
    });

    return apiCreated(offer);
  } catch (e) {
    captureError(e, 'api.crew.offers.error');
    return serverError('Failed to create crew offer');
  }
}

/**
 * GET /api/crew/offers
 * List crew offers (filterable by booking_id, user_id, status)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('booking_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase.from('crew_offers').select('*').is('deleted_at', null).order('created_at', { ascending: false });

    if (bookingId) query = query.eq('booking_id', bookingId);
    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    captureError(e, 'api.crew.offers.error');
    return serverError('Failed to list crew offers');
  }
}
