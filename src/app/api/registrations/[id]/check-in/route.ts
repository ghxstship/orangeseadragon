import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/registrations/[id]/check-in
 * Check in a registration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // Get the registration
    const { data: registration, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*, status:statuses(*)')
      .eq('id', id)
      .single();

    if (fetchError || !registration) {
      return notFound('Registration');
    }

    // Check if already checked in
    if (registration.checked_in_at) {
      return badRequest('Already checked in', { checked_in_at: registration.checked_in_at });
    }

    // Update the registration
    const { data, error } = await supabase
      .from('event_registrations')
      .update({
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data, { message: 'Check-in successful' });
  } catch (e) {
    console.error('[API] Check-in error:', e);
    return serverError('Check-in failed');
  }
}
