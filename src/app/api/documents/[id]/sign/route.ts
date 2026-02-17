import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/documents/[id]/sign
 * Digitally sign a document (settlement, contract, call sheet, etc.)
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
    const {
      document_type,
      signature_data,
      signature_type = 'typed',
      signer_role,
      organization_id,
    } = body;

    if (!document_type || !signature_data || !organization_id) {
      return badRequest('document_type, signature_data, and organization_id are required');
    }

    const validTypes = ['settlement', 'contract', 'call_sheet', 'safety_plan', 'timesheet', 'expense_report', 'purchase_order'];
    if (!validTypes.includes(document_type)) {
      return badRequest(`document_type must be one of: ${validTypes.join(', ')}`);
    }

    // Get signer details
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const signerName = profile?.full_name || user.email || 'Unknown';
    const signerEmail = profile?.email || user.email;

    // Capture IP and user agent from request headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create the digital signature
    const { data: signature, error: signError } = await supabase
      .from('digital_signatures')
      .insert({
        organization_id,
        document_id: id,
        document_type,
        signer_id: user.id,
        signer_name: signerName,
        signer_email: signerEmail,
        signer_role: signer_role || null,
        signature_data,
        signature_type,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (signError) {
      return supabaseError(signError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id,
      user_id: user.id,
      action: 'document_signed',
      entity_type: document_type,
      entity_id: id,
      new_values: {
        signature_id: signature.id,
        signature_type,
        signer_name: signerName,
      },
    });

    return apiCreated(signature, {
      message: 'Document signed successfully',
    });
  } catch (e) {
    captureError(e, 'api.documents.id.sign.error');
    return serverError('Failed to sign document');
  }
}
