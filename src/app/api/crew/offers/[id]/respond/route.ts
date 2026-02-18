import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/crew/offers/[id]/respond
 * Accept or decline a crew offer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { action, decline_reason } = body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return badRequest('action must be "accept" or "decline"');
    }

    // Fetch the offer
    const { data: offer, error: fetchError } = await supabase
      .from('crew_offers')
      .select('id, status, user_id, expires_at, booking_id, organization_id, offered_by')
      .eq('id', id)
      .single();

    if (fetchError || !offer) {
      return notFound('Crew offer');
    }

    if (offer.status !== 'pending') {
      return badRequest(`Offer is already ${offer.status}`);
    }

    // Verify the responder is the offered crew member
    if (offer.user_id !== user.id) {
      return badRequest('Only the offered crew member can respond to this offer');
    }

    // Check expiration
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
      await supabase
        .from('crew_offers')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', id);
      return badRequest('This offer has expired');
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    // Update offer
    const { data: updated, error: updateError } = await supabase
      .from('crew_offers')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
        decline_reason: action === 'decline' ? decline_reason : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return supabaseError(updateError);
    }

    // If accepted, update the booking to confirmed
    if (action === 'accept') {
      await supabase
        .from('resource_bookings')
        .update({
          status: 'confirmed',
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', offer.booking_id);
    }

    // Notify the person who made the offer
    await supabase.from('notifications').insert({
      organization_id: offer.organization_id,
      user_id: offer.offered_by,
      type: action === 'accept' ? 'crew_offer_accepted' : 'crew_offer_declined',
      title: action === 'accept' ? 'Crew Offer Accepted' : 'Crew Offer Declined',
      message: action === 'accept'
        ? 'Your crew offer has been accepted'
        : `Your crew offer was declined${decline_reason ? `: ${decline_reason}` : ''}`,
      data: { offer_id: id, booking_id: offer.booking_id },
      entity_type: 'crew_offer',
      entity_id: id,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: offer.organization_id,
      user_id: user.id,
      action: `crew_offer_${newStatus}`,
      entity_type: 'crew_offer',
      entity_id: id,
      new_values: { action, decline_reason },
    });

    return apiSuccess(updated);
  } catch (e) {
    captureError(e, 'api.crew.offers.id.respond.error');
    return serverError('Failed to respond to offer');
  }
}
