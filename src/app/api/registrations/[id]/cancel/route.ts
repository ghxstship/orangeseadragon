import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/registrations/[id]/cancel
 * Cancel a registration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await params;

  try {
    const body = await request.json();
    const { reason } = body;

    // Get the registration
    const { data: registration, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !registration) {
      return notFound('Registration');
    }

    // Check if already cancelled
    if (registration.cancelled_at) {
      return badRequest('Already cancelled');
    }

    // Get cancelled status
    const { data: cancelledStatus } = await supabase
      .from('statuses')
      .select('id')
      .eq('domain', 'registration')
      .eq('code', 'cancelled')
      .single();

    // Update the registration
    const { data, error } = await supabase
      .from('event_registrations')
      .update({
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
        status_id: cancelledStatus?.id || registration.status_id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data, { message: 'Registration cancelled' });
  } catch (e) {
    captureError(e, 'api.registrations.id.cancel.error');
    return serverError('Cancellation failed');
  }
}
