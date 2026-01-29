import { createUntypedClient as createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/registrations/[id]/check-in
 * Check in a registration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the registration
    const { data: registration, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*, status:statuses(*)')
      .eq('id', id)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Check if already checked in
    if (registration.checked_in_at) {
      return NextResponse.json({ 
        error: 'Already checked in',
        checked_in_at: registration.checked_in_at 
      }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      registration: data,
      message: 'Check-in successful'
    });
  } catch (e) {
    console.error('[API] Check-in error:', e);
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 });
  }
}
