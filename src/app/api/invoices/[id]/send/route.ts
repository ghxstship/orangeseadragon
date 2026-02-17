import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/invoices/:id/send
 * 
 * Send an invoice to a client via email. Creates a delivery record
 * and updates invoice status to 'sent'.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePolicy('finance.approve');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id: invoiceId } = await params;
    const body = await request.json();
    const {
      recipient_email,
      recipient_name,
      subject,
      email_body,
      cc_emails,
      bcc_emails,
      include_pdf,
      include_timesheet,
    } = body;

    if (!recipient_email) {
      return badRequest('recipient_email is required');
    }

    // Fetch the invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return notFound('Invoice');
    }

    // Create delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('invoice_deliveries')
      .insert({
        organization_id: invoice.organization_id,
        invoice_id: invoiceId,
        recipient_email,
        recipient_name: recipient_name || null,
        subject: subject || `Invoice ${invoice.invoice_number}`,
        body: email_body || null,
        cc_emails: cc_emails || [],
        bcc_emails: bcc_emails || [],
        include_pdf: include_pdf ?? true,
        include_timesheet: include_timesheet ?? false,
        status: 'pending',
        sent_by: user.id,
      })
      .select()
      .single();

    if (deliveryError) {
      return supabaseError(deliveryError);
    }

    // Update invoice status to 'sent' if currently draft
    if (invoice.status === 'draft') {
      await supabase
        .from('invoices')
        .update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', invoiceId);
    }

    await supabase.from('activity_feed').insert({
      organization_id: invoice.organization_id,
      actor_id: user.id,
      activity_type: 'invoice_sent',
      title: `Invoice ${invoice.invoice_number} sent`,
      entity_type: 'invoice',
      entity_id: invoiceId,
      metadata: { recipient_email, invoice_number: invoice.invoice_number },
    });

    return apiSuccess({
      delivery_id: delivery.id,
      status: 'pending',
    }, { message: `Invoice ${invoice.invoice_number} queued for delivery to ${recipient_email}` });
  } catch (error) {
    const invoiceIdForLog = (await params).id;
    captureError(error, 'api.invoice_send.unhandled', { invoice_id: invoiceIdForLog });
    return serverError('Failed to send invoice');
  }
}
