import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/check-in/scan
 * Process a QR code scan for check-in
 * Accepts either a registration confirmation number or credential number
 */
export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {

    const body = await request.json();
    const { code, event_id, checkpoint_id } = body;

    if (!code) {
      return badRequest('Code is required');
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
        return badRequest('Registration is for a different event');
      }

      // Check if already checked in
      if (registration.checked_in_at) {
        return apiSuccess({
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
        return supabaseError(error);
      }

      return apiCreated({
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
        return badRequest('Credential is for a different event');
      }

      // Check credential status
      if (credential.revoked_at) {
        return badRequest('Credential has been revoked');
      }

      if (credential.suspended_at) {
        return badRequest('Credential is suspended');
      }

      // Check validity period
      const now = new Date();
      if (credential.valid_from && new Date(credential.valid_from) > now) {
        return badRequest('Credential is not yet valid');
      }

      if (credential.valid_until && new Date(credential.valid_until) < now) {
        return badRequest('Credential has expired');
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

      return apiSuccess({
        type: 'credential',
        credential,
        access_level: credential.credential_type?.access_level,
        message: `Access granted: ${credential.credential_type?.name}`
      });
    }

    // Not found
    return notFound('Invalid code - no matching registration or credential found');

  } catch (e) {
    captureError(e, 'api.check-in.scan.error');
    return serverError('Scan processing failed');
  }
}
