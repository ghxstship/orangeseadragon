import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/check-in/scan
 * Process a QR code scan for check-in
 * Accepts either a registration confirmation number or credential number
 */
export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, event_id, checkpoint_id } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Try to find by registration confirmation number first
    const { data: registration } = await supabase
      .from('event_registrations')
      .select(`
        *,
        contact:contacts(*),
        event:events(*),
        registration_type:registration_types(*)
      `)
      .eq('confirmation_number', code)
      .single();

    if (registration) {
      // Check if event matches (if event_id provided)
      if (event_id && registration.event_id !== event_id) {
        return NextResponse.json({
          error: 'Registration is for a different event',
          registration_event: registration.event?.name
        }, { status: 400 });
      }

      // Check if already checked in
      if (registration.checked_in_at) {
        return NextResponse.json({
          success: false,
          already_checked_in: true,
          checked_in_at: registration.checked_in_at,
          registration,
          message: 'Already checked in'
        });
      }

      // Perform check-in
      const { data: updated, error } = await supabase
        .from('event_registrations')
        .update({
          checked_in_at: new Date().toISOString(),
          checked_in_by: user.id,
        })
        .eq('id', registration.id)
        .select(`
          *,
          contact:contacts(*),
          event:events(*),
          registration_type:registration_types(*)
        `)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        type: 'registration',
        registration: updated,
        message: `Welcome, ${updated?.contact?.first_name || 'Guest'}!`
      });
    }

    // Try to find by credential number
    const { data: credential } = await supabase
      .from('issued_credentials')
      .select(`
        *,
        holder:contacts(*),
        credential_type:credential_types(*),
        event:events(*)
      `)
      .eq('credential_number', code)
      .single();

    if (credential) {
      // Check if event matches (if event_id provided)
      if (event_id && credential.event_id !== event_id) {
        return NextResponse.json({
          error: 'Credential is for a different event',
          credential_event: credential.event?.name
        }, { status: 400 });
      }

      // Check credential status
      if (credential.revoked_at) {
        return NextResponse.json({
          success: false,
          error: 'Credential has been revoked',
          revoked_reason: credential.revoked_reason
        }, { status: 400 });
      }

      if (credential.suspended_at) {
        return NextResponse.json({
          success: false,
          error: 'Credential is suspended',
          suspended_reason: credential.suspended_reason
        }, { status: 400 });
      }

      // Check validity period
      const now = new Date();
      if (credential.valid_from && new Date(credential.valid_from) > now) {
        return NextResponse.json({
          success: false,
          error: 'Credential is not yet valid',
          valid_from: credential.valid_from
        }, { status: 400 });
      }

      if (credential.valid_until && new Date(credential.valid_until) < now) {
        return NextResponse.json({
          success: false,
          error: 'Credential has expired',
          valid_until: credential.valid_until
        }, { status: 400 });
      }

      // Log the access
      await supabase
        .from('credential_access_log')
        .insert({
          credential_id: credential.id,
          checkpoint_id: checkpoint_id || null,
          access_type: 'entry',
          scanned_by: user.id,
        });

      // Activate credential if not already
      if (!credential.activated_at) {
        await supabase
          .from('issued_credentials')
          .update({ activated_at: new Date().toISOString() })
          .eq('id', credential.id);
      }

      return NextResponse.json({
        success: true,
        type: 'credential',
        credential,
        access_level: credential.credential_type?.access_level,
        message: `Access granted: ${credential.credential_type?.name}`
      });
    }

    // Not found
    return NextResponse.json({
      success: false,
      error: 'Invalid code - no matching registration or credential found'
    }, { status: 404 });

  } catch (e) {
    console.error('[API] Scan error:', e);
    return NextResponse.json({ error: 'Scan processing failed' }, { status: 500 });
  }
}
