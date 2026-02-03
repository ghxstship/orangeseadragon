import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/registrations/[id]/cancel
 * Cancel a registration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServiceClient();
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
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Check if already cancelled
    if (registration.cancelled_at) {
      return NextResponse.json({ 
        error: 'Already cancelled',
        cancelled_at: registration.cancelled_at 
      }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      registration: data,
      message: 'Registration cancelled'
    });
  } catch (e) {
    console.error('[API] Cancel error:', e);
    return NextResponse.json({ error: 'Cancellation failed' }, { status: 500 });
  }
}
